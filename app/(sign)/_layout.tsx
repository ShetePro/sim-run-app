import { Stack, useRouter} from "expo-router";
import BackRouteIcon from "@/components/BackRouteIcon";

export default function ViewsLayout() {
  const router = useRouter()
  router.replace('/(tabs)')
  return null
  // return (
    // <Stack screenOptions={{headerShown: false}}>
    //   <Stack.Screen name={"/SignIn"}></Stack.Screen>
    //   <Stack.Screen name={"/SignUp"}></Stack.Screen>
    // </Stack>
  // );
}
