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
  const router = useRouter();
  const { settings } = useSettingsStore();
  const plan = settings.plan;
  
  if (todayData === null) return null
  const goal = plan.enabled ? plan.dailyDistance : 5
  const { width } = Dimensions.get("window");
  const { t } = useTranslation();
  const progress = Math.min(todayData.distance / goal, 1);
  const progressWidth = (width - 80) * progress;
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
              name={plan.enabled ? "flag" : "flag-outline"}
              size={14}
              color="white"
              style={{ opacity: 0.9 }}
            />
            <Text className="text-white/90 text-xs ml-1">
              {plan.enabled ? t("plan.enabled") : t("plan.setGoal")}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-2 mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-6xl font-extrabold text-white tracking-tighter">
              {todayData.distance}
            </Text>
            <Text className="text-xl text-indigo-100 font-medium ml-2">
              / {goal} km
            </Text>
          </View>
          <Text className="text-indigo-200 text-sm mt-1">
            {t("home.completeness")} {Math.round(progress * 100)}%
          </Text>
        </View>

        <View className="h-2 bg-black/20 rounded-full w-full overflow-hidden">
          <View
            style={{ width: `${Math.round(progress * 100)}%` }}
            className="h-full bg-yellow-400 rounded-full"
          />
        </View>
      </View>
    </View>
  );
}
