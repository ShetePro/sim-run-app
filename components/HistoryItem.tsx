import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { secondFormatHours, getPaceLabel } from "@/utils/util";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Swipeable } from "react-native-gesture-handler";
import { RunRecord } from "@/types/runType";

interface HistoryItemProps {
  record: RunRecord;
  onDelete?: (id: number) => void;
}

export function HistoryItem({ record, onDelete }: HistoryItemProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const swipeableRef = useRef<Swipeable>(null);
  const distance = (record.distance / 1000).toFixed(2);
  const duration = secondFormatHours(record.time, true);
  // pace 在数据库中是秒/公里，getPaceLabel 期望秒/公里，直接使用
  const pace = record.pace ? getPaceLabel(record.pace) : "--'--\"";
  const calories = record.energy || 0;

  const handlePress = () => {
    if (record.id) {
      router.push({
        pathname: "/(views)/run-summary",
        params: {
          runId: String(record.id),
          mode: "view",
        },
      });
    }
  };

  const handleDelete = () => {
    if (record.id && onDelete) {
      onDelete(record.id);
    }
    swipeableRef.current?.close();
  };

  // 右滑显示的删除按钮
  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleDelete}
          className="bg-red-500 justify-center items-center w-20 h-full rounded-r-3xl"
          style={{ marginLeft: -20 }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text className="text-white text-xs mt-1">
              {t("common.delete")}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        className="bg-white dark:bg-slate-800 rounded-3xl p-5 mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* 顶部：图标和标题 */}
        <View className="flex-row items-center mb-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{
              backgroundColor: "#10B98115",
            }}
          >
            <Ionicons name="walk-outline" size={20} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-base text-slate-800 dark:text-white">
              {record.title || t("history.outdoorRun")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        {/* 核心数据：距离 */}
        <View className="mb-4">
          <View className="flex-row items-baseline">
            <Text className="text-4xl font-bold text-slate-900 dark:text-white">
              {distance}
            </Text>
            <Text className="text-lg text-slate-500 ml-1">{t("unit.km")}</Text>
          </View>
        </View>

        {/* 分隔线 */}
        <View className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />

        {/* 三列数据网格 */}
        <View className="flex-row justify-between">
          {/* 时长 */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center mb-1">
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-slate-400 ml-1">
                {t("home.duration")}
              </Text>
            </View>
            <Text className="text-base font-semibold text-slate-800 dark:text-white">
              {duration}
            </Text>
          </View>

          {/* 垂直分隔线 */}
          <View className="w-px bg-slate-100 dark:bg-slate-700 mx-2" />

          {/* 配速 */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center mb-1">
              <Ionicons name="speedometer-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-slate-400 ml-1">
                {t("home.pace")}
              </Text>
            </View>
            <Text className="text-base font-semibold text-slate-800 dark:text-white">
              {pace}
            </Text>
          </View>

          {/* 垂直分隔线 */}
          <View className="w-px bg-slate-100 dark:bg-slate-700 mx-2" />

          {/* 卡路里 */}
          <View className="flex-1 items-center">
            <View className="flex-row items-center mb-1">
              <Ionicons name="flame-outline" size={14} color="#6B7280" />
              <Text className="text-xs text-slate-400 ml-1">
                {t("home.calories")}
              </Text>
            </View>
            <Text className="text-base font-semibold text-slate-800 dark:text-white">
              {calories}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default HistoryItem;
