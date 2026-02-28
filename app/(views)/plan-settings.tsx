import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { useSettingsStore } from "@/store/settingsStore";
import { SwitchItem } from "@/components/ui/SwitchItem";

// 数字输入器组件
function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
  decimal = false,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  decimal?: boolean;
}) {
  const handleDecrease = () => {
    const newVal = Math.max(min, value - step);
    onChange(Number(newVal.toFixed(decimal ? 1 : 0)));
  };

  const handleIncrease = () => {
    const newVal = Math.min(max, value + step);
    onChange(Number(newVal.toFixed(decimal ? 1 : 0)));
  };

  const handleChange = (text: string) => {
    const num = decimal ? parseFloat(text) : parseInt(text);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    }
  };

  return (
    <View className="flex-row items-center bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden">
      <TouchableOpacity
        onPress={handleDecrease}
        className="w-10 h-10 items-center justify-center active:bg-gray-200 dark:active:bg-slate-600"
      >
        <Ionicons
          name="remove"
          size={20}
          className="text-slate-600 dark:text-slate-300"
          color="#64748B"
        />
      </TouchableOpacity>

      <TextInput
        value={String(value)}
        onChangeText={handleChange}
        keyboardType={decimal ? "decimal-pad" : "number-pad"}
        className="w-14 text-center text-slate-800 dark:text-white font-semibold"
      />

      <TouchableOpacity
        onPress={handleIncrease}
        className="w-10 h-10 items-center justify-center active:bg-gray-200 dark:active:bg-slate-600"
      >
        <Ionicons
          name="add"
          size={20}
          className="text-slate-600 dark:text-slate-300"
          color="#64748B"
        />
      </TouchableOpacity>

      {unit && (
        <Text className="text-slate-500 dark:text-slate-400 pr-3 text-sm">
          {unit}
        </Text>
      )}
    </View>
  );
}

