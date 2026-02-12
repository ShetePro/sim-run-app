import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef, useCallback } from "react";
import "react-native-reanimated";
import "../styles/global.css";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Appearance, LogBox, AppState } from "react-native";
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
import "@/utils/location/locationTask";
import { useSettingsStore, migrateFromLegacy } from "@/store/settingsStore";
import {
  OnboardingScreen,
  ONBOARDING_KEY,
} from "@/components/OnboardingScreen";
import { getStorageItemAsync } from "@/hooks/useStorageState";
import { CustomSplashScreen } from "@/components/SplashScreen";
import ErrorBoundary from "@/components/ErrorBoundary";

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
  const appStateRef = useRef(AppState.currentState);
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  useEffect(() => {
    const subscription = Appearance.addChangeListener((theme) => {
      setColorScheme(theme.colorScheme);
    });
    return () => subscription.remove();
  }, []);

  // 监听应用状态变化（后台/前台切换）
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // 应用从后台恢复到前台
        console.log("📱 应用从后台恢复到前台");
        // 重新初始化状态
        useSettingsStore.getState().initialize();
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const [loaded] = useFonts({
    LexendRegular: require("../assets/fonts/Lexend-Regular.ttf"),
    LexendBold: require("../assets/fonts/Lexend-Bold.ttf"),
    LexendSemiBold: require("../assets/fonts/Lexend-SemiBold.ttf"),
  });

  const insets = useSafeAreaInsets();

  // 主初始化函数
  const initializeApp = useCallback(async () => {
    try {
      console.log("[App] 开始初始化应用...");

      // 1. 请求权限
      await requestLocationPermission();

      // 2. 初始化设置 store
      await useSettingsStore.getState().initialize();

      // 3. 迁移旧数据
      await migrateFromLegacy();

      // 4. 从 iCloud 恢复数据库
      await restoreDatabaseFromICloud();

      console.log("[App] 应用初始化完成");
    } catch (error) {
      console.error("[App] 初始化失败:", error);
    }
  }, []);

  // 从 iCloud 备份恢复数据库
  const restoreDatabaseFromICloud = async () => {
    try {
      const hasBackup = await checkBackupExists();
      if (hasBackup) {
        console.log("🔄 发现数据库备份，正在恢复...");
        await restoreDatabase();
        console.log("✅ 数据库恢复完成");
      }
    } catch (error) {
      console.error("❌ 恢复数据库失败:", error);
    }
  };

  // 统一的启动准备逻辑
  useEffect(() => {
    async function prepare() {
      try {
        console.log("[App] 开始准备应用...");

        // 检查引导页
        const hasSeenOnboarding = await getStorageItemAsync(ONBOARDING_KEY);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
        setIsCheckingOnboarding(false);

        console.log("[App] 引导页检查完成");
      } catch (error) {
        console.error("[App] 准备应用失败:", error);
        setIsCheckingOnboarding(false);
      } finally {
        // 关键：无论成功失败都隐藏启动屏
        console.log("[App] 隐藏启动屏...");
        await SplashScreen.hideAsync();
        setIsAppReady(true);
      }
    }

    if (loaded) {
      prepare();
    }
  }, [loaded]);

  // 初始化应用（非引导页状态）
  useEffect(() => {
    if (
      isAppReady &&
      !isCheckingOnboarding &&
      !showOnboarding &&
      !hasCompletedOnboarding
    ) {
      initializeApp();
    }
  }, [
    isAppReady,
    isCheckingOnboarding,
    showOnboarding,
    hasCompletedOnboarding,
    initializeApp,
  ]);

  // 初始化应用（引导页完成后）
  useEffect(() => {
    if (hasCompletedOnboarding) {
      initializeApp();
    }
  }, [hasCompletedOnboarding, initializeApp]);

  // 处理引导页完成
  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  // 渲染主应用
  const renderContent = () => (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
      <SQLiteProvider databaseName="simrun.db" onInit={initializeSQLite}>
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

  // 应用加载中时返回 null（启动屏会显示）
  if (!loaded || isCheckingOnboarding) {
    return null;
  }

  // 显示自定义启动过渡页
  if (isCustomSplashVisible) {
    return (
      <ErrorBoundary>
        <CustomSplashScreen
          isReady={isAppReady}
          onAnimationComplete={() => setIsCustomSplashVisible(false)}
        />
      </ErrorBoundary>
    );
  }

  // 显示引导页
  if (showOnboarding) {
    return (
      <ErrorBoundary>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </ErrorBoundary>
    );
  }

  // 主应用（包裹 ErrorBoundary）
  return <ErrorBoundary>{renderContent()}</ErrorBoundary>;
}
