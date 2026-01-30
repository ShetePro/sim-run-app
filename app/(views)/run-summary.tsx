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
import { useState, useCallback, useEffect, useRef } from "react";
import MapView, { Polyline, Marker } from "react-native-maps";
import dayjs from "dayjs";
import { useRunDB } from "@/hooks/useSQLite";
import { useRunStore } from "@/store/runStore";
import { secondFormatHours, getPaceLabel } from "@/utils/util";
import { RunRecord } from "@/types/runType";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RunSummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ runId: string }>();
  const { updateRun, deleteRun, getRunById, getTrackPoints } = useRunDB();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [runData, setRunData] = useState<RunRecord | null>(null);
  const runStore = useRunStore();

  const runId = Number(params.runId || 0);
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
      setRoutePoints(points.map(p => ({ latitude: p.lat, longitude: p.lng })));
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

  // 根据距离生成默认标题
  const defaultTitle = `${(distance / 1000).toFixed(2)}${t("unit.km")} ${t("history.outdoorRun")}`;

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
              console.error("删除失败:", error);
            }
          },
        },
      ]
    );
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
      <Text className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
        {value}
        {unit && <Text className="text-sm font-normal text-slate-400"> {unit}</Text>}
      </Text>
      <Text className="text-xs text-slate-400 mt-1">{label}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900" edges={["top"]}>
      {/* 顶部导航 */}
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

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 地图区域 */}
        <View className="h-64 w-full relative">
          <MapView
            style={{ width: SCREEN_WIDTH, height: 256 }}
            initialRegion={{
              latitude: routePoints[0]?.latitude || 39.9042,
              longitude: routePoints[0]?.longitude || 116.4074,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
          >
            {routePoints.length > 0 && (
              <>
                <Polyline
                  coordinates={routePoints}
                  strokeColor="#6366f1"
                  strokeWidth={4}
                />
                <Marker coordinate={routePoints[0]}>
                  <View className="w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                </Marker>
                <Marker coordinate={routePoints[routePoints.length - 1]}>
                  <View className="w-4 h-4 rounded-full bg-red-500 border-2 border-white" />
                </Marker>
              </>
            )}
          </MapView>

          {/* 日期标签 */}
          <View className="absolute top-3 left-3 bg-black/50 px-3 py-1 rounded-full">
            <Text className="text-white text-xs">
              {dayjs(startTime).format("YYYY-MM-DD HH:mm")} - {dayjs(endTime).format("HH:mm")}
            </Text>
          </View>
        </View>

        {/* 主要数据 */}
        <View className="px-4 -mt-6">
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
              unit={`/${t("unit.km")}`}
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

        {/* 编辑区域 */}
        <View className="px-4 mt-6 mb-8">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">
            {t("run.editInfo")}
          </Text>

          {/* 标题输入 */}
          <View className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3 mb-3">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={defaultTitle}
              placeholderTextColor="#9ca3af"
              className="text-base text-slate-800 dark:text-white"
              maxLength={50}
            />
          </View>

          {/* 备注输入 */}
          <View className="bg-white dark:bg-slate-800 rounded-xl px-4 py-3">
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
          </View>
        </View>

        {/* 底部按钮 */}
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
      </ScrollView>
    </SafeAreaView>
  );
}
