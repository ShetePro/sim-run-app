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
import { getStorageItem } from "@/hooks/useStorageState";
import { useVoiceAnnounce } from "@/hooks/useVoiceAnnounce";

// GPS信号强度指示器组件
function SignalStrengthIndicator({ accuracy }: { accuracy: number }) {
  // 根据误差米数计算信号等级 (0-4)
  const getSignalLevel = (acc: number): number => {
    if (acc <= 0) return 0;
    if (acc <= 5) return 4;   // 优秀 <5m
    if (acc <= 10) return 3;  // 良好 5-10m
    if (acc <= 20) return 2;  // 一般 10-20m
    if (acc <= 50) return 1;  // 较差 20-50m
    return 0;                 // 很差 >50m
  };

  const level = getSignalLevel(accuracy);
  const totalBars = 4;

  // 根据等级获取颜色
  const getColor = (barIndex: number) => {
    if (barIndex >= level) return "rgba(255,255,255,0.2)";
    if (level === 4) return "#22c55e"; // 绿色-优秀
    if (level === 3) return "#84cc16"; // 黄绿-良好
    if (level === 2) return "#f59e0b"; // 橙色-一般
    return "#ef4444"; // 红色-差
  };

  return (
    <View style={signalStyles.container}>
      <View style={signalStyles.barsContainer}>
        {Array.from({ length: totalBars }).map((_, index) => (
          <View
            key={index}
            style={[
              signalStyles.bar,
              {
                height: 6 + index * 3,
                backgroundColor: getColor(index),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const signalStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 16,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 16,
  },
  bar: {
    width: 4,
    borderRadius: 1,
  },
});

export default function RunIndexScreen() {
  const { t } = useTranslation();
  const { location, startTracking, stopTracking, pauseTracking, resumeTracking, getCurrentRunId, distance, heading, routePoints, isPaused } = useRun();
  const runStore = useRunStore();
  const router = useRouter();
  const { seconds, startTimer, stopTimer, pauseTimer, resumeTimer, isPaused: isTimerPaused } = useTick();
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const { startPedometer, stopPedometer } = usePedometer();
  const {
    announceStart,
    announceFinish,
    announcePause,
    announceResume,
    announceCountdown,
    checkAndAnnounce,
    resetAnnounceState,
  } = useVoiceAnnounce();

  useEffect(() => {
    if (seconds % 10 === 0 && distance > 10) {
      runStore.setPace(seconds / (distance / 1000));
    }
  }, [seconds, distance]);

  // 周期性语音播报检查
  useEffect(() => {
    if (seconds > 0 && distance > 0) {
      checkAndAnnounce({
        distance,
        duration: seconds,
        pace: runStore.pace,
        calories: calculateCalories(seconds),
      });
    }
  }, [seconds, distance, runStore.pace]);

  // 获取用户体重（默认70kg）
  const getUserWeight = () => {
    const userInfo = getStorageItem("userInfo");
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      const weight = parseFloat(parsed.weight);
      if (!isNaN(weight) && weight > 0) {
        return weight;
      }
    }
    return 70; // 默认体重70kg
  };

  // 计算卡路里消耗
  const calculateCalories = (durationSeconds: number) => {
    const weight = getUserWeight();
    // MET值：跑步约10，公式：卡路里 = MET * 体重(kg) * 时间(小时)
    return Math.floor(10 * weight * (durationSeconds / 3600));
  };

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
        value: calculateCalories(seconds),
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
  async function onFinish() {
    stopTimer();
    stopPedometer();

    const calories = calculateCalories(seconds);
    const runData = {
      time: seconds,
      pace: runStore.pace,
      energy: calories,
    };

    // 播报结束
    announceFinish({
      distance,
      duration: seconds,
      pace: runStore.pace,
      calories,
    });

    // 获取跑步记录ID
    const runId = getCurrentRunId();

    // 先保存到数据库，等待完成后再跳转
    await stopTracking(runData);

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
    resetAnnounceState();
    startTracking();
    startPedometer();
    startTimer();
    announceStart();
  }

  function onPause() {
    pauseTracking();
    pauseTimer();
    announcePause();
  }

  function onResume() {
    resumeTracking();
    resumeTimer();
    announceResume();
  }
  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-slate-900 pb-4 p-2"
      edges={["top"]}
    >
      {showCountdown && (
        <Countdown
          onFinish={countdownFinish}
          onCountChange={(count) => announceCountdown(count)}
        />
      )}
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
        <View style={styles.topBar}>
          <ThemedText style={styles.topBarText}>{t("run.steps")}:{runStore.stepCount}</ThemedText>
          <SignalStrengthIndicator accuracy={runStore.accuracy} />
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
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
    gap: 12,
    paddingHorizontal: 10,
  },
  topBarText: {
    fontSize: 14,
    lineHeight: 16,
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
