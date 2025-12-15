import { Stack } from "expo-router";
import BackRouteIcon from "@/components/BackRouteIcon";

export default function ViewsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name={"run"}></Stack.Screen>
      <Stack.Screen name={"language"} options={{}}></Stack.Screen>
    </Stack>
  );
}
