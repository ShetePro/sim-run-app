import { View, Text, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import HistoryItem from "@/components/HistoryItem";
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
  function renderItem() {
    return historyRecords.map((record) => {
      return (
        <View key={record.date}>
          <ThemedText style={{ fontSize: 20, lineHeight: 50 }}>
            {record.date}
          </ThemedText>
          <View>
            {record.list.map((item) => (
              <HistoryItem key={item.id} record={item} />
            ))}
          </View>
        </View>
      );
    });
  }
  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 pb-20 pl-5 pr-5"
      >
        {renderItem()}
      </ScrollView>
    </SafeAreaView>
  );
}
