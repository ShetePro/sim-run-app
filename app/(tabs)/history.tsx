import { View, Text, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import HistoryItem from "@/components/HistoryItem";
import { EmptyState } from "@/components/EmptyState";
import { useRunDB } from "@/hooks/useSQLite";
import { useEffect, useState } from "react";
import { dateFormat, diffDayNum } from "@/utils/util";

type HistoryRecord = {
  date: string;
  dateTime: number;
  list: any[];
};
export default function HistoryScreen() {
  const { getRuns, deleteRun } = useRunDB();
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    getRuns().then((runs) => {
      const recordsMap: {
        [key: string]: HistoryRecord;
      } = {};
      console.log(runs, "runs");
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
      // const list = runs.filter((record) => record.time === 0);
      // deleteHistory(list);
    });
  }, []);

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
      // 更新本地状态，移除已删除的记录
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

  function renderItem() {
    return historyRecords.map((record) => {
      return (
        <View key={record.date}>
          <ThemedText style={{ fontSize: 20, lineHeight: 50 }}>
            {record.date}
          </ThemedText>
          <View>
            {record.list.map((item) => (
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
        className="flex-1 pl-5 pr-5"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {renderItem()}
      </ScrollView>
    </SafeAreaView>
  );
}
