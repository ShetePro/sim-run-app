import { StyleSheet, View, Pressable } from "react-native";

import PageView from "@/components/PageView";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Map from "@/components/map/Map";
import { usePosition } from "@/hooks/usePosition";
import { useEffect, useMemo, useState } from "react";
import { secondFormatHours } from "@/utils/util";

type RunDataType = {
  distance: number;
  time: number;
  pace: number;
  energy: number;
};
let updateRun: any | null = null;
export default function RunIndexScreen() {
  const { t } = useTranslation();
  const { location, startTracking } = usePosition();
  const router = useRouter();
  const [runData, setRunData] = useState<RunDataType>({
    distance: 0.0,
    time: 0,
    pace: 0,
    energy: 0,
  });
  const detailList = useMemo(() => {
    return [
      {
        label: t("activity.pace"),
        value: secondFormatHours(runData.pace),
        unit: "/" + t("activity.km"),
      },
      {
        label: t("common.time"),
        value: secondFormatHours(runData.time),
      },
      {
        label: t("activity.energy"),
        value: runData.energy,
        unit: t("activity.kcal"),
      },
    ];
  }, [runData]);

  // 每秒更新一次数据
  useEffect(() => {
    startTracking();
    if (updateRun) {
      clearInterval(updateRun);
    } else {
      updateRun = setInterval(() => {
        console.log("update run data");
        setRunData((prev) => {
          const newTime = prev.time + 1;
          const newDistance = parseFloat(
            (prev.distance + Math.random() * 0.01).toFixed(2),
          );
          return {
            time: newTime,
            distance: newDistance,
            pace: newTime / newDistance,
            energy: Math.floor(newDistance * 60),
          };
        });
      }, 1000);
    }
    return () => clearInterval(updateRun);
  }, []);
  function onBack() {
    router.replace("/(tabs)");
  }
  return (
    <PageView>
      <View
        style={{
          paddingBottom: 20,
          flex: 1,
          padding: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
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
              {runData.distance}
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
        <Map
          location={location}
          style={{ flex: 1, borderRadius: 18, marginHorizontal: 10 }}
        />
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
