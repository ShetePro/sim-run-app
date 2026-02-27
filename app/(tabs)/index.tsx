import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import dayjs from "dayjs";
import HomeDataCard from "@/components/card/HomeDataCard";
import { TodayActivityCard } from "@/components/card/TodayActivityCard";
import { useTranslation } from "react-i18next";
import { useRunDB } from "@/hooks/useSQLite";
import { TodayRunData } from "@/types/runType";
import { getPaceLabel, secondFormatHours } from "@/utils/util";
import { LifeCountCard } from "@/components/card/LifeCountCard";
import { DefaultAvatar } from "@/components/DefaultAvatar";
import { RecentActivityItem } from "@/components/RecentActivityItem";
import { getStorageItemAsync } from "@/hooks/useStorageState";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { getTodayRunData, getRuns } = useRunDB();
  const [today, setToday] = useState<TodayRunData | null>(null);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{
    nickname?: string;
    avatar?: string;
  }>({});

  // 获取今日跑步数据和最近活动
  useEffect(() => {
    // 获取今日数据
    getTodayRunData().then((res) => {
      console.log(res, "获取的今日数据");
      const todayData: TodayRunData = {
        distance: 0,
        calories: 0,
        duration: 0,
        pace: 0,
        steps: 0,
      };
      let totalSteps = 0;
      res.forEach((run, index) => {
        todayData.distance += run.distance / 1000;
        todayData.calories += run.energy;
        todayData.duration += run.time;
        totalSteps += run.steps || 0;
      });
      const { distance, calories, duration } = todayData;
      // 计算平均配速（分钟/公里）：总时长(秒) / 总距离(公里) / 60
      todayData.pace = distance > 0 ? Math.round(duration / distance / 60) : 0;
      // 计算平均步频（步/分钟）：总步数 / 总时长(分钟)
      const durationInMinutes = duration / 60;
      todayData.steps =
        durationInMinutes > 0 ? Math.round(totalSteps / durationInMinutes) : 0;
      todayData.distance = Number(distance.toFixed(2));
      setToday(todayData);
    });

    // 获取最近3条跑步记录
    getRuns().then((runs) => {
      const sorted = runs
        .filter((run) => run.isFinish === 1)
        .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))
        .slice(0, 3);
      setRecentRuns(sorted);
    });
  }, []);

  // 获取用户信息（包括头像）
  const loadUserInfo = async () => {
    try {
      const storedUserInfo = await getStorageItemAsync("userInfo");

      // 空值检查
      if (!storedUserInfo) {
        setUserInfo({});
        return;
      }

      // 如果已经是对象，直接使用
      if (typeof storedUserInfo === "object") {
        setUserInfo(storedUserInfo);
        return;
      }

      // 尝试解析 JSON
      const parsed = JSON.parse(storedUserInfo);
      setUserInfo(parsed || {});
    } catch (e) {
      console.error("[Home] 解析用户信息失败:", e);
      setUserInfo({});
    }
  };

  // 页面加载时获取用户信息
  useEffect(() => {
    loadUserInfo();
  }, []);

  // 页面获得焦点时刷新用户信息（从个人资料页返回时）
  useFocusEffect(
    React.useCallback(() => {
      loadUserInfo();
    }, []),
  );
  // 根据时间生成问候语
  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return t("common.greeting.morning");
    if (hour < 18) return t("common.greeting.afternoon");
    return t("common.greeting.evening");
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
              {(() => {
                const now = dayjs();
                const months = t("time.months", {
                  returnObjects: true,
                }) as string[];
                const weekDays = t("time.week", {
                  returnObjects: true,
                }) as string[];
                const month = months?.[now.month()] ?? "";
                const day = now.date();
                const weekday =
                  weekDays?.[now.day() === 0 ? 6 : now.day() - 1] ?? "";
                // 中文格式：10月6日 周日，英文格式：Oct 6, Sun
                const isCN = (t("common.today") as string).length <= 2;
                return isCN
                  ? `${month}${day}日 ${weekday}`
                  : `${month} ${day}, ${weekday}`;
              })()}
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
            {userInfo?.avatar ? (
              <Image
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 9999,
                }}
                source={{ uri: userInfo.avatar }}
                contentFit="cover"
                className="rounded-full border-4 border-white dark:border-slate-800 shadow-sm"
              />
            ) : (
              <DefaultAvatar nickname={userInfo?.nickname} size={48} />
            )}
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

        {/* --- 5. 最近活动 --- */}
        {recentRuns.length > 0 && (
          <View className="px-5 mb-10">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-800 dark:text-white font-bold text-lg">
                {t("home.recentActivities")}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/history")}
                className="flex-row items-center"
              >
                <Text className="text-indigo-500 text-sm font-medium mr-1">
                  {t("home.showMore")}
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#6366F1" />
              </TouchableOpacity>
            </View>

            <View>
              {recentRuns.map((run, index) => (
                <RecentActivityItem
                  key={run.id}
                  record={run}
                  index={index}
                  onPress={() =>
                    router.push({
                      pathname: "/(views)/run-summary",
                      params: { runId: String(run.id), mode: "view" },
                    })
                  }
                />
              ))}
            </View>
          </View>
        )}
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
