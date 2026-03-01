import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactElement,
} from "react";
import MapView, { Polyline, Marker, Circle, MapType } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import dayjs from "dayjs";
import { useRunDB } from "@/hooks/useSQLite";
import { useRunStore } from "@/store/runStore";
import { useSettingsStore } from "@/store/settingsStore";
import { secondFormatHours, getPaceLabel } from "@/utils/util";
import { RunRecord, TrackPoint } from "@/types/runType";
import Toast from "react-native-toast-message";
import {
  exportRunAsJSON,
  exportRunAsGPX,
  exportRunAsCSV,
  ExportFormat,
} from "@/utils/exportRun";
import RunCharts from "@/components/RunCharts";
import {
  trackPointsToCoordinates,
  filterValidCoordinates,
} from "@/utils/map/coordinates";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RunSummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ runId: string; mode?: string }>();
  const { updateRun, deleteRun, getRunById, getTrackPoints } = useRunDB();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState<
    {
      latitude: number;
      longitude: number;
      timestamp?: number;
      altitude?: number;
    }[]
  >([]);
  const [runData, setRunData] = useState<RunRecord | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 30.9042,
    longitude: 122.4074,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const runStore = useRunStore();
  const settingsStore = useSettingsStore();
  const mapRef = useRef<MapView>(null);

  // 本地地图类型（不影响全局设置）
  const [localMapType, setLocalMapType] = useState<MapType>(
    settingsStore.settings.map.mapType as MapType,
  );

  // 路径动画状态
  const [visibleRoutePoints, setVisibleRoutePoints] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // 使用 ref 避免依赖数组问题
  const isAnimatingRef = useRef(false);
  const visibleCountRef = useRef(0);
  const routePointsRef = useRef(routePoints);

  // 同步 ref 和 state
  useEffect(() => {
    routePointsRef.current = routePoints;
  }, [routePoints]);

  // BottomSheet 引用和配置
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "95%"], []);

  const runId = Number(params.runId || 0);
  const isViewMode = params.mode === "view"; // 查看模式（历史记录）
  const hasLoaded = useRef(false);

  // 获取当前颜色模式
  const { colorScheme } = useColorScheme();

  // 加载跑步数据和轨迹
  const loadRunData = useCallback(async () => {
    if (!runId || hasLoaded.current) return;

    try {
      setIsLoading(true);
      hasLoaded.current = true;

      // 获取跑步记录
      const run = await getRunById(runId);
      if (run) {
        setRunData(run);
        // 如果有保存的标题和备注，显示出来
        if (run.title) setTitle(run.title);
        if (run.note) setNote(run.note);
      }

      // 获取轨迹点并过滤无效坐标
      const points = await getTrackPoints(runId);
      const mappedPoints = trackPointsToCoordinates(points);
      setRoutePoints(mappedPoints);

      console.log(points);
      // 设置地图适配所有坐标点
      if (mappedPoints.length > 0) {
        // 延迟一点执行 fitToCoordinates，确保 MapView 已经渲染
        setTimeout(() => {
          if (mapRef.current && mappedPoints.length > 0) {
            // 过滤有效坐标
            const validPoints = filterValidCoordinates(mappedPoints);
            if (validPoints.length > 0) {
              if (validPoints.length === 1) {
                // 只有一个点，设置固定缩放
                setMapRegion({
                  latitude: validPoints[0].latitude,
                  longitude: validPoints[0].longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                });
              } else {
                // 多个点，自动适配
                mapRef.current.fitToCoordinates(validPoints, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error("加载跑步数据失败:", error);
      Alert.alert(t("common.error"), t("run.loadFailed"));
      hasLoaded.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  // 页面加载时获取数据
  useEffect(() => {
    loadRunData();
  }, [loadRunData]);

  // 路径动画效果 - 使用 requestAnimationFrame
  useEffect(() => {
    // 需要至少2个点才启动动画，使用 ref 避免重复触发
    if (
      routePoints.length >= 2 &&
      !isAnimatingRef.current &&
      visibleCountRef.current === 0
    ) {
      isAnimatingRef.current = true;
      setIsAnimating(true);

      const totalPoints = routePoints.length;
      const duration = 2000; // 2秒
      const startTime = Date.now();

      // 缓动函数：ease-out
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOut(progress);

        // 计算可见点数量，至少2个点
        const visibleCount = Math.max(
          2,
          Math.floor(easedProgress * totalPoints),
        );

        // 只有当点数量变化时才更新状态
        if (visibleCount !== visibleCountRef.current) {
          visibleCountRef.current = visibleCount;
          const newPoints = routePoints.slice(0, visibleCount);
          setVisibleRoutePoints(newPoints);
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // 动画完成，显示所有点
          visibleCountRef.current = routePoints.length;
          setVisibleRoutePoints(routePoints);
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [routePoints]); // 只依赖 routePoints，避免重复触发

  // 重播路径动画
  const replayAnimation = () => {
    if (routePoints.length >= 2 && !isAnimatingRef.current) {
      // 重置 ref 和 state
      isAnimatingRef.current = true;
      visibleCountRef.current = 0;
      setIsAnimating(true);
      setVisibleRoutePoints([]);

      const totalPoints = routePoints.length;
      const duration = 2000;
      const startTime = Date.now();

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOut(progress);

        const visibleCount = Math.max(
          2,
          Math.floor(easedProgress * totalPoints),
        );

        // 只有当点数量变化时才更新状态
        if (visibleCount !== visibleCountRef.current) {
          visibleCountRef.current = visibleCount;
          const newPoints = routePoints.slice(0, visibleCount);
          setVisibleRoutePoints(newPoints);
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // 动画完成
          visibleCountRef.current = routePoints.length;
          setVisibleRoutePoints(routePoints);
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // 从数据库数据计算显示值
  const distance = runData?.distance || 0;
  const duration = runData?.time || 0;
  const pace = runData?.pace || 0;
  const calories = runData?.energy || 0;
  const startTime = runData?.startTime || Date.now();
  const endTime = runData?.endTime || Date.now();
  const totalSteps = runData?.steps || 0;
  const elevationGain = runData?.elevationGain || 0;

  // 计算详细统计数据
  // 步频 (steps per minute)
  const cadence =
    totalSteps > 0 && duration > 0
      ? Math.round((totalSteps / duration) * 60)
      : 0;

  // 步幅 (米/步)
  const strideLength =
    totalSteps > 0 && distance > 0
      ? (distance / totalSteps / 1000).toFixed(2)
      : "0.00";

  // 计算海拔数据 (从 track_points)
  const altitudeStats = useMemo(() => {
    if (!routePoints || routePoints.length === 0) {
      return { max: 0, min: 0, gain: elevationGain, loss: 0 };
    }

    let maxAlt = -Infinity;
    let minAlt = Infinity;
    let gain = 0;
    let loss = 0;
    let prevAlt: number | null = null;

    routePoints.forEach((point: any) => {
      const alt = point.altitude;
      if (alt != null && !isNaN(alt)) {
        maxAlt = Math.max(maxAlt, alt);
        minAlt = Math.min(minAlt, alt);

        if (prevAlt !== null) {
          const diff = alt - prevAlt;
          if (diff > 0) gain += diff;
          else loss += Math.abs(diff);
        }
        prevAlt = alt;
      }
    });

    return {
      max: maxAlt === -Infinity ? 0 : Math.round(maxAlt),
      min: minAlt === Infinity ? 0 : Math.round(minAlt),
      gain: Math.round(gain) || elevationGain,
      loss: Math.round(loss),
    };
  }, [routePoints, elevationGain]);

  // 计算图表数据
  const chartData = useMemo(() => {
    if (!routePoints || routePoints.length < 2) {
      return { paceTrend: [], altitudeProfile: [], paceDistribution: [] };
    }

    const paceTrend: { x: number; y: number }[] = [];
    const altitudeProfile: { x: number; y: number }[] = [];
    const paceDistribution: { x: string; y: number }[] = [];

    let accumulatedDist = 0;
    let lastPoint = routePoints[0];
    let lastTimestamp = lastPoint.timestamp || startTime;

    // 采样点（每隔 N 个点取一个，避免数据过多）
    const sampleInterval = Math.max(1, Math.floor(routePoints.length / 50));

    routePoints.forEach((point: any, index: number) => {
      if (index % sampleInterval === 0) {
        const currentTimestamp = point.timestamp || lastTimestamp;
        const timeDiff = (currentTimestamp - lastTimestamp) / 1000; // 秒

        if (index > 0 && timeDiff > 0) {
          // 计算距离
          const R = 6371000;
          const lat1 = (lastPoint.latitude * Math.PI) / 180;
          const lat2 = (point.latitude * Math.PI) / 180;
          const deltaLat =
            ((point.latitude - lastPoint.latitude) * Math.PI) / 180;
          const deltaLon =
            ((point.longitude - lastPoint.longitude) * Math.PI) / 180;
          const a =
            Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) *
              Math.cos(lat2) *
              Math.sin(deltaLon / 2) *
              Math.sin(deltaLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const dist = R * c;

          accumulatedDist += dist;

          // 瞬时配速（秒/公里）
          const instantPace = dist > 0 ? timeDiff / (dist / 1000) : 0;
          if (instantPace > 0 && instantPace < 600) {
            // 过滤异常值（< 10分钟/公里）
            paceTrend.push({
              x: Math.round(accumulatedDist / 100) / 10, // 距离（公里，保留1位小数）
              y: Math.round(instantPace),
            });
          }
        }

        // 海拔数据
        if (point.altitude != null && !isNaN(point.altitude)) {
          altitudeProfile.push({
            x: Math.round(accumulatedDist / 100) / 10,
            y: Math.round(point.altitude),
          });
        }

        lastPoint = point;
        lastTimestamp = currentTimestamp;
      }
    });

    return { paceTrend, altitudeProfile, paceDistribution };
  }, [routePoints, startTime]);

  // 计算分段配速（每公里）
  const lapPaces = useMemo(() => {
    if (!routePoints || routePoints.length < 2 || distance <= 0) {
      return [];
    }

    // 计算两点间距离（米）- 在 useMemo 内部定义
    const calculateDistance = (p1: any, p2: any): number => {
      const R = 6371000; // 地球半径（米）
      const lat1 = (p1.latitude * Math.PI) / 180;
      const lat2 = (p2.latitude * Math.PI) / 180;
      const deltaLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
      const deltaLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(deltaLon / 2) *
          Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    };

    const laps: { km: number; pace: number; time: number }[] = [];
    const totalKm = distance / 1000;
    let currentKm = 1;
    let lastPoint = routePoints[0];
    let accumulatedDist = 0;
    let accumulatedTime = 0;

    for (let i = 1; i < routePoints.length; i++) {
      const point = routePoints[i];

      // 检查 timestamp 是否存在
      if (!point.timestamp || !lastPoint.timestamp) {
        lastPoint = point;
        continue;
      }

      const dist = calculateDistance(lastPoint, point);
      const time = (point.timestamp - lastPoint.timestamp) / 1000; // 转换为秒

      accumulatedDist += dist;
      accumulatedTime += time;

      // 每累积1公里记录一次
      while (accumulatedDist >= 1000 && currentKm <= Math.floor(totalKm)) {
        const pace = accumulatedTime / (accumulatedDist / 1000); // 秒/公里
        laps.push({
          km: currentKm,
          pace: Math.round(pace),
          time: accumulatedTime,
        });

        accumulatedDist -= 1000;
        accumulatedTime = 0;
        currentKm++;
      }

      lastPoint = point;
    }

    // 处理剩余距离（最后一小段）
    if (accumulatedDist > 100 && currentKm <= Math.ceil(totalKm)) {
      const remainingKm = accumulatedDist / 1000;
      const pace = accumulatedTime / remainingKm;
      laps.push({
        km: currentKm,
        pace: Math.round(pace),
        time: accumulatedTime,
      });
    }

    return laps;
  }, [routePoints, distance]);

  const defaultTitle = `${t("history.outdoorRun")}`;

  // 保存跑步记录
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await updateRun({
        id: runId,
        title: title || defaultTitle,
        note,
        isFinish: 1,
      });

      // 重置跑步状态
      runStore.reset();

      // 跳转到首页
      router.replace("/(tabs)");
    } catch (error) {
      console.error("保存失败:", error);
      Alert.alert(t("common.error"), t("run.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  // 放弃跑步记录
  const handleDiscard = () => {
    Alert.alert(t("run.discardTitle"), t("run.discardMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("run.discard"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRun(runId);
            runStore.reset();
            router.replace("/(tabs)");
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "删除失败",
              visibilityTime: 2000,
            });
          }
        },
      },
    ]);
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  // 导出跑步数据
  const handleExport = () => {
    if (!runData) return;

    const options = [
      { text: "JSON (完整数据)", onPress: () => doExport("json") },
      { text: "GPX (轨迹文件)", onPress: () => doExport("gpx") },
      { text: "CSV (表格数据)", onPress: () => doExport("csv") },
      { text: "取消", style: "cancel" as const },
    ];

    Alert.alert(
      t("run.exportTitle") || "导出跑步数据",
      t("run.exportMessage") || "选择导出格式",
      options,
    );
  };

  // 执行导出
  const doExport = async (format: ExportFormat) => {
    try {
      // 获取轨迹点 - 总是从数据库获取完整的 TrackPoint 数据
      // 避免使用被简化的 routePoints（缺少 heading、timestamp、altitude）
      const points = await getTrackPoints(runId);

      if (points.length === 0) {
        Alert.alert(
          t("common.warning") || "无轨迹数据",
          t("run.noTrackPoints") || "没有找到该跑步记录的轨迹数据",
        );
        return;
      }

      switch (format) {
        case "json":
          await exportRunAsJSON(runData!, points);
          break;
        case "gpx":
          await exportRunAsGPX(runData!, points);
          break;
        case "csv":
          await exportRunAsCSV(runData!, points);
          break;
      }
    } catch (error) {
      console.error("导出失败:", error);
      Alert.alert(
        t("common.error") || "导出失败",
        t("run.exportError") || "导出跑步数据失败，请重试",
      );
    }
  };

  // 生成渐变色路线段
  const generateGradientRoute = (points: typeof routePoints) => {
    if (!points || points.length <= 1) return null;

    const segments: ReactElement[] = [];
    const totalPoints = points.length;
    const maxSegments = 50; // 最多50段，保证性能
    const step = Math.max(1, Math.floor((totalPoints - 1) / maxSegments));

    for (let i = 0; i < totalPoints - 1; i += step) {
      const progress = Math.min(i / (totalPoints - 1), 1);
      const nextIndex = Math.min(i + step, totalPoints - 1);

      // 获取切片并验证坐标有效性
      const slice = points.slice(i, nextIndex + 1);
      if (slice.length < 2) continue;

      // 渐变色：绿色(开始) -> 黄色(中间) -> 红色(结束)
      let color: string;
      if (progress < 0.5) {
        // 绿色 (#22c55e) 到黄色 (#facc15)
        const p = progress * 2;
        const r = Math.round(34 + (250 - 34) * p);
        const g = Math.round(197 + (204 - 197) * p);
        const b = Math.round(94 + (21 - 94) * p);
        color = `rgb(${r}, ${g}, ${b})`;
      } else {
        // 黄色 (#facc15) 到红色 (#ef4444)
        const p = (progress - 0.5) * 2;
        const r = Math.round(250 + (239 - 250) * p);
        const g = Math.round(204 + (68 - 204) * p);
        const b = Math.round(21 + (68 - 21) * p);
        color = `rgb(${r}, ${g}, ${b})`;
      }

      segments.push(
        <Polyline
          key={`segment-${i}`}
          coordinates={slice}
          strokeColor={color}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />,
      );
    }
    return segments;
  };

  // 加载中状态
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 justify-center items-center">
        <Text className="text-slate-500 dark:text-slate-400">
          {t("common.loading")}...
        </Text>
      </SafeAreaView>
    );
  }

  // 数据不存在
  if (!runData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 justify-center items-center">
        <Text className="text-slate-500 dark:text-slate-400">
          {t("run.notFound")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-indigo-600">{t("common.back")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // 统计数据卡片
  const StatCard = ({
    icon,
    value,
    unit,
    label,
    color = "#6366f1",
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    value: string | number;
    unit?: string;
    label: string;
    color?: string;
  }) => (
    <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex-1 mx-1 items-center">
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text className="text-2xl font-bold text-slate-800 dark:text-white mt-2 whitespace-nowrap">
        {value}
        {unit && (
          <Text className="text-sm font-normal text-slate-400"> {unit}</Text>
        )}
      </Text>
      <Text className="text-xs text-slate-400 mt-1">{label}</Text>
    </View>
  );

  // 渲染顶部导航栏
  const renderHeader = () => {
    if (isViewMode) {
      // 查看模式：显示返回按钮和导出按钮
      return (
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-800">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#6366f1" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-800 dark:text-white">
            {t("run.detail")}
          </Text>
          <TouchableOpacity onPress={handleExport} className="p-2">
            <Ionicons name="share-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
      );
    }

    // 编辑模式：显示保存/放弃按钮
    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-800">
        <TouchableOpacity onPress={handleDiscard} className="p-2">
          <Text className="text-red-500 font-medium">{t("run.discard")}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 dark:text-white">
          {t("run.summary")}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className="p-2"
        >
          <Text
            className={`font-medium ${isSaving ? "text-slate-400" : "text-indigo-600"}`}
          >
            {isSaving ? t("common.saving") : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      edges={["top"]}
    >
      {/* 顶部导航 */}
      {renderHeader()}

      {/* 主要内容区域 - 使用 Flex 布局 */}
      <View className="flex-1">
        {/* 地图区域 - 全屏，BottomSheet 会覆盖在上方 */}
        <View className="absolute inset-0">
          <MapView
            ref={mapRef}
            style={{ width: SCREEN_WIDTH, height: "100%" }}
            region={mapRegion}
            mapType={localMapType}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
          >
            {/* 路径和标记 - 使用动画控制的可见点 */}
            {visibleRoutePoints.length > 0 && (
              <>
                {/* 动画路线 */}
                <Polyline
                  coordinates={visibleRoutePoints}
                  strokeColor="#6366f1"
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                />

                {/* 起点标记 */}
                <Marker
                  coordinate={visibleRoutePoints[0]}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#22c55e",
                      borderWidth: 3,
                      borderColor: "white",
                    }}
                  />
                </Marker>

                {/* 终点标记 - 只在动画完成或至少2个点时显示 */}
                {visibleRoutePoints.length > 1 && (
                  <Marker
                    coordinate={
                      visibleRoutePoints[visibleRoutePoints.length - 1]
                    }
                    anchor={{ x: 0.5, y: 0.5 }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: "#ef4444",
                        borderWidth: 3,
                        borderColor: "white",
                      }}
                    />
                  </Marker>
                )}
              </>
            )}
          </MapView>

          {/* 日期标签 */}
          <View className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs">
              {dayjs(startTime).format("YYYY-MM-DD HH:mm")} -{" "}
              {dayjs(endTime).format("HH:mm")}
            </Text>
          </View>

          {/* 路线图例 - 位置根据 BottomSheet 最低高度(25%)计算 */}
          <View
            className="absolute right-3 bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg shadow-sm"
            style={{ bottom: 230 }} // 刚好在 BottomSheet 25% (约 200-220px) 上方一点
          >
            <View className="flex-row items-center">
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#22c55e",
                }}
              />
              <Text className="text-xs text-slate-600 dark:text-slate-300 ml-1 mr-3">
                起
              </Text>
              <View
                style={{
                  width: 30,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#facc15",
                }}
              />
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#ef4444",
                  marginLeft: 6,
                }}
              />
              <Text className="text-xs text-slate-600 dark:text-slate-300 ml-1">
                终
              </Text>
            </View>
          </View>

          {/* 地图类型切换按钮 */}
          <View
            className="absolute top-3 right-3 flex-row bg-white/90 dark:bg-slate-800/90 rounded-full shadow-sm overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            {(["standard", "satellite", "hybrid"] as MapType[]).map(
              (type, index) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setLocalMapType(type)}
                  className={`px-3 py-2 ${index !== 2 ? "border-r border-slate-200 dark:border-slate-700" : ""}`}
                  style={{
                    backgroundColor:
                      localMapType === type ? "#6366f1" : "transparent",
                  }}
                >
                  <Text
                    className={`text-xs font-medium ${
                      localMapType === type
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {t(`map.type.${type}`) ||
                      (type === "standard"
                        ? "标准"
                        : type === "satellite"
                          ? "卫星"
                          : "混合")}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          {/* 重播动画按钮 - 位置根据 BottomSheet 最低高度(25%)计算 */}
          <TouchableOpacity
            onPress={replayAnimation}
            className="absolute bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-sm"
            style={{
              bottom: 230, // 刚好在 BottomSheet 25% (约 200-220px) 上方一点
              left: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="play-outline" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* 可拖动的底部数据卡片 - BottomSheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableOverDrag={false}
          backgroundStyle={{
            backgroundColor: colorScheme === "dark" ? "#1e293b" : "#ffffff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
          handleIndicatorStyle={{
            backgroundColor: colorScheme === "dark" ? "#475569" : "#cbd5e1",
            width: 36,
            height: 5,
            borderRadius: 3,
          }}
        >
          <BottomSheetView className="flex-1 px-4 pt-2 pb-8">
            {/* 距离 - 大字体突出显示 */}
            <View className="items-center mb-6">
              <Text
                className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {(distance / 1000).toFixed(2)}
              </Text>
              <Text className="text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {t("unit.km")}
              </Text>
            </View>

            {/* 统计数据网格 */}
            <View className="flex-row justify-between px-2">
              <View className="items-center flex-1">
                <Ionicons name="time-outline" size={20} color="#6366f1" />
                <Text className="text-lg font-semibold text-slate-800 dark:text-white mt-1">
                  {secondFormatHours(duration)}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {t("common.time")}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Ionicons
                  name="speedometer-outline"
                  size={20}
                  color="#10b981"
                />
                <Text className="text-lg font-semibold text-slate-800 dark:text-white mt-1">
                  {getPaceLabel(pace)}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {t("activity.pace")}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Ionicons name="flame-outline" size={20} color="#f97316" />
                <Text className="text-lg font-semibold text-slate-800 dark:text-white mt-1">
                  {calories}
                </Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  {t("activity.energy")}
                </Text>
              </View>
            </View>

            {/* 详细统计区域 - 始终显示 */}
            <View className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
                {t("run.detailedStats") || "详细统计"}
              </Text>
              <View className="flex-row justify-between">
                {/* 步频 */}
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-slate-800 dark:text-white">
                    {cadence > 0 ? cadence : "--"}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("run.cadence") || "步频"}
                  </Text>
                  <Text className="text-xs text-slate-400">spm</Text>
                </View>
                {/* 步幅 */}
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-slate-800 dark:text-white">
                    {cadence > 0 ? strideLength : "--"}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("run.stride") || "步幅"}
                  </Text>
                  <Text className="text-xs text-slate-400">m</Text>
                </View>
                {/* 海拔 */}
                <View className="items-center flex-1">
                  <Text className="text-xl font-bold text-slate-800 dark:text-white">
                    {altitudeStats.gain > 0 ? altitudeStats.gain : "--"}
                  </Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("run.elevation") || "爬升"}
                  </Text>
                  <Text className="text-xs text-slate-400">m</Text>
                </View>
              </View>
            </View>

            {/* 分段配速列表 */}
            {lapPaces.length > 0 && (
              <View className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
                  {t("run.lapPace") || "分段配速"}
                </Text>
                <View className="space-y-2">
                  {lapPaces.map((lap, index) => (
                    <View
                      key={index}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center">
                        <Text className="text-sm text-slate-500 dark:text-slate-400 w-16">
                          {t("run.km") || "公里"} {lap.km}
                        </Text>
                        <View
                          className="h-2 bg-indigo-500 rounded-full"
                          style={{
                            width: Math.min((240 / lap.pace) * 100, 100), // 以 4'00" 为 100%
                            opacity: 0.6 + (index % 2) * 0.2,
                          }}
                        />
                      </View>
                      <Text className="text-sm font-semibold text-slate-800 dark:text-white">
                        {getPaceLabel(lap.pace)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 图表区域 */}
            <RunCharts
              paceTrend={chartData.paceTrend}
              altitudeProfile={chartData.altitudeProfile}
              lapPaces={lapPaces}
              colorScheme={colorScheme as "light" | "dark"}
              t={t}
            />

            {/* Note 显示模块 */}
            <View className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Text className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                {t("run.note") || "备注"}
              </Text>
              {note && note.length > 0 ? (
                <Text className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {note}
                </Text>
              ) : (
                <Text className="text-sm text-slate-400 dark:text-slate-500 italic">
                  {t("run.noNote") || "暂无备注"}
                </Text>
              )}
            </View>

            {/* 编辑模式按钮 */}
            {!isViewMode && (
              <View className="mt-4 space-y-2">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isSaving}
                  className={`py-3 rounded-xl ${isSaving ? "bg-indigo-400" : "bg-indigo-600"}`}
                >
                  <Text className="text-white text-center font-bold text-base">
                    {isSaving ? t("common.saving") : t("common.save")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDiscard} className="py-3">
                  <Text className="text-red-500 text-center font-medium">
                    {t("run.discard")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}
