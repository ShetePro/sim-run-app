import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; // 需要安装 expo-linear-gradient
import dayjs from "dayjs";
import HomeDataCard from "@/components/card/HomeDataCard";
import { TodayActivityCard } from "@/components/card/TodayActivityCard";
import { useTranslation } from "react-i18next";
import { useRunDB } from "@/hooks/useSQLite";
import { TodayRunData } from "@/types/runType";
import { getPaceLabel, secondFormatHours } from "@/utils/util";
import { LifeCountCard } from "@/components/card/LifeCountCard";

const HOME_DATA = {
  user: {
    name: "",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  },
  today: {
    distance: 5.2, // km
    goal: 10.0, // km
    calories: 340, // kcal
    duration: "00:32:15",
    pace: "6'15''",
    cadence: 172, // spm
  },
  lifetime: {
    totalRuns: 142,
    totalDistance: 1240.5, // km
    totalHours: 128.5, // hours
  },
  lastRun: {
    date: "昨天 18:30",
    distance: 7.1,
    location: "世纪公园环线",
    mapThumbnail:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80", // 模拟地图缩略图
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getTodayRunData } = useRunDB();
  const [today, setToday] = useState<TodayRunData | null>(null);

  useEffect(() => {
    getTodayRunData().then((res) => {
      console.log(res, "获取的今日数据");
      const todayData: TodayRunData = {
        distance: 0,
        calories: 0,
        duration: 0,
        pace: 0,
        steps: 0,
      };
      res.forEach((run, index) => {
        todayData.distance += (run.distance + todayData.distance) / 1000;
        todayData.calories += run.pace;
        todayData.duration += run.time;
      });
      const { distance, calories, duration } = todayData;
      todayData.calories = Math.ceil(calories);
      todayData.pace = distance < 10 ? 0 : duration / distance / 60;
      todayData.distance = Number(distance.toFixed(2));
      setToday(todayData);
    });
  }, []);
  // 根据时间生成问候语
  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-20">
        {/* --- 1. 头部区域 --- */}
        <View className="px-5 pt-2 mb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
              {dayjs().format("M月D日 dddd")}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-3xl font-bold text-slate-800 dark:text-white mr-2">
                {getGreeting()}
              </Text>
              <MaterialCommunityIcons
                name="hand-wave"
                size={24}
                color="#fbbf24"
              />
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/user")}>
            <Image
              source={HOME_DATA.user.avatar}
              className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
            />
          </TouchableOpacity>
        </View>

        {/* --- 2. 今日核心卡片 --- */}
        {today && <TodayActivityCard todayData={today} />}

        {/* --- 3. 今日数据网格 --- */}
        {today === null ? null : (
          <View className="px-5 flex-row flex-wrap justify-between mb-6">
            <HomeDataCard
              label={t("home.duration")}
              value={secondFormatHours(today.duration, true)}
              icon="timer-outline"
              colorHex="#3b82f6"
            />
            <HomeDataCard
              label={t("home.calories")}
              value={today.calories}
              unit="kcal"
              icon="flame"
              colorHex="#f97316"
            />
            <HomeDataCard
              label={t("home.pace")}
              value={getPaceLabel(today.pace)}
              icon="speedometer-outline"
              colorHex="#10b981"
            />
            <HomeDataCard
              label={t("home.stepFrequency")}
              value={today.steps}
              unit="spm"
              icon="footsteps-outline"
              colorHex="#a855f7"
            />
          </View>
        )}
        {/* --- 4. 快捷开始按钮 (Main Action) --- */}
        <View className="px-5 mb-8">
          <QuickStartButton
            onPress={() => {
              router.push("/(views)/run");
            }}
          />
        </View>

        {/* --- 5. 生涯累计数据 (Lifetime Stats) --- */}
        <View className="px-5 mb-6">
          <Text className="text-slate-800 dark:text-white font-bold text-lg mb-3">
            {t("home.career")}
          </Text>
          <LifeCountCard className={"bg-white dark:bg-slate-800"} />
        </View>

        <View className="px-5 mb-10">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-800 dark:text-white font-bold text-lg">
              {t("home.recentActivities")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text className="text-indigo-500 text-sm font-medium">
                {t("home.showMore")}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm"
            activeOpacity={0.9}
          >
            <ImageBackground
              source={{ uri: HOME_DATA.lastRun.mapThumbnail }}
              className="h-32 w-full justify-end p-4"
              imageStyle={{ opacity: 0.9 }}
            >
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                className="absolute left-0 right-0 bottom-0 h-20"
              />
              <View>
                <Text className="text-white font-bold text-lg">
                  {HOME_DATA.lastRun.distance} km
                </Text>
                <Text className="text-white/80 text-xs">
                  {HOME_DATA.lastRun.date} · {HOME_DATA.lastRun.location}
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}

const QuickStartButton = ({ onPress }: { onPress: () => void }) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const { t } = useTranslation();
  const START_COLOR = "#4f46e5";
  const END_COLOR = "#6366f1";
  const SHADOW_COLOR = "#6366f1";

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.buttonBase,
        {
          shadowColor: SHADOW_COLOR,
          shadowOffset: { width: 0, height: isPressed ? 0 : 8 },
          shadowOpacity: isPressed ? 0.4 : 0.8,
          shadowRadius: isPressed ? 5 : 15,
          elevation: isPressed ? 6 : 12,
        },
      ]}
    >
      <LinearGradient
        colors={[START_COLOR, END_COLOR]}
        start={{ x: 0.1, y: 0.9 }}
        end={{ x: 0.9, y: 0.1 }}
        style={[
          styles.gradient,
          { transform: [{ translateY: isPressed ? 2 : 0 }] },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name="play"
            size={28}
            color="white"
            style={{ marginLeft: 3 }}
          />
        </View>
        <Text style={styles.buttonText}>{t("home.startRun")}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: 100,
    overflow: "visible",
    transitionProperty: "all",
    transitionDuration: "150ms",
  },
  gradient: {
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  iconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    borderRadius: 999,
    marginRight: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2.5,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
