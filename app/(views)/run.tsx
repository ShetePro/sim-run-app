import { StyleSheet, View, Pressable, Image } from "react-native";

import PageView from "@/components/PageView";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Map from "@/components/map/Map";
import { useRun } from "@/hooks/useRun";
import { useEffect, useMemo, useState } from "react";
import { secondFormatHours } from "@/utils/util";
import { useTick } from "@/hooks/useTick";


export default function RunIndexScreen() {
  const { t } = useTranslation();
  const { location, startTracking, distance, heading } = useRun();
  const router = useRouter();
  const { seconds, startTimer, stopTimer } = useTick();
  const [pace, setPace] = useState<string>("0:00");

  useEffect(() => {
    if (seconds % 10 === 0 && distance > 10) {
      setPace(secondFormatHours(seconds / (distance / 1000)));
    }
  }, [seconds, distance]);

  const detailList = useMemo(() => {
    const data = [
      {
        label: t("activity.pace"),
        value: pace,
        unit: "/" + t("activity.km"),
      },
      {
        label: t("common.time"),
        value: secondFormatHours(seconds),
      },
      {
        label: t("activity.energy"),
        value: Math.floor(10 * 70 * (seconds / 3600)),
        unit: t("activity.kcal"),
      },
    ];

    return data.map((item) => {
      return (
        <View
          className={"flex flex-col items-center justify-center flex-1"}
          key={item.label}
        >
          <ThemedText style={{ color: "#F6F8F7" }}>{item.label}</ThemedText>
          <ThemedText style={{ fontSize: 24, lineHeight: 40, marginTop: 5 }}>
            {item.value}
            <ThemedText style={{ fontSize: 16 }}>{item.unit}</ThemedText>
          </ThemedText>
        </View>
      );
    });
  }, [distance, seconds, pace]);
  function onBack() {
    stopTimer();
    router.replace("/(tabs)");
  }
  function onStart() {
    startTracking();
    startTimer();
    console.log("开始跑步");
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
              {(distance / 1000).toFixed(2)}
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
          {detailList}
        </View>
        <Map
          location={location}
          heading={heading}
          style={{ flex: 1, borderRadius: 18, marginHorizontal: 10 }}
        />
        <View className={"flex flex-row gap-4 mt-4"}>
          {seconds === 0 && (
            <Pressable style={styles.startButton} onPress={onStart}>
              <ThemedText
                style={{ color: "#fff", textAlign: "center", fontSize: 18 }}
              >
                开始
              </ThemedText>
            </Pressable>
          )}
          <Pressable style={styles.finishButton} onPress={onBack}>
            <ThemedText
              style={{ color: "#fff", textAlign: "center", fontSize: 18 }}
            >
              结束
            </ThemedText>
          </Pressable>
        </View>
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
  startButton: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#32a211",
    padding: 15,
    borderRadius: 10,
    height: 50,
  },
  finishButton: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#dc282d",
    padding: 15,
    borderRadius: 10,
    height: 50,
  },
});
