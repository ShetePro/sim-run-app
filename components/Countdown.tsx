import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import * as Speech from "expo-speech";

interface CountdownProps {
  onFinish?: () => void;
  onCountChange?: (count: number) => Promise<void> | void; // 支持异步回调
}

const { width, height } = Dimensions.get("window");

export default function Countdown({ onFinish, onCountChange }: CountdownProps) {
  // 使用 ref 替代 state 追踪计数，避免 useEffect 依赖问题
  const currentCountRef = useRef(3);
  const hasStartedRef = useRef(false);
  const isInitializedRef = useRef(false);

  const [displayCount, setDisplayCount] = useState(3);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // 执行动画
  const runAnimation = useCallback(() => {
    scale.value = 0.5;
    opacity.value = 0;

    scale.value = withSequence(
      withTiming(1.2, { duration: 300, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200 }),
    );

    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  // 处理倒计时逻辑
  useEffect(() => {
    // 防止重复执行
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const processNext = async () => {
      const count = currentCountRef.current;

      if (count < 0) {
        onFinish?.();
        return;
      }

      // 显示当前数字
      setDisplayCount(count);
      runAnimation();

      // 触发回调（语音播报）- 等待语音完成
      if (onCountChange) {
        await onCountChange(count);
      }

      // 递减计数
      currentCountRef.current = count - 1;

      // 直接执行下一个，由语音回调驱动节奏（移除固定延迟）
      processNext();
    };

    // TTS 预初始化 - 静默播放以消除冷启动延迟
    const initTTS = async () => {
      if (isInitializedRef.current) return;

      // 停止任何正在进行的语音
      Speech.stop();

      // 预初始化：静默播放一个空字符串或极短内容
      await new Promise<void>((resolve) => {
        Speech.speak("", {
          volume: 0, // 静音
          rate: 0.5, // 极快语速，最小化时间
          onDone: () => {
            isInitializedRef.current = true;
            resolve();
          },
          onError: () => {
            // 即使有错误也继续，避免卡住
            isInitializedRef.current = true;
            resolve();
          },
        });
      });

      // TTS 初始化完成后开始倒计时
      processNext();
    };

    initTTS();

    // 清理函数
    return () => {
      hasStartedRef.current = false;
      Speech.stop();
    };
  }, []); // 空依赖，只执行一次

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, animatedStyle]}>
        {displayCount > 0 ? displayCount : "GO!"}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  text: {
    fontSize: 120,
    fontWeight: "bold",
    color: "#fff",
  },
});
