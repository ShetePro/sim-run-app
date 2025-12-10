import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; // 需要安装 expo-linear-gradient
import dayjs from "dayjs";
import HomeDataCard from "@/components/card/HomeDataCard";
import { TodayActivityCard } from "@/components/card/TodayActivityCard";

// --- Mock Data: 模拟今日和历史数据 ---
const HOME_DATA = {
  user: {
    name: "Alex",
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
// 定义一套更高级的配色方案
const CARD_THEMES = {
  blue: { text: "#3b82f6", bg: "#eff6ff", icon: "#2563eb" }, // Blue-500/50/600
  orange: { text: "#f97316", bg: "#fff7ed", icon: "#ea580c" }, // Orange-500/50/600
  emerald: { text: "#10b981", bg: "#ecfdf5", icon: "#059669" }, // Emerald-500/50/600
  purple: { text: "#a855f7", bg: "#f3e8ff", icon: "#9333ea" }, // Purple-500/50/600
};

export default function HomeScreen() {
  const router = useRouter();

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
                {getGreeting()}, {HOME_DATA.user.name}
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
        <TodayActivityCard todayData={HOME_DATA.today} />

        {/* --- 3. 今日数据网格 --- */}
        <View className="px-5 flex-row flex-wrap justify-between mb-6">
          <HomeDataCard
            label="运动时长"
            value={HOME_DATA.today.duration}
            icon="timer-outline"
            colorHex="#3b82f6"
          />
          <HomeDataCard
            label="消耗千卡"
            value={HOME_DATA.today.calories}
            icon="flame"
            colorHex="#f97316"
          />
          <HomeDataCard
            label="平均配速"
            value={HOME_DATA.today.pace}
            icon="speedometer-outline"
            colorHex="#10b981"
          />
          <HomeDataCard
            label="平均步频"
            value={HOME_DATA.today.cadence}
            unit="spm"
            icon="footsteps-outline"
            colorHex="#a855f7"
          />
        </View>

        {/* --- 4. 快捷开始按钮 (Main Action) --- */}
        <View className="px-5 mb-8">
          <QuickStartButton
            onPress={() => {
              router.push('/(views)/run');
            }}
          />
        </View>

        {/* --- 5. 生涯累计数据 (Lifetime Stats) --- */}
        <View className="px-5 mb-6">
          <Text className="text-slate-800 dark:text-white font-bold text-lg mb-3">
            生涯累计
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex-row justify-between shadow-sm">
            <LifetimeItem
              value={HOME_DATA.lifetime.totalDistance}
              label="总公里"
              unit="km"
            />
            <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-700 self-center" />
            <LifetimeItem
              value={HOME_DATA.lifetime.totalRuns}
              label="总次数"
              unit=""
            />
            <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-700 self-center" />
            <LifetimeItem
              value={HOME_DATA.lifetime.totalHours}
              label="总时长"
              unit="h"
            />
          </View>
        </View>

        <View className="px-5 mb-10">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-slate-800 dark:text-white font-bold text-lg">
              最近活动
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text className="text-indigo-500 text-sm font-medium">
                查看全部
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

const LifetimeItem = ({ value, label, unit }: any) => (
  <View className="items-center flex-1">
    <Text className="text-lg font-extrabold text-slate-800 dark:text-white">
      {value}
      <Text className="text-xs font-normal text-slate-500 ml-0.5">{unit}</Text>
    </Text>
    <Text className="text-xs text-slate-400 mt-1">{label}</Text>
  </View>
);
const QuickStartButton = ({ onPress }: { onPress: () => void }) => {
  const [isPressed, setIsPressed] = React.useState(false);

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
        <Text style={styles.buttonText}>开始跑步</Text>
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
