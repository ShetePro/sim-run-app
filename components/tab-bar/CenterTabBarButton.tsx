import { View, StyleSheet, Pressable, useColorScheme } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function CenterTabBarButton() {
  const colors = useThemeColor();
  const theme = useColorScheme();
  function goRun() {
    router.push("/(views)/run");
  }
  return (
    <Pressable style={styles.centerWarp} onPress={goRun}>
      <View
        style={[styles.centerButton, { backgroundColor: colors.active, shadowColor: colors.active }]}
      >
        <MaterialCommunityIcons name="run-fast" size={24} color={"white"} />
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  centerWarp: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
    top: -20,
    width: 60,
    height: 60,
    borderRadius: "50%",
    padding: 2,
    zIndex: 10,
  },
  centerButton: {
    zIndex: 99,
    borderRadius: 30,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 5 10 rgba(0, 0, 0, .5);",
    shadowOffset: { width: 0, height: 8 }, // 阴影向下偏移 4px
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5, // Android 阴影
  },
});
