import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
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
}

export default function Countdown({ onFinish }: CountdownProps) {
  const [count, setCount] = useState(3);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
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
    position: "absolute",
    width: "100%",
    height: "100%",
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
