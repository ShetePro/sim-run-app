import { Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRunDB } from "@/hooks/useSQLite";

interface TotalCountCardProps {
  className?: string;
}
export function LifeCountCard(props: TotalCountCardProps) {
  const [countData, setCountData] = useState({
    totalDistance: '-',
    totalRuns: '-',
    totalHours: '-',
  });
  const { t } = useTranslation();
  const { getRunLifeCount } = useRunDB();
  useEffect(() => {
    getRunLifeCount().then((res) => {
      setCountData({
        totalDistance: res.totalDistance?.toFixed(2) || '-',
        totalHours: res.totalHours?.toFixed(1) || '-',
        totalRuns: res.totalRuns?.toString() || '-',
      });
    });
  }, []);
  return (
    <View
      className={` rounded-2xl p-5 flex-row justify-between shadow-sm ${props.className}`}
    >
      <LifetimeItem
        value={countData.totalDistance}
        label={t("home.totalDistance")}
        unit="km"
      />
      <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-700 self-center" />
      <LifetimeItem
        value={countData.totalRuns}
        label={t("home.totalRuns")}
        unit=""
      />
      <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-700 self-center" />
      <LifetimeItem
        value={countData.totalHours}
        label={t("home.totalHours")}
        unit="h"
      />
    </View>
  );
}
const LifetimeItem = ({ value, label, unit }: any) => (
  <View className="items-center flex-1">
    <Text className="text-lg font-extrabold text-slate-800 dark:text-white">
      {value}&nbsp;
      <Text className="text-xs font-normal text-slate-500 ml-1">{unit}</Text>
    </Text>
    <Text className="text-xs text-slate-400 mt-1">{label}</Text>
  </View>
);
