import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
} from "react-native-reanimated";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

/**
 * 空状态页面组件
 * 当没有数据时显示的美观提示
 */
export function EmptyState({
  title,
  subtitle,
  icon = "walk-outline",
  actionLabel,
  onAction,
  showAction = true,
}: EmptyStateProps) {
  const router = useRouter();
  const { t } = useTranslation();

  // 动画值
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  // 呼吸动画
  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 2000 }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(-10, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      // 默认跳转到首页开始跑步
      router.push("/(tabs)");
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* 动画图标容器 */}
      <View className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 items-center justify-center mb-8">
        <Animated.View style={iconAnimatedStyle}>
          <View className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 items-center justify-center shadow-lg">
            <Ionicons name={icon} size={48} color="#6366F1" />
          </View>
        </Animated.View>

        {/* 装饰性小圆点 */}
        <View className="absolute top-2 right-4 w-3 h-3 rounded-full bg-yellow-400" />
        <View className="absolute bottom-6 left-4 w-2 h-2 rounded-full bg-green-400" />
        <View className="absolute top-8 left-6 w-2 h-2 rounded-full bg-pink-400" />
      </View>

      {/* 主标题 */}
      <Text className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-3">
        {title || t("emptyState.title") || "还没有跑步记录"}
      </Text>

      {/* 副标题/说明文字 */}
      <Text className="text-base text-slate-500 dark:text-slate-400 text-center leading-6 mb-8">
        {subtitle ||
          t("emptyState.subtitle") ||
          "迈开第一步，开始记录你的每一次奔跑吧！🏃‍♂️"}
      </Text>

      {/* 特性列表 */}
      <View className="w-full mb-8">
        <FeatureItem
          icon="map-outline"
          text={t("emptyState.feature1") || "记录跑步轨迹"}
        />
        <FeatureItem
          icon="trophy-outline"
          text={t("emptyState.feature2") || "追踪个人进步"}
        />
        <FeatureItem
          icon="trending-up-outline"
          text={t("emptyState.feature3") || "分析运动数据"}
        />
      </View>

      {/* 行动按钮 */}
      {showAction && (
        <TouchableOpacity
          onPress={handleAction}
          className="bg-indigo-500 px-8 py-4 rounded-full shadow-lg shadow-indigo-500/30"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons name="play" size={20} color="#fff" />
            <Text className="ml-2 text-white font-semibold text-base">
              {actionLabel || t("emptyState.action") || "开始第一次跑步"}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 底部装饰文字 */}
      <Text className="mt-6 text-sm text-slate-400 dark:text-slate-500 italic">
        "{t("emptyState.quote")}"
      </Text>
    </View>
  );
}

/**
 * 特性列表项
 */
function FeatureItem({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View className="flex-row items-center mb-3">
      <View className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color="#6366F1" />
      </View>
      <Text className="text-slate-600 dark:text-slate-300">{text}</Text>
    </View>
  );
}

export default EmptyState;
