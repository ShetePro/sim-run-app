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

interface CountdownProps {
  onFinish?: () => void;
  onCountChange?: (count: number) => Promise<void> | void; // 支持异步回调
  minDuration?: number; // 每个数字显示的最短时间（毫秒）
}

const { width, height } = Dimensions.get("window");
const DEFAULT_MIN_DURATION = 800; // 默认最少显示 800ms

export default function Countdown({
  onFinish,
  onCountChange,
  minDuration = DEFAULT_MIN_DURATION,
}: CountdownProps) {
  // 使用 ref 替代 state 追踪计数，避免 useEffect 依赖问题
  const currentCountRef = useRef(3);
  const hasStartedRef = useRef(false);

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

      // 触发回调（语音播报）
      if (onCountChange) {
        await onCountChange(count);
      }

      // 递减计数
      currentCountRef.current = count - 1;

      // 延迟后执行下一个
      setTimeout(processNext, minDuration);
    };

    processNext();

    // 清理函数
    return () => {
      hasStartedRef.current = false;
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
