import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { LifeCountCard } from "@/components/card/LifeCountCard";
import { MenuItem } from "@/components/ui/MenuItem";
import { Divider } from "@/components/ui/Divider";
import { SwitchItem } from "@/components/ui/SwitchItem";
import { getStorageItem } from "@/hooks/useStorageState";
import { useSettingsStore, LANGUAGE_NAMES } from "@/store/settingsStore";

export default function UserProfileScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();
  const { t } = useTranslation();
  const { settings, updateSetting, isLoaded, initialize } = useSettingsStore();

  // 使用 state 存储用户信息，页面聚焦时刷新
  const [userInfo, setUserInfo] = useState(getStorageItem("userInfo", true) || {});

  // 页面聚焦时刷新用户数据
  useFocusEffect(
    useCallback(() => {
      const freshUserInfo = getStorageItem("userInfo", true) || {};
      setUserInfo(freshUserInfo);
    }, [])
  );

  // 初始化设置
  useEffect(() => {
    if (!isLoaded) {
      initialize();
    }
  }, []);

  // 同步主题设置到 nativewind
  useEffect(() => {
    if (isLoaded && settings.themeMode !== "system") {
      const isDark = settings.themeMode === "dark";
      const currentIsDark = colorScheme === "dark";
      if (isDark !== currentIsDark) {
        toggleColorScheme();
      }
    }
  }, [isLoaded, settings.themeMode]);

  // 处理主题切换
  const handleThemeToggle = () => {
    const newTheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newTheme);
    updateSetting("themeMode", newTheme);
  };

  // 处理注销
  const handleLogout = () => {
    Alert.alert(
      t("setting.logout"),
      "确定要退出当前账号吗？",
      [
        { text: t("common.cancel") || "取消", style: "cancel" },
        {
          text: t("setting.logout"),
          style: "destructive",
          onPress: () => console.log("Logged out"),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* --- 头部：个人信息与概览 --- */}
        <View className="px-6 pt-8 pb-6 bg-white dark:bg-slate-800 rounded-b-3xl mb-6">
          <View className="flex-row items-center mb-6">
            <Image
              source={userInfo.avatar || "-"}
              className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900"
              contentFit="cover"
              transition={500}
            />
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
              value={colorScheme === "dark"}
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
              value={t(`mapSettings.mapType.${settings.map.mapType}`) || settings.map.mapType}
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
              icon="notifications-outline"
              color="#F59E0B"
              label={t("setting.notify")}
              value={settings.notifications.enabled ? "开启" : "关闭"}
              onPress={() => router.push("/(views)/notifications")}
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

          <TouchableOpacity
            onPress={handleLogout}
            className="mt-6 flex-row items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-2 text-red-500 font-semibold text-base">
              {t("setting.logout")}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-slate-400 text-xs mt-6 mb-10">
            SimRun App © 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
