import { Text, View, Switch, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/settingsStore";
import { Divider } from "@/components/ui/Divider";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingItem = ({ icon, iconColor, title, subtitle, value, onValueChange }: SettingItemProps) => (
  <View className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800">
    <View className="flex-row items-center flex-1">
      <View 
        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#767577", true: "#818cf8" }}
      thumbColor={value ? "#fff" : "#f4f3f4"}
    />
  </View>
);

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
        <SettingItem
          icon="notifications"
          iconColor="#3B82F6"
          title="启用通知"
          subtitle="接收应用推送通知"
          value={notifications.enabled}
          onValueChange={(value) => updateSetting("notifications.enabled", value)}
        />
      </View>

      {/* 具体通知类型 */}
      <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2 mt-6">
        通知类型
      </Text>
      <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        <SettingItem
          icon="flag"
          iconColor="#10B981"
          title="跑步完成"
          subtitle="每次跑步结束后通知"
          value={notifications.runComplete}
          onValueChange={(value) => updateSetting("notifications.runComplete", value)}
        />
        <Divider />
        <SettingItem
          icon="calendar"
          iconColor="#F59E0B"
          title="周报"
          subtitle="每周运动总结"
          value={notifications.weeklyReport}
          onValueChange={(value) => updateSetting("notifications.weeklyReport", value)}
        />
        <Divider />
        <SettingItem
          icon="alarm"
          iconColor="#EF4444"
          title="运动提醒"
          subtitle="定时提醒运动"
          value={notifications.reminder}
          onValueChange={(value) => updateSetting("notifications.reminder", value)}
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
