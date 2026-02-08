import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  Appearance,
  ColorSchemeName,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  isReady: boolean;
  onAnimationComplete: () => void;
}

export function CustomSplashScreen({
  isReady,
  onAnimationComplete,
}: SplashScreenProps) {
  const colorScheme = Appearance.getColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  
  // 动画值
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  
  const [showLoader, setShowLoader] = useState(false);

  // 入场动画
  useEffect(() => {
    // Logo 弹出动画
    Animated.sequence([
      // Logo 渐显 + 缩放
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      
      // 标题进入
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      
      // 副标题进入
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // 显示加载指示器
      setShowLoader(true);
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // 退出动画
  useEffect(() => {
    if (isReady) {
      // 延迟一点时间让用户看清完成状态
      setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onAnimationComplete();
        });
      }, 300);
    }
  }, [isReady]);

  const theme = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    textColor: isDark ? "#ffffff" : "#1f2937",
    subtitleColor: isDark ? "#94a3b8" : "#6b7280",
    accentColor: "#6366f1",
    loaderColor: isDark ? "#6366f1" : "#6366f1",
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundColor,
          opacity: containerOpacity,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* 背景装饰 */}
      <View style={styles.backgroundDecoration}>
        <View
          style={[
            styles.circle1,
            { backgroundColor: isDark ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.05)" },
          ]}
        />
        <View
          style={[
            styles.circle2,
            { backgroundColor: isDark ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.03)" },
          ]}
        />
      </View>

      {/* 主要内容 */}
      <View style={styles.content}>
        {/* Logo 区域 */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View
            style={[
              styles.logoWrapper,
              {
                backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                shadowColor: isDark ? "#000" : "#6366f1",
              },
            ]}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              contentFit="contain"
              transition={200}
            />
          </View>
        </Animated.View>

        {/* 品牌名称 */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          }}
        >
          <Text style={[styles.title, { color: theme.textColor }]}>
            SimRun
          </Text>
        </Animated.View>

        {/* 副标题 */}
        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          }}
        >
          <Text style={[styles.subtitle, { color: theme.subtitleColor }]}>
            您的最佳跑步伴侣
          </Text>
          <Text style={[styles.subtitleEn, { color: theme.subtitleColor }]}>
            Your Best Running Companion
          </Text>
        </Animated.View>
      </View>

      {/* 底部加载区域 */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: loaderOpacity },
        ]}
      >
        {showLoader && (
          <>
            <ActivityIndicator
              size="small"
              color={theme.loaderColor}
              style={styles.loader}
            />
            <Text style={[styles.loadingText, { color: theme.subtitleColor }]}>
              {isReady ? "准备就绪" : "正在加载..."}
            </Text>
          </>
        )}
      </Animated.View>

      {/* 版本号 */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: theme.subtitleColor }]}>
          v1.0.0
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    top: -width * 0.3,
    right: -width * 0.4,
  },
  circle2: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitleEn: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    opacity: 0.8,
  },
  footer: {
    position: "absolute",
    bottom: 120,
    alignItems: "center",
  },
  loader: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  versionContainer: {
    position: "absolute",
    bottom: 50,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
    opacity: 0.6,
  },
});

export default CustomSplashScreen;
