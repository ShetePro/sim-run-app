import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { HistoryItem } from "@/components/HistoryItem";
import { EmptyState } from "@/components/EmptyState";
import { useRunDB } from "@/hooks/useSQLite";
import { useCallback, useState } from "react";
import { dateFormat, diffDayNum } from "@/utils/util";
import { useFocusEffect } from "expo-router";

type HistoryRecord = {
  date: string;
  dateTime: number;
  list: any[];
};

export default function HistoryScreen() {
  const { getRuns, deleteRun } = useRunDB();
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      getRuns().then((runs) => {
        const recordsMap: {
          [key: string]: HistoryRecord;
        } = {};

        runs.forEach((item) => {
          if (item.startTime) {
            const date = getDateLabel(item.startTime);
            recordsMap[date] = {
              date,
              dateTime: item.startTime,
              list: recordsMap[date]?.list
                ? [...recordsMap[date].list, item]
                : [item],
            };
          }
        });

        const recordsList = Object.values(recordsMap).sort(
          (a, b) => b.dateTime - a.dateTime,
        );
        setHistoryRecords(recordsList);
      });
    }, [getRuns]),
  );

  async function deleteHistory(records: any) {
    for (const record of records) {
      if (record.id) {
        await deleteRun(record.id);
      }
    }
  }

  function getDateLabel(dateTime: number) {
    const diffDay = diffDayNum(dateTime);
    if (diffDay === 0) {
      return t("common.today");
    } else if (diffDay === 1) {
      return t("common.yesterday");
    } else {
      return dateFormat(dateTime);
    }
  }

  const handleDeleteRecord = async (id: number) => {
    try {
      await deleteRun(id);
      setHistoryRecords((prevRecords) => {
        const updatedRecords = prevRecords
          .map((record) => ({
            ...record,
            list: record.list.filter((item) => item.id !== id),
          }))
          .filter((record) => record.list.length > 0);
        return updatedRecords;
      });
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  // 计算某天的统计数据
  const getDayStats = (records: any[]) => {
    const totalDistance = records.reduce(
      (sum, item) => sum + (item.distance || 0) / 1000,
      0,
    );
    const totalDuration = records.reduce(
      (sum, item) => sum + (item.time || 0),
      0,
    );
    const totalCalories = records.reduce(
      (sum, item) => sum + (item.energy || 0),
      0,
    );

    return {
      distance: totalDistance.toFixed(2),
      duration: Math.floor(totalDuration / 60),
      calories: totalCalories,
    };
  };

  function renderItem() {
    return historyRecords.map((record) => {
      const stats = getDayStats(record.list);

      return (
        <View key={record.date} className="mb-8">
          {/* 日期分组头部 */}
          <View className="flex-row items-center justify-between mb-4 px-1">
            <View className="flex-row items-center">
              <View className="w-1 h-6 bg-indigo-500 rounded-full mr-3" />
              <Text className="text-xl font-bold text-slate-800 dark:text-white">
                {record.date}
              </Text>
            </View>

            {/* 当天统计摘要 */}
            <View className="flex-row items-center">
              <Text className="text-sm text-slate-500">
                {record.list.length} {t("history.activities")} ·{" "}
                {stats.distance} {t("unit.km")}
              </Text>
            </View>
          </View>

          {/* 跑步记录列表 */}
          <View className={"flex flex-col gap-4"}>
            {record.list.map((item, index) => (
              <HistoryItem
                key={item.id}
                record={item}
                onDelete={handleDeleteRecord}
              />
            ))}
          </View>
        </View>
      );
    });
  }

  // 空状态渲染
  if (historyRecords.length === 0) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 dark:bg-slate-900"
        edges={["top"]}
      >
        <EmptyState
          title={t("history.emptyTitle") || "还没有跑步记录"}
          subtitle={
            t("history.emptySubtitle") ||
            "迈开第一步，开始记录你的每一次奔跑吧！🏃‍♂️"
          }
          icon="walk-outline"
          actionLabel={t("history.startRun") || "开始第一次跑步"}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 80 }}
      >
        {renderItem()}
      </ScrollView>
    </SafeAreaView>
  );
}