// 目标推荐按钮
function GoalPreset({
  label,
  daily,
  weekly,
  runs,
  onSelect,
  isSelected,
}: {
  label: string;
  daily: number;
  weekly: number;
  runs: number;
  onSelect: () => void;
  isSelected: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`flex-1 mx-1 p-3 rounded-xl border-2 ${
        isSelected
          ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500"
          : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
      }`}
    >
      <Text
        className={`text-xs font-bold text-center mb-1 ${
          isSelected
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        {label}
      </Text>
      <Text className="text-lg font-bold text-center text-slate-800 dark:text-white">
        {daily}km
      </Text>
      <Text className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
        {weekly}km/周
      </Text>
    </TouchableOpacity>
  );
}

export default function PlanSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { settings, updateSetting, updateSettings } = useSettingsStore();
  const { plan } = settings;
  const [showCustom, setShowCustom] = useState(false);

  // 检查当前设置匹配哪个推荐
  const getPresetMatch = () => {
    if (plan.dailyDistance === 3 && plan.weeklyDistance === 15)
      return "beginner";
    if (plan.dailyDistance === 5 && plan.weeklyDistance === 20)
      return "regular";
    if (plan.dailyDistance === 10 && plan.weeklyDistance === 40)
      return "advanced";
    return "custom";
  };

  const currentPreset = getPresetMatch();

  const applyPreset = (preset: "beginner" | "regular" | "advanced") => {
    const presets = {
      beginner: { daily: 3, weekly: 15, runs: 3, monthly: 60 },
      regular: { daily: 5, weekly: 20, runs: 4, monthly: 80 },
      advanced: { daily: 10, weekly: 40, runs: 5, monthly: 160 },
    };
    const p = presets[preset];
    updateSettings({
      plan: {
        ...plan,
        dailyDistance: p.daily,
        weeklyDistance: p.weekly,
        weeklyRuns: p.runs,
        monthlyDistance: p.monthly,
      },
    });
  };

  const handleReset = () => {
    Alert.alert(t("plan.resetTitle"), t("plan.resetMessage"), [
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
    ]);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50 dark:bg-slate-900"
      edges={["top"]}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 自定义导航栏 */}
        <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-800">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? "#fff" : "#1f2937"}
            />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-slate-800 dark:text-white -ml-6">
            {t("plan.title")}
          </Text>
          <View className="w-8" />
        </View>

        {/* 引导卡片 - 始终显示 */}
        <View
          className={`mx-4 mt-2 p-4 rounded-2xl ${
            isDark
              ? "bg-gradient-to-r from-indigo-500 to-purple-600"
              : "bg-white border border-indigo-100"
          }`}
          style={
            !isDark
              ? {
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }
              : undefined
          }
        >
          <View className="flex-row items-center mb-2">
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                isDark ? "bg-white/20" : "bg-indigo-100"
              }`}
            >
              <Ionicons
                name="flag"
                size={20}
                color={isDark ? "white" : "#6366f1"}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text
                className={`font-bold text-base ${
                  isDark ? "text-white" : "text-indigo-600"
                }`}
              >
                {t("plan.welcomeTitle")}
              </Text>
              <Text
                className={`text-xs ${
                  isDark ? "text-indigo-100" : "text-indigo-500"
                }`}
              >
                {t("plan.welcomeSubtitle")}
              </Text>
            </View>
          </View>
          <Text
            className={`text-xs leading-4 ${
              isDark ? "text-white/80" : "text-slate-600"
            }`}
          >
            {t("plan.welcomeDesc")}
          </Text>
        </View>

        {/* 总开关 */}
        <View className="px-4 pt-3">
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <SwitchItem
              title={t("plan.enablePlan")}
              subtitle={t("plan.enablePlanDesc")}
              icon="flag-outline"
              colorScheme="purple"
              value={plan.enabled}
              onValueChange={(value) => updateSetting("plan.enabled", value)}
            />
          </View>
        </View>

        {/* 目标设置 */}
        {plan.enabled && (
          <>
            {/* 快捷推荐 */}
            <View className="px-4 mt-4">
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 ml-1">
                {t("plan.quickSelect")}
              </Text>
              <View className="flex-row">
                <GoalPreset
                  label={t("plan.beginner")}
                  daily={3}
                  weekly={15}
                  runs={3}
                  onSelect={() => applyPreset("beginner")}
                  isSelected={currentPreset === "beginner"}
                />
                <GoalPreset
                  label={t("plan.regular")}
                  daily={5}
                  weekly={20}
                  runs={4}
                  onSelect={() => applyPreset("regular")}
                  isSelected={currentPreset === "regular"}
                />
                <GoalPreset
                  label={t("plan.advanced")}
                  daily={10}
                  weekly={40}
                  runs={5}
                  onSelect={() => applyPreset("advanced")}
                  isSelected={currentPreset === "advanced"}
                />
              </View>
            </View>

            {/* 自定义目标 */}
            <View className="px-4 mt-4">
              <TouchableOpacity
                onPress={() => setShowCustom(!showCustom)}
                className="flex-row items-center justify-between mb-2"
              >
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium ml-1">
                  {t("plan.customTargets")}
                </Text>
                <Ionicons
                  name={showCustom ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>

              {showCustom && (
                <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                  {/* 每日目标 */}
                  <View className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full items-center justify-center">
                          <Ionicons
                            name="sunny-outline"
                            size={20}
                            color="#F59E0B"
                          />
                        </View>
                        <View className="ml-3">
                          <Text className="text-slate-800 dark:text-white text-base font-medium">
                            {t("plan.dailyTarget")}
                          </Text>
                          <Text className="text-slate-400 dark:text-slate-500 text-xs">
                            {t("plan.dailyTargetDesc")}
                          </Text>
                        </View>
                      </View>
                      <NumberStepper
                        value={plan.dailyDistance}
                        onChange={(val) =>
                          updateSetting("plan.dailyDistance", val)
                        }
                        step={0.5}
                        min={0.5}
                        max={50}
                        unit="km"
                        decimal
                      />
                    </View>
                  </View>

                  {/* 每周目标 */}
                  <View className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center">
                          <Ionicons
                            name="calendar-outline"
                            size={20}
                            color="#3B82F6"
                          />
                        </View>
                        <View className="ml-3">
                          <Text className="text-slate-800 dark:text-white text-base font-medium">
                            {t("plan.weeklyTarget")}
                          </Text>
                          <Text className="text-slate-400 dark:text-slate-500 text-xs">
                            {t("plan.weeklyTargetDesc")}
                          </Text>
                        </View>
                      </View>
                      <NumberStepper
                        value={plan.weeklyDistance}
                        onChange={(val) =>
                          updateSetting("plan.weeklyDistance", val)
                        }
                        step={5}
                        min={1}
                        max={200}
                        unit="km"
                      />
                    </View>
                  </View>

                  {/* 每周次数 */}
                  <View className="px-4 py-4 border-b border-gray-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center">
                          <Ionicons
                            name="repeat-outline"
                            size={20}
                            color="#10B981"
                          />
                        </View>
                        <View className="ml-3">
                          <Text className="text-slate-800 dark:text-white text-base font-medium">
                            {t("plan.weeklyRuns")}
                          </Text>
                          <Text className="text-slate-400 dark:text-slate-500 text-xs">
                            {t("plan.weeklyRunsDesc")}
                          </Text>
                        </View>
                      </View>
                      <NumberStepper
                        value={plan.weeklyRuns}
                        onChange={(val) =>
                          updateSetting("plan.weeklyRuns", val)
                        }
                        step={1}
                        min={1}
                        max={14}
                        unit={t("plan.times")}
                      />
                    </View>
                  </View>

                  {/* 每月目标 */}
                  <View className="px-4 py-4">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center">
                          <Ionicons
                            name="trending-up-outline"
                            size={20}
                            color="#8B5CF6"
                          />
                        </View>
                        <View className="ml-3">
                          <Text className="text-slate-800 dark:text-white text-base font-medium">
                            {t("plan.monthlyTarget")}
                          </Text>
                          <Text className="text-slate-400 dark:text-slate-500 text-xs">
                            {t("plan.monthlyTargetDesc")}
                          </Text>
                        </View>
                      </View>
                      <NumberStepper
                        value={plan.monthlyDistance}
                        onChange={(val) =>
                          updateSetting("plan.monthlyDistance", val)
                        }
                        step={10}
                        min={5}
                        max={500}
                        unit="km"
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* 提醒设置 - 暂时禁用
            <View className="px-4 mt-4">
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2 ml-1">
                {t("plan.reminder")}
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                <SwitchItem
                  title={t("plan.enableReminder")}
                  subtitle={t("plan.enableReminderDesc")}
                  icon="notifications-outline"
                  colorScheme="warning"
                  value={plan.reminderEnabled}
                  onValueChange={(value) =>
                    updateSetting("plan.reminderEnabled", value)
                  }
                />
                {plan.reminderEnabled && (
                  <View className="px-4 py-3 border-t border-gray-100 dark:border-slate-700">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-600 dark:text-slate-300 ml-11">
                        {t("plan.reminderTime")}
                      </Text>
                      <View className="flex-row items-center bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-2">
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#64748B"
                          className="mr-2"
                        />
                        <TextInput
                          value={plan.reminderTime}
                          onChangeText={(text) => {
                            // 简单的时间格式化
                            const clean = text.replace(/[^0-9:]/g, "");
                            updateSetting(
                              "plan.reminderTime",
                              clean.slice(0, 5),
                            );
                          }}
                          placeholder="07:00"
                          maxLength={5}
                          className="w-16 text-center text-slate-800 dark:text-white font-medium"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
            */}
          </>
        )}

        {/* 重置按钮 */}
        {plan.enabled && (
          <View className="px-4 mt-6 mb-8">
            <TouchableOpacity
              onPress={handleReset}
              className="py-2 items-center"
            >
              <Text className="text-red-500 font-medium">
                {t("plan.resetToDefault")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
