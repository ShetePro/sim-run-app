import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface CountdownProps {
  onFinish?: () => void;
  onCountChange?: (count: number) => void; // 倒计时数字变化回调
}

const { width, height } = Dimensions.get("window");

export default function Countdown({ onFinish, onCountChange }: CountdownProps) {
  const [count, setCount] = useState(3);
  const prevCountRef = useRef<number | null>(null);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 数字变化时触发回调（避免重复播报同一数字）
    if (prevCountRef.current !== count && onCountChange) {
      onCountChange(count);
      prevCountRef.current = count;
    }

    // 每次数字变化时执行动画
    scale.value = 0;
    opacity.value = 0;

    scale.value = withSequence(
      withTiming(1.5, { duration: 700, easing: Easing.out(Easing.ease) }),
      withDelay(200, withTiming(0, { duration: 200 })),
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(500, withTiming(0, { duration: 300 })),
    );

    // 倒数递减
    const t = setTimeout(() => {
      if (count > 0) setCount((prev) => prev - 1);
    }, 1000);
    if (count === 0) {
      onFinish?.();
    }
    return () => clearTimeout(t);
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, animatedStyle]}>
        {count > 0 ? count : "GO!"}
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
