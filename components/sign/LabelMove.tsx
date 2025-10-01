import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "@/styles/theme";

export default function LabelMove({
  label,
  style,
  height = 0,
  render,
  error,
}: {
  render: (move: (flag: boolean) => void) => React.ReactNode;
  label: string;
  style?: ViewStyle;
  height: number;
  error?: boolean;
}) {
  const centerTop = height / 2 - 7;
  const labelTop = useSharedValue(centerTop);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: labelTop.value,
      fontWeight: labelTop.value < 0 ? 'bold' : 'normal',
    };
  });
  function labelMove(move: boolean) {
    labelTop.value = withTiming(move ? -7 : centerTop);
  }

  return (
    <View
      style={[
        styles.moveBox,
        style,
        { height, boxShadow: error ? `0 0 8px ${COLORS.dangerColor}` : "" },
      ]}
    >
      {render(labelMove)}
      <Animated.Text style={[styles.label, animatedStyle]}>
        {label}
      </Animated.Text>
    </View>
  );
}
const styles = StyleSheet.create({
  moveBox: {
    paddingLeft: 20,
    borderRadius: 10,
    backgroundColor: "#F1F4FF",
    position: "relative",
    marginVertical: 10,
  },
  label: {
    position: "absolute",
    color: "#626262",
    left: 30,
  },
});
