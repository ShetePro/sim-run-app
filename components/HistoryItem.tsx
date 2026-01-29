import { View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ThemedText } from "@/components/ThemedText";
import { secondFormatHours } from "@/utils/util";
import { useTranslation } from "react-i18next";

function HistoryItem({ record }: { record: any }) {
  const { t } = useTranslation();
  const distance = (record.distance / 1000).toFixed(2);
  const startTime = new Date(record.startTime);
  const miles = secondFormatHours(record.time);
  
  return (
    <View
      className={
        "flex flex-row items-center bg-[#F6F8F70D] p-4 rounded-[32] mb-4"
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
      <View className={"flex flex-col"}>
        <ThemedText>{t("history.outdoorRun")}</ThemedText>
        <ThemedText>
          {distance} {t("unit.km")} · {miles}
        </ThemedText>
      </View>
    </View>
  );
}

export default HistoryItem;
