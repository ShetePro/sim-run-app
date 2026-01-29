import React, { useEffect, useMemo, useState } from "react";
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
import { useTranslation } from "react-i18next";
import RunBarChart from "@/components/charts/RunBarChart";
import KcalChart from "@/components/charts/KcalChart";
import { useRunStatistics } from "@/hooks/useRunStatistics";
import { RunRecord } from "@/types/runType";
import { getPaceLabel, groupRunsByDay } from "@/utils/util";

const screenWidth = Dimensions.get("window").width;

export default function StatsNewScreen() {
  const { t, i18n } = useTranslation();
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const [timeRange, setTimeRange] = useState<"isoWeek" | "month" | "year">(
    "isoWeek",
  );
  const [startDate, setStartDate] = useState("");
  const [statsData, setStatsData] = useState<any>([]);
  const { queryStatisticsByTime } = useRunStatistics();
  
  const totalDistance = statsData?.reduce((a: number, b: RunRecord) => {
    return a + b.distance / 1000;
  }, 0);
  const totalCalories = statsData?.reduce(
    (acc: number, cur: RunRecord) => acc + cur.energy,
    0,
  );
  const totalTime = statsData?.reduce(
    (acc: number, cur: RunRecord) => acc + cur.time,
    0,
  );
  const avgPace =
    totalDistance > 0.01 ? getPaceLabel(totalTime / totalDistance / 60) : "0";
    
  function changeDate(key: "isoWeek" | "month" | "year") {
    setTimeRange(key);
  }
  
  // 获取本地化的时间标签
  const getAxisLabels = () => {
    if (timeRange === "isoWeek") {
      return t("time.week", { returnObjects: true }) as string[];
    } else if (timeRange === "month") {
      const daysInMonth = dayjs().daysInMonth();
      return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    } else {
      return t("time.months", { returnObjects: true }) as string[];
    }
  };
  
  const axisLabels = useMemo(() => getAxisLabels(), [timeRange, i18n.language]);
  
  const chartData = useMemo(() => {
    return groupRunsByDay(statsData, timeRange);
  }, [statsData, timeRange]);
  
  useEffect(() => {
    const startDay = dayjs().startOf(timeRange).format("YYYY-MM-DD");
    setStartDate(startDay);
    queryStatisticsByTime({ date: startDay }).then((res) => {
      setStatsData(res);
    });
  }, [timeRange]);
  
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <View className="px-5 pt-6 pb-4 bg-white dark:bg-slate-800">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {t("charts.title")}
          </Text>
          <Text className="text-slate-500 dark:text-slate-400 text-sm">
            {startDate}{t("charts.sinceDate")}
          </Text>
        </View>
        <TimeRangeSelector selected={timeRange} onSelect={changeDate} t={t} />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* 核心数据概览卡片 */}
        <View className="flex-row justify-between mb-8">
          <SummaryCard
            title={t("charts.weeklyDistance")}
            value={totalDistance.toFixed(2)}
            unit={t("unit.km")}
            icon="map-marker-distance"
            iconColor="#6366f1"
            trend="+12%"
          />
          <SummaryCard
            title={t("charts.totalCalories")}
            value={totalCalories.toString()}
            unit={t("unit.kcal")}
            icon="fire"
            iconColor="#f97316"
          />
          <SummaryCard
            title={t("charts.avgPace")}
            value={avgPace.toString()}
            icon="speedometer"
            iconColor="#10b981"
          />
        </View>
        
        <ChartSectionTitle 
          title={t("charts.dailyDistance")} 
          subtitle={t("charts.weeklyTrend")} 
        />
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-8">
          <RunBarChart
            chartData={chartData}
            axisX={axisLabels}
            type={timeRange}
          />
        </View>

        <ChartSectionTitle 
          title={t("charts.dailyCalories")} 
          subtitle={t("charts.caloriesBurned")} 
        />
        <View className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-10">
          <KcalChart
            chartData={chartData}
            axisX={axisLabels}
            type={timeRange}
          />
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}

const TimeRangeSelector = ({
  selected,
  onSelect,
  t,
}: {
  selected: string;
  onSelect: (val: any) => void;
  t: any;
}) => {
  const tabs = [
    { key: "isoWeek", label: t("charts.weekly") },
    { key: "month", label: t("charts.monthly") },
    { key: "year", label: t("charts.yearly") },
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
  <View className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex-1 mx-1 justify-between min-h-[110px]">
    <View className="flex-row justify-between items-start">
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      {trend && (
        <Text className="text-green-500 text-xs font-medium">{trend}</Text>
      )}
    </View>
    <View>
      <View className="flex-row items-end">
        <Text
          className="text-2xl font-extrabold text-slate-800 dark:text-white mr-1"
          numberOfLines={1}
          ellipsizeMode={"clip"}
        >
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
