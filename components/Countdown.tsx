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
  const [count, setCount] = useState(3);
  const [displayCount, setDisplayCount] = useState(3);
  const isRunningRef = useRef(true);
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

    opacity.value = withSequence(withTiming(1, { duration: 200 }));
  }, []);

  // 处理倒计时逻辑
  useEffect(() => {
    if (!isRunningRef.current) return;

    let isMounted = true;

    const processCount = async () => {
      while (isMounted && isRunningRef.current && count >= 0) {
        const startTime = Date.now();

        // 显示当前数字
        setDisplayCount(count);
        runAnimation();

        // 触发回调（语音播报）
        if (onCountChange) {
          await onCountChange(count);
        }

        // 确保最少显示时间
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDuration - elapsed);

        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        if (!isMounted || !isRunningRef.current) break;

        // 进入下一个数字
        if (count > 0) {
          setCount((prev) => prev - 1);
        } else {
          // 倒计时结束
          break;
        }
      }

      if (isMounted && isRunningRef.current) {
        onFinish?.();
      }
    };

    processCount();

    return () => {
      isMounted = false;
    };
  }, [count, onCountChange, onFinish, minDuration, runAnimation]);

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
