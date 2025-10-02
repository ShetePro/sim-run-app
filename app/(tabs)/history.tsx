import { View, Text, SafeAreaView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import HistoryItem from "@/components/HistoryItem";
import { ThemedView } from "@/components/ThemedView";
import PageView from "@/components/PageView";

export default function HistoryScreen() {
  const { t } = useTranslation();
  const historyRecords = [
    {
      type: "run",
      id: "1",
      distance: 5.2,
      duration: 32,
    },
  ];
  return (
      <PageView style={{ flex: 1, padding: 16 }}>
        <ThemedText style={{ fontSize: 20, lineHeight: 50 }}>
          {t("common.today")}
        </ThemedText>
        <View>
          {historyRecords.map((record) => (
            <HistoryItem key={record.id} record={record} />
          ))}
        </View>
      </PageView>
  );
}
