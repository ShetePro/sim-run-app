import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";

interface MapLoadingProps {
  style?: any;
}

export function MapLoading({ style }: MapLoadingProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // 动画值
  const pulseAnim1 = useRef(new Animated.Value(0)).current;
  const pulseAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim3 = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 淡入动画
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // 脉冲动画 - 三个圆圈依次扩散
    const createPulseAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    // 启动三个脉冲动画，错开 500ms
    createPulseAnimation(pulseAnim1, 0).start();
    createPulseAnimation(pulseAnim2, 500).start();
    createPulseAnimation(pulseAnim3, 1000).start();

    // 图标旋转动画
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();

    return () => {
      // 清理动画
      pulseAnim1.stopAnimation();
      pulseAnim2.stopAnimation();
      pulseAnim3.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, []);

  // 插值计算
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pulseStyle1 = {
    transform: [
      {
        scale: pulseAnim1.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
    opacity: pulseAnim1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const pulseStyle2 = {
    transform: [
      {
        scale: pulseAnim2.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
    opacity: pulseAnim2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  const pulseStyle3 = {
    transform: [
      {
        scale: pulseAnim3.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
    opacity: pulseAnim3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
  };

  // 主题色
  const themeColor = isDark ? "#818cf8" : "#6366f1"; // Indigo-400 : Indigo-500
  const bgColor = isDark ? "bg-slate-900" : "bg-gray-50";
  const textColor = isDark ? "text-slate-200" : "text-slate-700";
  const subTextColor = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <Animated.View
      style={[{ opacity: opacityAnim }, style]}
      className={`flex-1 items-center justify-center ${bgColor}`}
    >
      {/* 脉冲动画容器 */}
      <View style={styles.pulseContainer}>
        {/* 三个脉冲圆圈 */}
        <Animated.View
          style={[
            styles.pulseCircle,
            { backgroundColor: themeColor },
            pulseStyle1,
          ]}
        />
        <Animated.View
          style={[
            styles.pulseCircle,
            { backgroundColor: themeColor },
            pulseStyle2,
          ]}
        />
        <Animated.View
          style={[
            styles.pulseCircle,
            { backgroundColor: themeColor },
            pulseStyle3,
          ]}
        />

        {/* 中心定位图标 */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="locate" size={32} color={themeColor} />
          </Animated.View>
        </View>
      </View>

      {/* 文字提示 */}
      <View style={styles.textContainer}>
        <ThemedText className={`text-lg font-semibold ${textColor} mb-2`}>
          {t("map.loading.title")}
        </ThemedText>
        <ThemedText className={`text-sm ${subTextColor} text-center`}>
          {t("map.loading.subtitle")}
        </ThemedText>
      </View>

      {/* 装饰性背景圆环 */}
      <View
        style={[
          styles.decorativeRing,
          {
            borderColor: isDark
              ? "rgba(99, 102, 241, 0.1)"
              : "rgba(99, 102, 241, 0.15)",
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pulseContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  pulseCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  decorativeRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    opacity: 0.5,
  },
});

export default MapLoading;
