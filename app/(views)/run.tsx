import { StyleSheet, View, Pressable, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Map from "@/components/map/Map";
import { useRun } from "@/hooks/useRun";
import { useEffect, useMemo, useState } from "react";
import { secondFormatHours } from "@/utils/util";
import { useTick } from "@/hooks/useTick";
import Countdown from "@/components/Countdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePedometer } from "@/hooks/usePedometer";
import { useRunStore } from "@/store/runStore";

export default function RunIndexScreen() {
  const { t } = useTranslation();
  const { location, startTracking, stopTracking, distance, heading } = useRun();
  const runStore = useRunStore();
  const router = useRouter();
  const { seconds, startTimer, stopTimer } = useTick();
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const { startPedometer, stopPedometer } = usePedometer();

  useEffect(() => {
    if (seconds % 10 === 0 && distance > 10) {
      runStore.setPace(seconds / (distance / 1000));
    }
  }, [seconds, distance]);

  const detailList = useMemo(() => {
    const data = [
      {
        label: t("activity.pace"),
        value: secondFormatHours(runStore.pace),
        unit: "/" + t("unit.km"),
      },
      {
        label: t("common.time"),
        value: secondFormatHours(seconds),
      },
      {
        label: t("activity.energy"),
        value: Math.floor(10 * 70 * (seconds / 3600)),
        unit: t("unit.kcal"),
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
  }, [distance, seconds, runStore.pace]);
  function onBack() {
    stopTimer();
    stopPedometer();
    stopTracking({
      time: seconds,
      pace: runStore.pace,
      energy: Math.floor(10 * 70 * (seconds / 3600)),
    });
    router.back();
  }
  function onStart() {
    setShowCountdown(true);
  }
  function countdownFinish() {
    setShowCountdown(false);
    startTracking();
    startPedometer();
    startTimer();
  }
  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-slate-900 pb-4 p-2"
      edges={["top"]}
    >
      {showCountdown && <Countdown onFinish={countdownFinish} />}
      <View
        style={{
          paddingBottom: 20,
          flex: 1,
          padding: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <View className={"flex flex-row justify-end gap-4"}>
          <ThemedText>步数:{runStore.stepCount}</ThemedText>
          <ThemedText>信号强度:{Math.floor(runStore.accuracy)}</ThemedText>
        </View>
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
              {t("unit.km")}
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
    </SafeAreaView>
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
