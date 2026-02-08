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
import { OnboardingScreen, ONBOARDING_KEY } from "@/components/OnboardingScreen";
import { getStorageItemAsync } from "@/hooks/useStorageState";
import { CustomSplashScreen } from "@/components/SplashScreen";

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isCustomSplashVisible, setIsCustomSplashVisible] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  
  useEffect(() => {
    const subscription = Appearance.addChangeListener((theme) => {
      setColorScheme(theme.colorScheme);
    });
    return () => subscription.remove();
  }, []);
  
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
  
  // 检查是否需要显示引导页
  useEffect(() => {
    const checkOnboarding = async () => {
      const hasSeenOnboarding = await getStorageItemAsync(ONBOARDING_KEY);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
      setIsCheckingOnboarding(false);
    };
    checkOnboarding();
  }, []);
  
  useEffect(() => {
    if (loaded && !isCheckingOnboarding) {
      // 先隐藏原生启动屏，显示自定义启动页
      SplashScreen.hideAsync();
      // 标记应用准备好，触发自定义启动页退出动画
      setIsAppReady(true);
    }
  }, [loaded, isCheckingOnboarding]);
  
  useEffect(() => {
    // 检查完成后，如果不需要显示引导页，直接初始化
    if (!isCheckingOnboarding && !showOnboarding) {
      requestLocationPermission();
      useSettingsStore.getState().initialize();
      migrateFromLegacy();
      restoreDatabaseFromICloud();
    }
  }, [isCheckingOnboarding, showOnboarding]);
  
  useEffect(() => {
    // 引导页完成后初始化
    if (hasCompletedOnboarding) {
      requestLocationPermission();
      useSettingsStore.getState().initialize();
      migrateFromLegacy();
      restoreDatabaseFromICloud();
    }
  }, [hasCompletedOnboarding]);
  
  // 处理引导页完成
  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    // 延迟隐藏引导页，确保主应用已准备好
    setTimeout(() => {
      setShowOnboarding(false);
    }, 100);
  };

  // 从 iCloud 备份恢复数据库
  const restoreDatabaseFromICloud = async () => {
    const hasBackup = await checkBackupExists();
    if (hasBackup) {
      console.log("🔄 发现数据库备份，正在恢复...");
      await restoreDatabase();
    }
  };

  if (!loaded || isCheckingOnboarding) {
    return null;
  }
  
  // 显示自定义启动过渡页
  if (isCustomSplashVisible) {
    return (
      <CustomSplashScreen
        isReady={isAppReady}
        onAnimationComplete={() => setIsCustomSplashVisible(false)}
      />
    );
  }
  
  // 显示引导页
  if (showOnboarding) {
    return (
      <OnboardingScreen onComplete={handleOnboardingComplete} />
    );
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
