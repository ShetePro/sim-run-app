import { Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/settingsStore";
import { Divider } from "@/components/ui/Divider";
import { SwitchItem } from "@/components/ui/SwitchItem";

export default function NotificationsView() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettingsStore();
  const { notifications } = settings;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 px-4">
      {/* 主开关 */}
      <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2 mt-4">
        通知总开关
      </Text>
      <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        <SwitchItem
          icon="notifications"
          title="启用通知"
          subtitle="接收应用推送通知"
          value={notifications.enabled}
          onValueChange={(value) => updateSetting("notifications.enabled", value)}
          colorScheme="primary"
        />
      </View>

      {/* 具体通知类型 */}
      <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2 mt-6">
        通知类型
      </Text>
      <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        <SwitchItem
          icon="flag"
          title="跑步完成"
          subtitle="每次跑步结束后通知"
          value={notifications.runComplete}
          onValueChange={(value) => updateSetting("notifications.runComplete", value)}
          colorScheme="success"
        />
        <Divider />
        <SwitchItem
          icon="calendar"
          title="周报"
          subtitle="每周运动总结"
          value={notifications.weeklyReport}
          onValueChange={(value) => updateSetting("notifications.weeklyReport", value)}
          colorScheme="warning"
        />
        <Divider />
        <SwitchItem
          icon="alarm"
          title="运动提醒"
          subtitle="定时提醒运动"
          value={notifications.reminder}
          onValueChange={(value) => updateSetting("notifications.reminder", value)}
          colorScheme="danger"
        />
      </View>

      {/* 提示 */}
      <View className="mt-6 mx-2">
        <Text className="text-slate-400 text-xs leading-5">
          提示：需要在系统设置中允许本应用发送通知，以上设置才能生效。
        </Text>
      </View>
    </SafeAreaView>
  );
}
