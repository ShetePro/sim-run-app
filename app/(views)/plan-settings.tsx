import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/settingsStore";
import { SwitchItem } from "@/components/ui/SwitchItem";

export default function PlanSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { settings, updateSetting, updateSettings } = useSettingsStore();
  const { plan } = settings;

  const handleReset = () => {
    Alert.alert(
      t("plan.resetTitle"),
      t("plan.resetMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("plan.reset"),
          style: "destructive",
          onPress: () => {
            updateSettings({
              plan: {
                enabled: false,
                dailyDistance: 5,
                weeklyDistance: 20,
                weeklyRuns: 3,
                monthlyDistance: 80,
                reminderEnabled: false,
                reminderTime: "07:00",
              },
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900" edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t("plan.title"),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Ionicons name="arrow-back" size={24} color="#6366f1" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 总开关 */}
        <View className="px-4 pt-4">
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <SwitchItem
              icon="flag-outline"
              iconColor="#6366F1"
              label={t("plan.enablePlan")}
              value={plan.enabled}
              onValueChange={(value) => updateSetting("plan.enabled", value)}
            />
          </View>
        </View>

        {/* 目标设置 */}
        {plan.enabled && (
          <>
            <View className="px-4 mt-6">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
                {t("plan.targets")}
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                {/* 每日目标 */}
                <View className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="sunny-outline" size={20} color="#F59E0B" />
                      <Text className="text-slate-800 dark:text-white ml-3 text-base">
                        {t("plan.dailyTarget")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TextInput
                        value={String(plan.dailyDistance)}
                        onChangeText={(text) => {
                          const value = parseFloat(text) || 0;
                          updateSetting("plan.dailyDistance", value);
                        }}
                        keyboardType="decimal-pad"
                        className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-center text-slate-800 dark:text-white min-w-[60px]"
                      />
                      <Text className="text-slate-500 dark:text-slate-400 ml-2">
                        km
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 每周目标 */}
                <View className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                      <Text className="text-slate-800 dark:text-white ml-3 text-base">
                        {t("plan.weeklyTarget")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TextInput
                        value={String(plan.weeklyDistance)}
                        onChangeText={(text) => {
                          const value = parseFloat(text) || 0;
                          updateSetting("plan.weeklyDistance", value);
                        }}
                        keyboardType="decimal-pad"
                        className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-center text-slate-800 dark:text-white min-w-[60px]"
                      />
                      <Text className="text-slate-500 dark:text-slate-400 ml-2">
                        km
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 每周次数 */}
                <View className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="repeat-outline" size={20} color="#10B981" />
                      <Text className="text-slate-800 dark:text-white ml-3 text-base">
                        {t("plan.weeklyRuns")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TextInput
                        value={String(plan.weeklyRuns)}
                        onChangeText={(text) => {
                          const value = parseInt(text) || 0;
                          updateSetting("plan.weeklyRuns", value);
                        }}
                        keyboardType="number-pad"
                        className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-center text-slate-800 dark:text-white min-w-[60px]"
                      />
                      <Text className="text-slate-500 dark:text-slate-400 ml-2">
                        {t("plan.times")}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 每月目标 */}
                <View className="px-4 py-4">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" />
                      <Text className="text-slate-800 dark:text-white ml-3 text-base">
                        {t("plan.monthlyTarget")}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TextInput
                        value={String(plan.monthlyDistance)}
                        onChangeText={(text) => {
                          const value = parseFloat(text) || 0;
                          updateSetting("plan.monthlyDistance", value);
                        }}
                        keyboardType="decimal-pad"
                        className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-center text-slate-800 dark:text-white min-w-[60px]"
                      />
                      <Text className="text-slate-500 dark:text-slate-400 ml-2">
                        km
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 提醒设置 */}
            <View className="px-4 mt-6">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
                {t("plan.reminder")}
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                <SwitchItem
                  icon="notifications-outline"
                  iconColor="#F59E0B"
                  label={t("plan.enableReminder")}
                  value={plan.reminderEnabled}
                  onValueChange={(value) => updateSetting("plan.reminderEnabled", value)}
                />
                {plan.reminderEnabled && (
                  <View className="px-4 py-3 border-t border-gray-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-600 dark:text-slate-300 ml-11">
                        {t("plan.reminderTime")}
                      </Text>
                      <TextInput
                        value={plan.reminderTime}
                        onChangeText={(text) => {
                          updateSetting("plan.reminderTime", text);
                        }}
                        placeholder="07:00"
                        className="bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-center text-slate-800 dark:text-white min-w-[80px]"
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* 重置按钮 */}
        <View className="px-4 mt-8 mb-10">
          <TouchableOpacity
            onPress={handleReset}
            className="py-3 items-center"
          >
            <Text className="text-red-500 font-medium">
              {t("plan.resetToDefault")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
