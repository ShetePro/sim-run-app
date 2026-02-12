import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { MenuItem } from "@/components/ui/MenuItem";
import { Divider } from "@/components/ui/Divider";
import { SwitchItem } from "@/components/ui/SwitchItem";
import {
  useCloudSyncStore,
  useFormattedSyncTime,
  formatFileSize,
} from "@/store/cloudSyncStore";
import { useFocusEffect } from "expo-router";
import { importRunFromFile, ImportResult } from "@/utils/importRun";
import { useRunDB } from "@/hooks/useSQLite";
import { RunRecord } from "@/types/runType";

export default function CloudSyncScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const {
    settings,
    metadata,
    syncState,
    isLoaded,
    isWifiConnected,
    initialize,
    refreshBackupInfo,
    updateSettings,
    performSync,
    performRestore,
    resetState,
    checkNetworkStatus,
  } = useCloudSyncStore();

  const { addRun, updateRun } = useRunDB();

  const formattedSyncTime = useFormattedSyncTime();

  // 初始化
  useEffect(() => {
    if (!isLoaded) {
      initialize();
    }
  }, []);

  // 页面聚焦时刷新
  useFocusEffect(
    useCallback(() => {
      if (isLoaded) {
        refreshBackupInfo();
        checkNetworkStatus();
      }
    }, [isLoaded]),
  );

  // 处理同步按钮
  const handleSync = async () => {
    resetState();
    const success = await performSync();
    if (success) {
      // 成功提示已在 UI 中显示
    }
  };

  // 处理恢复按钮
  const handleRestore = () => {
    Alert.alert(
      t("cloudSync.restoreTitle") || "恢复数据",
      t("cloudSync.restoreConfirm") ||
        "这将用云端备份覆盖当前设备上的所有数据。确定要继续吗？",
      [
        {
          text: t("common.cancel") || "取消",
          style: "cancel",
        },
        {
          text: t("cloudSync.restore") || "恢复",
          style: "destructive",
          onPress: async () => {
            resetState();
            const success = await performRestore();
            if (success) {
              Alert.alert(
                t("cloudSync.restoreSuccess") || "恢复成功",
                t("cloudSync.restoreSuccessMessage") ||
                  "数据已成功恢复，请重启应用以应用更改。",
              );
            }
          },
        },
      ],
    );
  };

  // 切换自动同步
  const toggleAutoSync = async (value: boolean) => {
    await updateSettings({ autoSync: value });
  };

  // 切换仅 WiFi 同步
  const toggleWifiOnly = async (value: boolean) => {
    await updateSettings({ wifiOnly: value });
  };

  // 处理从文件导入
  const handleImportFromFile = async () => {
    Alert.alert(
      t("cloudSync.importTitle") || "导入数据",
      t("cloudSync.importMessage") ||
        "从 JSON 或 GPX 文件导入跑步记录。支持从其他设备导出的 SimRun 数据文件。",
      [
        {
          text: t("common.cancel") || "取消",
          style: "cancel",
        },
        {
          text: t("cloudSync.import") || "选择文件",
          onPress: async () => {
            const result: ImportResult = await importRunFromFile();
            if (result.success && result.data) {
              try {
                // 保存到数据库
                const runId = await addRun({
                  ...result.data.run,
                  startTime: result.data.run.startTime || Date.now(),
                } as RunRecord);

                // 更新轨迹点
                await updateRun({
                  id: runId,
                  points: result.data.trackPoints,
                });

                Alert.alert(
                  t("cloudSync.importSuccess") || "导入成功",
                  result.message,
                );
                // 刷新备份信息
                await refreshBackupInfo();
              } catch (error) {
                console.error("保存导入数据失败:", error);
                Alert.alert(
                  t("cloudSync.importFailed") || "导入失败",
                  "保存数据到数据库失败",
                );
              }
            } else if (result.message !== "用户取消了选择") {
              Alert.alert(
                t("cloudSync.importFailed") || "导入失败",
                result.message,
              );
            }
          },
        },
      ],
    );
  };

  // 获取状态颜色
  const getStatusColor = () => {
    switch (syncState.status) {
      case "success":
        return "#10B981"; // green-500
      case "error":
        return "#EF4444"; // red-500
      case "uploading":
      case "downloading":
        return "#3B82F6"; // blue-500
      default:
        return metadata.exists ? "#10B981" : "#9CA3AF"; // gray-400
    }
  };

  // 获取状态文本
  const getStatusText = () => {
    switch (syncState.status) {
      case "uploading":
        return t("cloudSync.syncing") || "正在同步...";
      case "downloading":
        return t("cloudSync.restoring") || "正在恢复...";
      case "success":
        return t("cloudSync.syncSuccess") || "同步成功";
      case "error":
        return (
          syncState.errorMessage || t("cloudSync.syncFailed") || "同步失败"
        );
      default:
        return metadata.exists
          ? t("cloudSync.synced") || "已同步"
          : t("cloudSync.notSynced") || "未同步";
    }
  };

  // 获取状态图标
  const getStatusIcon = () => {
    switch (syncState.status) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "uploading":
      case "downloading":
        return "sync";
      default:
        return metadata.exists ? "cloud-done" : "cloud-outline";
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* --- 头部导航 --- */}
        <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-800">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? "#fff" : "#1f2937"}
            />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-slate-800 dark:text-white -ml-6">
            {t("cloudSync.title") || "云端同步"}
          </Text>
          <View className="w-8" />
        </View>

        {/* --- 同步状态卡片 --- */}
        <View className="mx-4 mt-4 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
          <View className="flex-row items-center">
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: `${getStatusColor()}20` }}
            >
              {syncState.status === "uploading" ||
              syncState.status === "downloading" ? (
                <ActivityIndicator size="small" color={getStatusColor()} />
              ) : (
                <Ionicons
                  name={getStatusIcon()}
                  size={28}
                  color={getStatusColor()}
                />
              )}
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold text-slate-800 dark:text-white">
                iCloud
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {getStatusText()}
              </Text>
            </View>
            {syncState.status === "uploading" ||
            syncState.status === "downloading" ? (
              <Text className="text-sm font-medium text-blue-500">
                {syncState.progress}%
              </Text>
            ) : null}
          </View>

          {/* 进度条 */}
          {(syncState.status === "uploading" ||
            syncState.status === "downloading") && (
            <View className="mt-4 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${syncState.progress}%` }}
              />
            </View>
          )}

          {/* 同步时间信息 */}
          <View className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {t("cloudSync.lastSync") || "上次同步"}
              </Text>
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {formattedSyncTime}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {t("cloudSync.backupStatus") || "备份状态"}
              </Text>
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {metadata.exists
                  ? t("cloudSync.backupExists") || "已备份"
                  : t("cloudSync.noBackup") || "未备份"}
              </Text>
            </View>
          </View>
        </View>

        {/* --- 操作按钮 --- */}
        <View className="mx-4 mt-4 flex-row gap-3">
          <TouchableOpacity
            onPress={handleSync}
            disabled={
              syncState.status === "uploading" ||
              syncState.status === "downloading"
            }
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
              syncState.status === "uploading" ||
              syncState.status === "downloading"
                ? "bg-blue-300 dark:bg-blue-900/50"
                : "bg-blue-500"
            }`}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text className="ml-2 text-white font-semibold">
              {t("cloudSync.upload") || "立即备份"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleRestore}
            disabled={
              !metadata.exists ||
              syncState.status === "uploading" ||
              syncState.status === "downloading"
            }
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
              !metadata.exists ||
              syncState.status === "uploading" ||
              syncState.status === "downloading"
                ? "bg-slate-300 dark:bg-slate-700"
                : "bg-slate-600 dark:bg-slate-500"
            }`}
          >
            <Ionicons name="cloud-download-outline" size={20} color="#fff" />
            <Text className="ml-2 text-white font-semibold">
              {t("cloudSync.restore") || "恢复数据"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- 从文件导入 --- */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            onPress={handleImportFromFile}
            disabled={
              syncState.status === "uploading" ||
              syncState.status === "downloading"
            }
            className={`flex-row items-center justify-center py-3 rounded-xl ${
              syncState.status === "uploading" ||
              syncState.status === "downloading"
                ? "bg-emerald-300 dark:bg-emerald-900/50"
                : "bg-emerald-500"
            }`}
          >
            <Ionicons name="document-text-outline" size={20} color="#fff" />
            <Text className="ml-2 text-white font-semibold">
              {t("cloudSync.importFromFile") || "从文件导入"}
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-xs text-slate-400 mt-2">
            {t("cloudSync.importSupportedFormats") || "支持 JSON、GPX 格式"}
          </Text>
        </View>

        {/* --- 自动同步设置 --- */}
        <View className="px-5 mt-6 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("cloudSync.syncSettings") || "同步设置"}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            {/* 自动同步 */}
            <SwitchItem
              icon="sync-outline"
              title={t("cloudSync.autoSync") || "自动同步"}
              subtitle={t("cloudSync.autoSyncDesc") || "跑步结束后自动备份"}
              value={settings.autoSync}
              onValueChange={toggleAutoSync}
              colorScheme="success"
            />

            <Divider />

            {/* 仅 WiFi 同步 */}
            <SwitchItem
              icon="wifi"
              title={t("cloudSync.wifiOnly") || "仅 WiFi 同步"}
              subtitle={t("cloudSync.wifiOnlyDesc") || "节省移动数据流量"}
              value={settings.wifiOnly}
              onValueChange={toggleWifiOnly}
              colorScheme="primary"
            />
          </View>
        </View>

        {/* --- 存储信息 --- */}
        <View className="px-5 mt-4 mb-2">
          <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
            {t("cloudSync.storageInfo") || "存储信息"}
          </Text>
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  {t("cloudSync.databaseSize") || "数据库大小"}
                </Text>
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {formatFileSize(metadata.dbSize)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  {t("cloudSync.backupSize") || "备份大小"}
                </Text>
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {formatFileSize(metadata.size)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-slate-500 dark:text-slate-400">
                  {t("cloudSync.cloudProvider") || "云服务"}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons
                    name="logo-apple"
                    size={14}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                    iCloud
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* --- 说明文字 --- */}
        <View className="mx-4 mt-4 mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <View className="flex-row">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="ml-2 flex-1">
              <Text className="text-sm text-blue-800 dark:text-blue-200 leading-5">
                {t("cloudSync.tips") ||
                  "备份文件存储在 iCloud 中，可在更换设备时恢复数据。iCloud 备份通常在设备充电且连接 WiFi 时自动进行。"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
