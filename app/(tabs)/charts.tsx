import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import RunBarChart from "@/components/charts/RunBarChart";
import KcalChart from "@/components/charts/KcalChart";

const screenWidth = Dimensions.get("window").width;

// --- Mock Data (保持不变，但需要转换格式以支持新 API) ---
const WEEKLY_DATA = [
  {
    day: "周一",
    date: "2025-12-01",
    distance: 5.2,
    calories: 320,
    pace: 5.5,
    index: 1,
  },
  {
    day: "周二",
    date: "2025-12-02",
    distance: 0,
    calories: 0,
    pace: 0,
    index: 2,
  },
  {
    day: "周三",
    date: "2025-12-03",
    distance: 7.1,
    calories: 450,
    pace: 5.2,
    index: 3,
  },
  {
    day: "周四",
    date: "2025-12-04",
    distance: 4.5,
    calories: 280,
    pace: 6.0,
    index: 4,
  },
  {
    day: "周五",
    date: "2025-12-05",
    distance: 10.0,
    calories: 680,
    pace: 5.1,
    index: 5,
  },
  {
    day: "周六",
    date: "2025-12-06",
    distance: 3.0,
    calories: 190,
    pace: 6.5,
    index: 6,
  },
  {
    day: "周日",
    date: "2025-12-07",
    distance: 12.5,
    calories: 810,
    pace: 4.5,
    index: 7,
  },
];

const totalDistance = WEEKLY_DATA.reduce(
  (acc, cur) => acc + cur.distance,
  0,
).toFixed(1);
const totalCalories = WEEKLY_DATA.reduce((acc, cur) => acc + cur.calories, 0);
const activeDays = WEEKLY_DATA.filter((d) => d.distance > 0);
const avgPace = (
  activeDays.reduce((acc, cur) => acc + cur.pace, 0) / (activeDays.length || 1)
).toFixed(2);

export default function StatsNewScreen() {
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const primaryColor = "#6366f1"; // indigo-500
  const secondaryColor = "#f97316"; // orange-500
  function changeDate(key) {
    setTimeRange(key);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <View className="px-5 pt-6 pb-4 bg-white dark:bg-slate-800">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-extrabold text-slate-800 dark:text-white">
            运动统计
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm">
            {dayjs().format("M月D日")}至今
          </Text>
        </View>
        <TimeRangeSelector selected={timeRange} onSelect={changeDate} />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* 核心数据概览卡片 (Summary Cards - 不变) */}
        <View className="flex-row justify-between mb-8">
          <SummaryCard
            title="本周里程"
            value={totalDistance}
            unit="km"
            icon="map-marker-distance"
            iconColor="#6366f1"
            trend="+12%"
          />
          <SummaryCard
            title="总消耗"
            value={totalCalories.toString()}
            unit="kcal"
            icon="fire"
            iconColor="#f97316"
          />
          <SummaryCard
            title="平均配速"
            value={avgPace.toString()}
            unit="min/km"
            icon="speedometer"
            iconColor="#10b981"
          />
        </View>
        <ChartSectionTitle title="每日跑量 (km)" subtitle="本周累计趋势" />
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4  mb-8">
          <RunBarChart />
        </View>

        <ChartSectionTitle title="卡路里消耗 (kcal)" subtitle="每日热量燃烧" />
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4  mb-10">
          <KcalChart />
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}

const TimeRangeSelector = ({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (val: any) => void;
}) => {
  const tabs = [
    { key: "week", label: "周" },
    { key: "month", label: "月" },
    { key: "year", label: "年" },
  ];
  return (
    <View className="flex-row bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl">
      {tabs.map((tab) => {
        const isActive = selected === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={1}
            onPress={() => onSelect(tab.key)}
            className={`flex-1 py-2 items-center rounded-lg ${isActive ? "bg-white dark:bg-slate-600" : ""}`}
          >
            <Text
              className={`font-semibold ${isActive ? "text-indigo-600 dark:text-white" : "text-slate-500 dark:text-slate-40"}`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const SummaryCard = ({ title, value, unit, icon, iconColor, trend }: any) => (
  <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl  flex-1 mx-1 justify-between min-h-[110px]">
    <View className="flex-row justify-between items-start">
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      {trend && (
        <Text className="text-green-500 text-xs font-medium">{trend}</Text>
      )}
    </View>
    <View>
      <View className="flex-row items-end">
        <Text className="text-2xl font-extrabold text-slate-800 dark:text-white mr-1">
          {value}
        </Text>
        <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
          {unit}
        </Text>
      </View>
      <Text className="text-slate-400 text-xs mt-1">{title}</Text>
    </View>
  </View>
);

const ChartSectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <View className="mb-4 ml-1">
    <Text className="text-lg font-bold text-slate-800 dark:text-white mb-0.5">
      {title}
    </Text>
    <Text className="text-xs text-slate-500 dark:text-slate-400">
      {subtitle}
    </Text>
  </View>
);
