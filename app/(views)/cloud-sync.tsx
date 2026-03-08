import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { Divider } from "@/components/ui/Divider";
import { SwitchItem } from "@/components/ui/SwitchItem";
import { useCloudSyncStore } from "@/store/cloudSyncStore";
import { importRunFromFile, ImportResult } from "@/utils/importRun";
import { useRunDB } from "@/hooks/useSQLite";
import { RunRecord } from "@/types/runType";
import { RestoreResult } from "@/utils/backup";

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
    initialize,
    refreshBackupInfo,
    updateSettings,
    performSync,
    performRestore,
    resetState,
    checkNetworkStatus,
  } = useCloudSyncStore();

  const { addRun, updateRun } = useRunDB();

  // 恢复结果弹窗状态
  const [showRestoreResult, setShowRestoreResult] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(
    null,
  );

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
      metadata.exists
        ? `发现云端备份\n备份时间: ${new Date(metadata.modificationTime || 0).toLocaleString()}\n记录数: 请查看详情`
        : "暂无云端备份数据",
      [
        {
          text: t("common.cancel") || "取消",
          style: "cancel",
        },
        {
          text: "增量恢复（推荐）",
          onPress: async () => {
            resetState();
            const result = await performRestore("incremental");
            setRestoreResult(result);
            if (result.success) {
              setShowRestoreResult(true);
            }
          },
        },
        {
          text: "强制覆盖",
          style: "destructive",
          onPress: () => {
            // 二次确认
            Alert.alert(
              "确认强制覆盖",
              "这将删除本地所有数据，用云端备份完全替换。确定要继续吗？",
              [
                { text: "取消", style: "cancel" },
                {
                  text: "确认覆盖",
                  style: "destructive",
                  onPress: async () => {
                    resetState();
                    const result = await performRestore("force");
                    setRestoreResult(result);
                    if (result.success) {
                      setShowRestoreResult(true);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  // 渲染恢复结果弹窗
  const renderRestoreResultModal = () => {
    if (!restoreResult) return null;

    return (
      <Modal
        visible={showRestoreResult}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRestoreResult(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-slate-800 rounded-2xl p-6 m-4 max-h-[80%] w-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-slate-800 dark:text-white">
                恢复完成
              </Text>
              <TouchableOpacity onPress={() => setShowRestoreResult(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#94a3b8" : "#64748b"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-[400px]">
              <View className="mb-4">
                <Text className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  恢复模式:{" "}
                  {restoreResult.mode === "incremental"
                    ? "增量恢复"
                    : "强制覆盖"}
                </Text>
                <Text className="text-base text-slate-600 dark:text-slate-400">
                  新增记录: {restoreResult.restoredRuns.length} 条
                </Text>
                {restoreResult.skippedCount > 0 && (
                  <Text className="text-base text-slate-600 dark:text-slate-400">
                    跳过记录: {restoreResult.skippedCount} 条（本地已存在）
                  </Text>
                )}
              </View>

              {restoreResult.restoredRuns.length > 0 && (
                <View>
                  <Text className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    恢复的跑步记录:
                  </Text>
                  {restoreResult.restoredRuns.map((run, index) => (
                    <View
                      key={index}
                      className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-2"
                    >
                      <Text className="text-slate-800 dark:text-slate-200">
                        {run.date} · {run.distance} km ·{" "}
                        {Math.floor(run.duration / 60)} min
                      </Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {run.isNew ? "新恢复" : "强制覆盖"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              className="bg-indigo-500 rounded-xl py-3 mt-4"
              onPress={() => setShowRestoreResult(false)}
            >
              <Text className="text-white text-center font-semibold">确定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
                  t("cloudSync.saveToDbFailed"),
                );
              }
            } else if (result.message !== t("common.userCancelled")) {
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

        {/* --- 备份状态说明卡片 --- */}
        <View className="mx-4 mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6366f1"
              className="mt-0.5"
            />
            <View className="ml-2 flex-1">
              <Text className="text-indigo-800 dark:text-indigo-200 font-medium text-sm mb-1">
                {t("cloudSync.howItWorks") || "iCloud 备份机制"}
              </Text>
              <Text className="text-indigo-600 dark:text-indigo-300 text-xs leading-relaxed">
                {t("cloudSync.howItWorksDesc") ||
                  "数据已保存到本地，将在设备充电、连接WiFi且锁屏时自动上传到iCloud。这可能需要几小时到一天时间。"}
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
              {t("cloudSync.prepareBackup") || "准备备份"}
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
              {t("cloudSync.restoreFromICloud") || "从iCloud恢复"}
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

      {/* 恢复结果弹窗 */}
      {renderRestoreResultModal()}
    </SafeAreaView>
  );
}
