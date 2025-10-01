import { View, StyleSheet, Pressable, useColorScheme } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function CenterTabBarButton() {
  const colors = useThemeColor();
  const theme = useColorScheme()
  function goRun() {
    router.replace("/(views)/run");
  }
  return (
    <Pressable style={styles.centerWarp} onPress={goRun}>
      <View style={[styles.centerButton, { backgroundColor: "#13c95e" }]}>
        <MaterialCommunityIcons name="run-fast" size={24} color={theme === 'dark' ? 'white' : colors.active} />
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
    padding: 5,
    zIndex: 99,
  },
  centerButton: {
    borderRadius: 25,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    boxShadow: '0 5 10 rgba(0, 0, 0, .5);'
  },
});
