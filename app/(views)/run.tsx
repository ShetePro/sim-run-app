import { StyleSheet, SafeAreaView, View, Pressable } from "react-native";

import PageView from "@/components/PageView";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Map from "@/components/map/Map";

export default function RunIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const detailList = [
    {
      label: t("activity.pace"),
      value: "7:30",
      unit: "/" + t("activity.km"),
    },
    {
      label: t("common.time"),
      value: "20:00",
    },
    {
      label: t("activity.energy"),
      value: "350",
      unit: t("activity.kcal"),
    },
  ];
  function onBack() {
    router.replace("/(tabs)");
  }
  return (
    <PageView>
      <View style={{ paddingBottom: 20, flex: 1, padding: 10, display: 'flex', flexDirection: 'column' }}>
        <View>
          <ThemedText
            style={{
              marginHorizontal: "auto",
              color: "#F6F8F7",
              marginBottom: 20,
            }}
          >
            {t("activity.distance")}
          </ThemedText>
          <View className={"flex flex-row items-end justify-center mt-2"}>
            <ThemedText style={{ fontSize: 96, lineHeight: 100 }}>
              2.3
            </ThemedText>
            <ThemedText
              style={{ fontSize: 32, lineHeight: 38, marginBottom: 10 }}
            >
              {t("activity.km")}
            </ThemedText>
          </View>
        </View>
        <View
          className={"flex flex-row justify-around mt-10 mb-2"}
          style={{ height: 80 }}
        >
          {detailList.map((item) => {
            return (
              <View
                className={"flex flex-col items-center justify-center"}
                key={item.label}
              >
                <ThemedText style={{ color: "#F6F8F7" }}>
                  {item.label}
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 24, lineHeight: 40, marginTop: 5 }}
                >
                  {item.value}{" "}
                  <ThemedText style={{ fontSize: 16 }}>{item.unit}</ThemedText>
                </ThemedText>
              </View>
            );
          })}
        </View>
        <Map style={{ flex: 1, borderRadius: 18, marginHorizontal: 10 }} />
        <Pressable style={styles.finishButton} onPress={onBack}>
          <ThemedText
            style={{ color: "#fff", textAlign: "center", fontSize: 18 }}
          >
            结束跑步
          </ThemedText>
        </Pressable>
      </View>
    </PageView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  finishButton: {
    marginTop: 20,
    backgroundColor: "#dc282d",
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 10,
    height: 50,
  },
});
