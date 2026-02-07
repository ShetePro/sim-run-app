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
import { Ionicons } from "@expo/vector-icons";

export default function RunIndexScreen() {
  const { t } = useTranslation();
  const { location, startTracking, stopTracking, pauseTracking, resumeTracking, getCurrentRunId, distance, heading, routePoints, isPaused } = useRun();
  const runStore = useRunStore();
  const router = useRouter();
  const { seconds, startTimer, stopTimer, pauseTimer, resumeTimer, isPaused: isTimerPaused } = useTick();
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
  function onFinish() {
    stopTimer();
    stopPedometer();

    const runData = {
      time: seconds,
      pace: runStore.pace,
      energy: Math.floor(10 * 70 * (seconds / 3600)),
    };

    // 获取跑步记录ID
    const runId = getCurrentRunId();

    // 先保存到数据库，然后跳转到确认页
    stopTracking(runData);

    // 只传递 runId，详情页面从数据库查询
    router.push({
      pathname: "/(views)/run-summary",
      params: {
        runId: String(runId || 0),
      },
    });
  }

  function onCancel() {
    // 未开始跑步，直接返回上一页
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

  function onPause() {
    pauseTracking();
    pauseTimer();
  }

  function onResume() {
    resumeTracking();
    resumeTimer();
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
        {/* 暂停状态提示 */}
        {isTimerPaused && (
          <View style={styles.pausedBanner}>
            <Ionicons name="pause-circle" size={24} color="#F59E0B" />
            <ThemedText style={styles.pausedText}>{t("run.paused")}</ThemedText>
          </View>
        )}
        <View className={"flex flex-row justify-end gap-4"}>
          <ThemedText>{t("run.steps")}:{runStore.stepCount}</ThemedText>
          <ThemedText>{t("run.signal")}:{Math.floor(runStore.accuracy)}</ThemedText>
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
          path={routePoints}
          style={{ flex: 1, borderRadius: 18, marginHorizontal: 10 }}
        />
        <View className={"flex flex-row gap-4 mt-4"}>
          {seconds === 0 ? (
            <>
              {/* 未开始状态：开始按钮 + 取消按钮 */}
              <Pressable style={styles.startButton} onPress={onStart}>
                <ThemedText
                  style={{ color: "#fff", textAlign: "center", fontSize: 18 }}
                >
                  {t("run.start")}
                </ThemedText>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={onCancel}>
                <ThemedText
                  style={{ color: "#fff", textAlign: "center", fontSize: 18 }}
                >
                  {t("common.cancel")}
                </ThemedText>
              </Pressable>
            </>
          ) : isTimerPaused ? (
            /* 暂停状态：继续按钮 + 结束按钮 */
            <>
              <Pressable style={styles.resumeButton} onPress={onResume}>
                <View style={styles.buttonContent}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <ThemedText style={styles.buttonText}>
                    {t("run.resume")}
                  </ThemedText>
                </View>
              </Pressable>
              <Pressable style={styles.finishButton} onPress={onFinish}>
                <View style={styles.buttonContent}>
                  <Ionicons name="stop" size={20} color="#fff" />
                  <ThemedText style={styles.buttonText}>
                    {t("run.finish")}
                  </ThemedText>
                </View>
              </Pressable>
            </>
          ) : (
            /* 跑步中状态：暂停按钮 */
            <>
              <Pressable style={styles.pauseButton} onPress={onPause}>
                <View style={styles.buttonContent}>
                  <Ionicons name="pause" size={20} color="#fff" />
                  <ThemedText style={styles.buttonText}>
                    {t("run.pause")}
                  </ThemedText>
                </View>
              </Pressable>
              <Pressable style={styles.finishButton} onPress={onFinish}>
                <View style={styles.buttonContent}>
                  <Ionicons name="stop" size={20} color="#fff" />
                  <ThemedText style={styles.buttonText}>
                    {t("run.finish")}
                  </ThemedText>
                </View>
              </Pressable>
            </>
          )}
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
  cancelButton: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#6b7280",
    padding: 15,
    borderRadius: 10,
    height: 50,
  },
  pauseButton: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#F59E0B",
    padding: 15,
    borderRadius: 10,
    height: 50,
  },
  resumeButton: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#32a211",
    padding: 15,
    borderRadius: 10,
    height: 50,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  pausedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 10,
    gap: 8,
  },
  pausedText: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: "600",
  },
});
