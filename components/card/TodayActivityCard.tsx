import { Dimensions, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { TodayRunData } from "@/types/runType";
import { useSettingsStore } from "@/store/settingsStore";

interface TodayActivityCardProps {
  todayData: TodayRunData | null;
}

export function TodayActivityCard({ todayData }: TodayActivityCardProps) {
  const { settings } = useSettingsStore();
  const router = useRouter();
  const plan = settings.plan;
  const { t } = useTranslation();
  if (todayData === null) return null;

  // // 等待设置加载完成
  // if (!isLoaded) {
  //   return (
  //     <View className="px-5 mb-6">
  //       <View className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 h-48 animate-pulse" />
  //     </View>
  //   );
  // }

  // 判断是否设置了计划目标
  const hasPlanEnabled = plan?.enabled === true;
  const dailyGoal = hasPlanEnabled ? plan.dailyDistance : 0;
  const hasGoal = dailyGoal > 0;

  // 计算进度
  const progress = hasGoal ? Math.min(todayData.distance / dailyGoal, 1) : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <View className="px-5 mb-6">
      <View className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 shadow-lg shadow-indigo-200 dark:shadow-none overflow-hidden relative">
        <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <View className="absolute -left-10 bottom-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl" />

        <View className="flex-row justify-between items-start mb-2">
          <View className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
            <Text className="text-white text-xs font-bold">
              {t("home.todayActivity")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(views)/plan-settings")}
            className="flex-row items-center bg-white/10 px-2 py-1 rounded-full"
          >
            <Ionicons
              name={hasPlanEnabled ? "flag" : "flag-outline"}
              size={14}
              color="white"
              style={{ opacity: 0.9 }}
            />
            <Text className="text-white/90 text-xs ml-1">
              {hasPlanEnabled ? t("plan.enabled") : t("plan.setGoal")}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-2 mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-6xl font-extrabold text-white tracking-tighter">
              {todayData.distance}
            </Text>
            {hasGoal ? (
              <Text className="text-xl text-indigo-100 font-medium ml-2">
                / {dailyGoal} km
              </Text>
            ) : (
              <Text className="text-lg text-indigo-200 font-medium ml-2">
                km
              </Text>
            )}
          </View>
          <Text className="text-indigo-200 text-sm mt-1">
            {hasGoal
              ? `${t("home.completeness")} ${progressPercent}%`
              : t("plan.tapToSetGoal")}
          </Text>
        </View>

        <View className="h-2 bg-black/20 rounded-full w-full overflow-hidden">
          <View
            style={{ width: `${progressPercent}%` }}
            className={`h-full rounded-full ${
              progress >= 1 ? "bg-green-400" : "bg-yellow-400"
            }`}
          />
        </View>

        {/* 未设置目标时的提示 */}
        {!hasGoal && (
          <TouchableOpacity
            onPress={() => router.push("/(views)/plan-settings")}
            className="mt-4 bg-white/20 rounded-xl px-4 py-3 flex-row items-center justify-center"
          >
            <Ionicons name="add-circle" size={18} color="white" />
            <Text className="text-white font-medium ml-2">
              {t("plan.setYourFirstGoal")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
