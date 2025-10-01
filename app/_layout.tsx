import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../styles/global.css";

import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import { Appearance } from "react-native";
import { SessionProvider } from "@/components/SessionProvider";
import Toast from "react-native-toast-message";
import "@/utils/i18n";

// const AppStack = () => (
//   <>
//     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//     <Stack.Screen name="(views)" options={{ headerShown: false }} />
//     <Stack.Screen name="+not-found" />
//   </>
// );
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  Appearance.addChangeListener((theme) => {
    setColorScheme(() => theme.colorScheme);
  });
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
  });
  const insets = useSafeAreaInsets()
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
      <ThemeProvider value={theme}>
        <SessionProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Slot />
          </Stack>
        </SessionProvider>
        <StatusBar style="auto" />
        <Toast topOffset={insets.top + 10} visibilityTime={2000} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
