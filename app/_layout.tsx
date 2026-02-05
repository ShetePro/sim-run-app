import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../styles/global.css";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Appearance, LogBox } from "react-native";
import { SessionProvider } from "@/components/SessionProvider";
import Toast from "react-native-toast-message";
import "@/utils/i18n";
import { SQLiteProvider } from "expo-sqlite";
import { initializeSQLite } from "@/utils/sqlite";
import { restoreDatabase, checkBackupExists } from "@/utils/backup";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/zh-cn";
import { requestLocationPermission } from "@/utils/location/location";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import '@/utils/location/locationTask'
import { useSettingsStore, migrateFromLegacy } from "@/store/settingsStore";

dayjs.extend(isoWeek);
dayjs.locale("zh-cn");
// const AppStack = () => (
//   <>
//     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//     <Stack.Screen name="(views)" options={{ headerShown: false }} />
//     <Stack.Screen name="+not-found" />
//   </>
// );
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(["Require cycle: node_modules/victory"]);
export default function RootLayout() {
  // const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  Appearance.addChangeListener((theme) => {
    setColorScheme(() => theme.colorScheme);
  });
  const [loaded] = useFonts({
    // SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    // PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    // PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    // PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
    LexendRegular: require("../assets/fonts/Lexend-Regular.ttf"),
    LexendBold: require("../assets/fonts/Lexend-Bold.ttf"),
    LexendSemiBold: require("../assets/fonts/Lexend-SemiBold.ttf"),
  });

  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    requestLocationPermission();
    // 初始化设置（从存储加载）
    useSettingsStore.getState().initialize();
    // 迁移旧版本设置
    migrateFromLegacy();
    // 尝试从 iCloud 备份恢复数据库
    restoreDatabaseFromICloud();
  }, [loaded]);

  // 从 iCloud 备份恢复数据库
  const restoreDatabaseFromICloud = async () => {
    const hasBackup = await checkBackupExists();
    if (hasBackup) {
      console.log("🔄 发现数据库备份，正在恢复...");
      await restoreDatabase();
    }
  };

  if (!loaded) {
    return null;
  }
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
      <SQLiteProvider
        databaseName="simrun.db"
        onInit={initializeSQLite}
        useSuspense
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={theme}>
            <SessionProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  presentation: "card",
                }}
              >
                <Slot />
              </Stack>
            </SessionProvider>
            <StatusBar style="auto" />
            <Toast topOffset={insets.top + 10} visibilityTime={2000} />
          </ThemeProvider>
        </GestureHandlerRootView>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
