import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useCallback, useEffect, useRef, ReactElement } from "react";
import MapView, { Polyline, Marker, Circle } from "react-native-maps";
import dayjs from "dayjs";
import { useRunDB } from "@/hooks/useSQLite";
import { useRunStore } from "@/store/runStore";
import { secondFormatHours, getPaceLabel } from "@/utils/util";
import { RunRecord } from "@/types/runType";
import Toast from "react-native-toast-message";

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
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [runData, setRunData] = useState<RunRecord | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 30.9042,
    longitude: 122.4074,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const runStore = useRunStore();

  const runId = Number(params.runId || 0);
  const isViewMode = params.mode === "view"; // 查看模式（历史记录）
  const hasLoaded = useRef(false);

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

      // 获取轨迹点
      const points = await getTrackPoints(runId);
      const mappedPoints = points.map(p => ({ latitude: p.lat, longitude: p.lng }));
      setRoutePoints(mappedPoints);

      console.log(points);
      // 设置地图中心为起点
      if (mappedPoints.length > 0) {
        setMapRegion({
          latitude: mappedPoints[0].latitude,
          longitude: mappedPoints[0].longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } catch (error) {
      console.error("加载跑步数据失败:", error);
      Alert.alert(t("common.error"), "加载跑步数据失败");
      hasLoaded.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [runId]);

  // 页面加载时获取数据
  useEffect(() => {
    loadRunData();
  }, [loadRunData]);

  // 从数据库数据计算显示值
  const distance = runData?.distance || 0;
  const duration = runData?.time || 0;
  const pace = runData?.pace || 0;
  const calories = runData?.energy || 0;
  const startTime = runData?.startTime || Date.now();
  const endTime = runData?.endTime || Date.now();

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
      Alert.alert(t("common.error"), "保存跑步记录失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 放弃跑步记录
  const handleDiscard = () => {
    Alert.alert(
      t("run.discardTitle"),
      t("run.discardMessage"),
      [
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
      ]
    );
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  // 生成渐变色路线段
  const generateGradientRoute = (points: typeof routePoints) => {
    if (points.length <= 1) return null;

    const segments: ReactElement[] = [];
    const totalPoints = points.length;
    const maxSegments = 50; // 最多50段，保证性能
    const step = Math.max(1, Math.floor((totalPoints - 1) / maxSegments));

    for (let i = 0; i < totalPoints - 1; i += step) {
      const progress = Math.min(i / (totalPoints - 1), 1);
      const nextIndex = Math.min(i + step, totalPoints - 1);

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
          coordinates={points.slice(i, nextIndex + 1)}
          strokeColor={color}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    return segments;
  };

  // 加载中状态
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 justify-center items-center">
        <Text className="text-slate-500 dark:text-slate-400">{t("common.loading")}...</Text>
      </SafeAreaView>
    );
  }

  // 数据不存在
  if (!runData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 justify-center items-center">
        <Text className="text-slate-500 dark:text-slate-400">{t("run.notFound")}</Text>
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
        {unit && <Text className="text-sm font-normal text-slate-400"> {unit}</Text>}
      </Text>
      <Text className="text-xs text-slate-400 mt-1">{label}</Text>
    </View>
  );

  // 渲染顶部导航栏
  const renderHeader = () => {
    if (isViewMode) {
      // 查看模式：显示返回按钮
      return (
        <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-slate-800">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#6366f1" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-800 dark:text-white">
            {t("run.detail")}
          </Text>
          <View className="w-10" />{/* 占位保持居中 */}
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
        <TouchableOpacity onPress={handleSave} disabled={isSaving} className="p-2">
          <Text className={`font-medium ${isSaving ? "text-slate-400" : "text-indigo-600"}`}>
            {isSaving ? t("common.saving") : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900" edges={["top"]}>
      {/* 顶部导航 */}
      {renderHeader()}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 地图区域 */}
        <View className="h-72 w-full relative">
          <MapView
            style={{ width: SCREEN_WIDTH, height: 288 }}
            region={mapRegion}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
          >
            {routePoints.length > 0 && (
              <>
                {/* 渐变路线 - 从绿色(起点)渐变到红色(终点) */}
                {generateGradientRoute(routePoints)}

                {/* 起点标记 */}
                <Marker coordinate={routePoints[0]} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#22c55e',
                    borderWidth: 3,
                    borderColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 4
                  }} />
                </Marker>

                {/* 终点标记 */}
                <Marker coordinate={routePoints[routePoints.length - 1]} anchor={{ x: 0.5, y: 0.5 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#ef4444',
                    borderWidth: 3,
                    borderColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 4
                  }} />
                </Marker>

                {/* 起点和终点的脉冲圆圈效果 */}
                <Circle
                  center={routePoints[0]}
                  radius={30}
                  strokeColor="rgba(34, 197, 94, 0.3)"
                  fillColor="rgba(34, 197, 94, 0.1)"
                />
                <Circle
                  center={routePoints[routePoints.length - 1]}
                  radius={30}
                  strokeColor="rgba(239, 68, 68, 0.3)"
                  fillColor="rgba(239, 68, 68, 0.1)"
                />
              </>
            )}
          </MapView>

          {/* 日期标签 */}
          <View className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs">
              {dayjs(startTime).format("YYYY-MM-DD HH:mm")} - {dayjs(endTime).format("HH:mm")}
            </Text>
          </View>

          {/* 路线图例 */}
          <View className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-800/90 px-3 py-2 rounded-lg shadow-sm">
            <View className="flex-row items-center">
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e' }} />
              <Text className="text-xs text-slate-600 dark:text-slate-300 ml-1 mr-3">起</Text>
              <View style={{ width: 30, height: 4, borderRadius: 2, backgroundColor: '#facc15' }} />
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', marginLeft: 6 }} />
              <Text className="text-xs text-slate-600 dark:text-slate-300 ml-1">终</Text>
            </View>
          </View>
        </View>

        {/* 主要数据 */}
        <View className="px-4 mt-4">
          <View className="bg-indigo-600 rounded-3xl p-6 shadow-lg">
            <Text className="text-indigo-100 text-sm text-center mb-2">{t("activity.distance")}</Text>
            <View className="flex-row items-baseline justify-center">
              <Text className="text-6xl font-bold text-white">
                {(distance / 1000).toFixed(2)}
              </Text>
              <Text className="text-xl text-indigo-200 ml-2">{t("unit.km")}</Text>
            </View>
          </View>
        </View>

        {/* 统计数据网格 */}
        <View className="px-4 mt-6">
          <View className="flex-row">
            <StatCard
              icon="clock-outline"
              value={secondFormatHours(duration)}
              label={t("common.time")}
              color="#3b82f6"
            />
            <StatCard
              icon="speedometer"
              value={getPaceLabel(pace)}
              unit={`/km`}
              label={t("activity.pace")}
              color="#10b981"
            />
            <StatCard
              icon="fire"
              value={calories}
              unit={t("unit.kcal")}
              label={t("activity.energy")}
              color="#f97316"
            />
          </View>
        </View>

        {/* 信息区域 */}
        <View className="px-4 mt-6 mb-8">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">
            {isViewMode ? t("run.info") : t("run.editInfo")}
          </Text>

          {/* 标题 */}
          <View className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 mb-3">
            {isViewMode ? (
              <Text className="text-base text-slate-800 dark:text-white">
                {title || defaultTitle}
              </Text>
            ) : (
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={defaultTitle}
                placeholderTextColor="#9ca3af"
                className="text-base text-slate-800 dark:text-white"
                maxLength={50}
              />
            )}
          </View>

          {/* 备注 */}
          <View className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3">
            {isViewMode ? (
              note ? (
                <Text className="text-base text-slate-800 dark:text-white">
                  {note}
                </Text>
              ) : (
                <Text className="text-base text-slate-400 italic">
                  {t("run.noNote")}
                </Text>
              )
            ) : (
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t("run.addNote")}
                placeholderTextColor="#9ca3af"
                className="text-base text-slate-800 dark:text-white"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={200}
              />
            )}
          </View>
        </View>

        {/* 底部按钮 - 仅在编辑模式显示 */}
        {!isViewMode && (
          <View className="px-4 pb-8">
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`py-4 rounded-xl ${isSaving ? "bg-indigo-400" : "bg-indigo-600"}`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {isSaving ? t("common.saving") : t("run.saveRecord")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDiscard}
              className="py-4 mt-3"
            >
              <Text className="text-red-500 text-center font-medium">
                {t("run.discardRecord")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
