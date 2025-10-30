import { StyleSheet, SafeAreaView, View, Image } from "react-native";

import PageView from "@/components/PageView";
import { ThemedText } from "@/components/ThemedText";
import UserAvatar from "@/components/UserAvatar";
import { useTranslation } from "react-i18next";

export default function HomeScreen() {
  const { t } = useTranslation();
  const totalRecord = [
    {
      value: "14",
      label: t("activity.runs"),
    },
    {
      value: "54.3",
      label: t("unit.km"),
    },
    {
      value: "32",
      label: t("unit.hours"),
    },
  ];
  const todayAns = [
    {
      label: t("activity.distance"),
      value: "4.2",
      unit: t("unit.km"),
    },
    {
      label: t("activity.steps"),
      value: "123",
      unit: "",
    },
    {
      label: t("activity.energy"),
      value: "350",
      unit: t("unit.kcal"),
    },
    {
      label: t("activity.pace"),
      value: "6'30",
      unit: "/" + t("unit.km"),
    },
  ];
  function totalItem(item: any) {
    return (
      <View
        className={"flex flex-col items-center flex-1 bg-[#1e293b80] rounded-3xl p-3"}
        key={item.label}
      >
        <ThemedText style={{ fontSize: 24, lineHeight: 40 }}>
          {item.value}
        </ThemedText>
        <ThemedText style={{ fontSize: 14 }}>{item.label}</ThemedText>
      </View>
    );
  }
  function activityItem(item: any) {
    return (
      <View
        className={"flex flex-col flex-1 bg-[#38e07b4d] rounded-3xl p-4 gap-1"}
        key={item.label}
      >
        <ThemedText style={{ fontSize: 14 }}>{item.label}</ThemedText>
        <ThemedText style={{ fontSize: 24, lineHeight: 40 }}>
          {item.value} {item.unit}
        </ThemedText>
      </View>
    );
  }
  return (
    <PageView>
      <View style={{ flex: 1, padding: 10 }}>
        <UserAvatar />
        <View className={"flex flex-row mt-2 mb-2 gap-4"}>
          {totalRecord.map(totalItem)}
        </View>
        <ThemedText style={{ fontSize: 20, lineHeight: 50 }}>
          {t("home.todayActivity")}
        </ThemedText>
        <View className={"flex flex-col"}>
          <View className={"flex flex-row mt-4 gap-4 flex-grow w-full"}>
            {todayAns.slice(0, 2).map(activityItem)}
          </View>
          <View className={"flex flex-row mt-4 gap-4 flex-grow w-full"}>
            {todayAns.slice(2).map(activityItem)}
          </View>
        </View>
      </View>
    </PageView>
  );
}
