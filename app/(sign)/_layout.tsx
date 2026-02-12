import { useRouter } from "expo-router";

export default function ViewsLayout() {
  const router = useRouter();
  router.replace("/(tabs)");
  return null;
  // return (
  // <Stack screenOptions={{headerShown: false}}>
  //   <Stack.Screen name={"/SignIn"}></Stack.Screen>
  //   <Stack.Screen name={"/SignUp"}></Stack.Screen>
  // </Stack>
  // );
}
