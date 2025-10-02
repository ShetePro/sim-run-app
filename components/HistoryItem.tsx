import { View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {ThemedText} from "@/components/ThemedText";
function HistoryItem({ record }: { record: any }) {
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
      <View className={'flex flex-col'}>
        <ThemedText>户外跑步</ThemedText>
        <ThemedText>2.5 mi · 25 min</ThemedText>
      </View>
    </View>
  );
}

export default HistoryItem;
