import { Stack } from "expo-router";
import BackRouteIcon from "@/components/BackRouteIcon";

export default function ViewsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name={"run"}
        options={{
          headerShown: false,
        }}
      ></Stack.Screen>
    </Stack>
  );
}
