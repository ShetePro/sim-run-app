import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { LifeCountCard } from "@/components/card/LifeCountCard";
import { MenuItem } from "@/components/ui/MenuItem";
import { Divider } from "@/components/ui/Divider";
import { SwitchItem } from "@/components/ui/SwitchItem";
import { DefaultAvatar } from "@/components/DefaultAvatar";
import { getStorageItem } from "@/hooks/useStorageState";
import { useSettingsStore, LANGUAGE_NAMES } from "@/store/settingsStore";
import { useDemoData } from "@/hooks/useDemoData";
import Toast from "react-native-toast-message";

// 开发模式标志
const isDevMode = __DEV__;

export default function UserProfileScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const { settings, updateSetting, isLoaded, initialize } = useSettingsStore();
  const { loadDemoData, clearDemoData } = useDemoData();
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // 使用 state 存储用户信息，页面聚焦时刷新
  const [userInfo, setUserInfo] = useState(
    getStorageItem("userInfo", true) || {},
  );

  // 页面聚焦时刷新用户数据
  useFocusEffect(
    useCallback(() => {
      const freshUserInfo = getStorageItem("userInfo", true) || {};
      setUserInfo(freshUserInfo);
    }, []),
  );

  // 初始化设置
  useFocusEffect(
    useCallback(() => {
      if (!isLoaded) {
        initialize();
      }
    }, [isLoaded, initialize]),
  );

  // 计算当前是否为深色模式（考虑 system 设置）
  const isDarkMode =
    settings.themeMode === "system"
      ? colorScheme === "dark"
      : settings.themeMode === "dark";

  // 处理主题切换 - 只更新设置，不直接操作主题
  const handleThemeToggle = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    updateSetting("themeMode", newTheme);
  };

  // 处理注销
  const handleLogout = () => {
    Alert.alert(t("setting.logout"), "确定要退出当前账号吗？", [
      { text: t("common.cancel") || "取消", style: "cancel" },
      {
        text: t("setting.logout"),
        style: "destructive",
        onPress: () => console.log("Logged out"),
      },
    ]);
  };

  // 加载演示数据
  const handleLoadDemoData = async () => {
    if (isLoadingDemo) return;
    setIsLoadingDemo(true);

    try {
      const result = await loadDemoData();
      if (result.success) {
        Toast.show({
          type: "success",
          text1: "✅ 加载成功",
          text2: result.message,
        });
      } else {
        Toast.show({
          type: "info",
          text1: "ℹ️ 提示",
          text2: result.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "❌ 加载失败",
        text2: "请稍后重试",
      });
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // 清空演示数据
  const handleClearDemoData = async () => {
    Alert.alert("清空演示数据", "确定要清空所有演示数据吗？此操作不可恢复。", [
      { text: "取消", style: "cancel" },
      {
        text: "清空",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await clearDemoData();
            Toast.show({
              type: result.success ? "success" : "info",
              text1: result.success ? "✅ 已清空" : "ℹ️ 提示",
              text2: result.message,
            });
          } catch (error) {
            Toast.show({
              type: "error",
              text1: "❌ 清空失败",
              text2: "请稍后重试",
            });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* --- 头部：个人信息与概览 --- */}
        <View className="px-6 pt-8 pb-6 bg-white dark:bg-slate-800 rounded-b-3xl mb-6">
          <View className="flex-row items-center mb-6">
            {userInfo.avatar ? (
              <Image
                source={userInfo.avatar}
                className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900"
                contentFit="cover"
                transition={500}
              />
            ) : (
              <DefaultAvatar nickname={userInfo.nickname} size={80} />
            )}
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-slate-800 dark:text-white">
                {userInfo.nickname || "runer"}
              </Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm">
                {userInfo.signature || "-"}
              </Text>
              <TouchableOpacity
                className="mt-2 bg-indigo-50 dark:bg-indigo-900/30 self-start px-3 py-1 rounded-full"
                onPress={() => router.push("/(views)/profile")}
              >
                <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                  {t("setting.editProfile")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <LifeCountCard className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl" />
        </View>

        {/* --- 设置分组 1: 应用偏好 --- */}
        <View className="px-5 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("setting.preferences")}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <MenuItem
              icon="language"
              color="#3B82F6"
              label={t("setting.language")}
              value={LANGUAGE_NAMES[settings.language]}
              onPress={() => router.push("/(views)/language")}
            />
            <Divider />
            <SwitchItem
              icon="moon"
              title={t("setting.darkMode")}
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              colorScheme="purple"
            />
          </View>
        </View>

        {/* --- 设置分组 2: 跑步工具 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("setting.tools")}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <MenuItem
              icon="map-outline"
              color="#10B981"
              label={t("setting.map")}
              value={
                t(`mapSettings.mapType.${settings.map.mapType}`) ||
                settings.map.mapType
              }
              onPress={() => router.push("/(views)/map-settings")}
            />
            <Divider />
            <MenuItem
              icon="cloud-outline"
              color="#3B82F6"
              label={t("setting.cloudSync") || "云端同步"}
              value={t("setting.cloudSyncValue") || "iCloud"}
              onPress={() => router.push("/(views)/cloud-sync")}
            />
            <Divider />
            <MenuItem
              icon="flag-outline"
              color="#F59E0B"
              label={t("setting.editPlan") || "跑步计划"}
              value={
                settings.plan.enabled
                  ? t("common.enabled")
                  : t("common.disabled")
              }
              onPress={() => router.push("/(views)/plan-settings")}
            />
            <Divider />
            <MenuItem
              icon="volume-high-outline"
              color="#EC4899"
              label={t("voiceSettings.title") || "语音播报"}
              onPress={() => router.push("/(views)/voice-settings")}
            />
          </View>
        </View>

        {/* --- 设置分组 3: 其他 --- */}
        <View className="px-5 mt-4 mb-8">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("setting.other")}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <MenuItem
              icon="help-circle-outline"
              color="#64748B"
              label={t("setting.helps")}
              onPress={() => router.push("/(views)/help")}
            />
            <Divider />
            <MenuItem
              icon="information-circle-outline"
              color="#64748B"
              label={t("setting.about")}
              value="v1.0.0"
              onPress={() => router.push("/(views)/about")}
            />
          </View>

          {/* --- 开发模式：演示数据 --- */}
          {isDevMode && (
            <View className="mt-6 mb-6">
              <Text className="text-orange-500 text-xs font-bold uppercase mb-2 ml-2">
                开发模式
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                <MenuItem
                  icon="download-outline"
                  color="#F97316"
                  label="加载演示数据"
                  value={isLoadingDemo ? "加载中..." : "8条记录"}
                  onPress={handleLoadDemoData}
                />
                <Divider />
                <MenuItem
                  icon="trash-outline"
                  color="#EF4444"
                  label="清空演示数据"
                  onPress={handleClearDemoData}
                />
              </View>
              <Text className="text-slate-400 text-xs mt-2 ml-2">
                仅在开发模式显示，用于 App Store 截图
              </Text>
            </View>
          )}

          <Text className="text-center text-slate-400 text-xs mt-10 mb-10">
            SimRun App © 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
