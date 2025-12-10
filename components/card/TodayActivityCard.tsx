import { Dimensions, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";

interface TodayActivityCardProps {
  todayData: {
    distance: number;
    goal: number;
  }
}

export function TodayActivityCard({ todayData }: TodayActivityCardProps) {
  const { width } = Dimensions.get('window');
  const {t} = useTranslation();
  const progress = Math.min(todayData.distance / todayData.goal, 1);
  const progressWidth = (width - 80) * progress;
  return (
    <View className="px-5 mb-6">
      <View className="bg-indigo-600 dark:bg-indigo-700 rounded-3xl p-6 shadow-lg shadow-indigo-200 dark:shadow-none overflow-hidden relative">
        <View className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <View className="absolute -left-10 bottom-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl" />

        <View className="flex-row justify-between items-start mb-2">
          <View className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
            <Text className="text-white text-xs font-bold">{t('home.todayActivity')}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons
              name="partly-sunny"
              size={16}
              color="white"
              style={{ opacity: 0.8 }}
            />
            <Text className="text-white/80 text-xs ml-1">24°C {t('weather.comfortable')}</Text>
          </View>
        </View>

        <View className="mt-2 mb-6">
          <View className="flex-row items-baseline">
            <Text className="text-6xl font-extrabold text-white tracking-tighter">
              {todayData.distance}
            </Text>
            <Text className="text-xl text-indigo-100 font-medium ml-2">
              / {todayData.goal} km
            </Text>
          </View>
          <Text className="text-indigo-200 text-sm mt-1">
            {t('home.completeness')} {Math.round(progress * 100)}%
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
