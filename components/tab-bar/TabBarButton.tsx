import { Pressable, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useThemeColor } from "@/hooks/useThemeColor";
type TabBarButtonProps = {
  routeName: string;
  onPress: () => void;
  onLongPress: () => void;
  color: string;
  label: string;
  isFocused: boolean;
  style?: StyleProp<ViewStyle>;
};
const icons = {
  index: "home-outline",
  "index-fill": "home",
  history: "timer-outline",
  "history-fill": "timer",
  user: "person-outline",
  "user-fill": "person",
  category: "prism",
  "category-fill": "prism-outline",
  charts: "stats-chart-outline",
  "charts-fill": "stats-chart",
} as Partial<Record<string, React.ComponentProps<typeof Ionicons>["name"]>>;
export default function TabBarButton({
  onLongPress,
  onPress,
  label,
  routeName,
  isFocused,
  color,
  style,
}: TabBarButtonProps) {
  const colors = useThemeColor();
  const icon = (
    <Ionicons
      name={isFocused ? icons[routeName + "-fill"] : icons[routeName]}
      size={24}
      color={isFocused ? colors.active : colors.icon}
    />
  );
  const scale = useSharedValue(0);
  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      duration: 350,
    });
  }, [scale, isFocused]);
  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value, [0, 1], [0, 9]);
    return {
      transform: [{ scale: scaleValue }],
      top,
    };
  });
  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);
    return {
      opacity,
    };
  });
  return (
    <Pressable
      key={routeName}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.tabBarItem, style]}
    >
      <Animated.View style={animatedIconStyle}>{icon}</Animated.View>
      <Animated.Text style={[animatedTextStyle, { color, fontSize: 12 }]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  tabBarItem: {
    flex: 1,
    gap: 10,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
