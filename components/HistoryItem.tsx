import { View, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedText } from "@/components/ThemedText";
import { secondFormatHours } from "@/utils/util";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { RunRecord } from "@/types/runType";

interface HistoryItemProps {
  record: RunRecord;
}

function HistoryItem({ record }: HistoryItemProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const distance = (record.distance / 1000).toFixed(2);
  const miles = secondFormatHours(record.time);

  const handlePress = () => {
    if (record.id) {
      router.push({
        pathname: "/(views)/run-summary",
        params: {
          runId: String(record.id),
          mode: "view", // 查看模式，用于历史记录
        },
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={
        "flex flex-row items-center bg-white dark:bg-slate-800 p-4 rounded-[24px] mb-4 shadow-sm"
      }
    >
      <View
        className={"flex flex-row items-center justify-center mr-4"}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: "#38E07B33",
        }}
      >
        <MaterialIcons name="route" size={24} color="#39e17c" />
      </View>
      <View className={"flex flex-col flex-1"}>
        <ThemedText className="font-semibold text-base">
          {record.title || t("history.outdoorRun")}
        </ThemedText>
        <ThemedText className="text-slate-500 text-sm mt-1">
          {distance} {t("unit.km")} · {miles}
        </ThemedText>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );
}

export default HistoryItem;
