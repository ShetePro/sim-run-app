import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { SwitchItem } from "@/components/ui/SwitchItem";
import { Divider } from "@/components/ui/Divider";
import {
  useVoiceSettingsStore,
  AnnounceFrequency,
} from "@/store/voiceSettingsStore";
import { useVoiceAnnounce } from "@/hooks/useVoiceAnnounce";

const FREQUENCY_OPTIONS: { value: AnnounceFrequency; labelKey: string }[] = [
  { value: "off", labelKey: "voiceSettings.frequencyOptions.off" },
  { value: "1km", labelKey: "voiceSettings.frequencyOptions.1km" },
  { value: "2km", labelKey: "voiceSettings.frequencyOptions.2km" },
  { value: "5km", labelKey: "voiceSettings.frequencyOptions.5km" },
  { value: "10min", labelKey: "voiceSettings.frequencyOptions.10min" },
  { value: "30min", labelKey: "voiceSettings.frequencyOptions.30min" },
];

export default function VoiceSettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const settings = useVoiceSettingsStore();
  const { speak, announceManual } = useVoiceAnnounce();
  
  const [testSpeaking, setTestSpeaking] = useState(false);

  // 更新设置
  const updateSetting = useCallback(
    <K extends keyof typeof settings>(
      key: K,
      value: (typeof settings)[K]
    ) => {
      settings.updateSettings({ [key]: value });
    },
    [settings]
  );

  // 频率选择器
  const renderFrequencySelector = () => (
    <View className="flex-row flex-wrap gap-2 mt-2">
      {FREQUENCY_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => updateSetting("frequency", option.value)}
          className={`flex-row items-center justify-center py-2.5 px-3 rounded-xl border ${
            settings.frequency === option.value
              ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400"
              : "bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              settings.frequency === option.value
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {t(option.labelKey)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // 滑块组件
  const renderSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (val: number) => void,
    formatValue: (val: number) => string
  ) => (
    <View className="py-2">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-slate-600 dark:text-slate-300 text-sm">
          {label}
        </Text>
        <Text className="text-indigo-600 dark:text-indigo-400 font-medium">
          {formatValue(value)}
        </Text>
      </View>
      <View className="flex-row items-center">
        <Text className="text-xs text-slate-400 w-8">{formatValue(min)}</Text>
        <Slider
          style={{ flex: 1, height: 40 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor="#6366F1"
          maximumTrackTintColor={isDark ? "#475569" : "#E5E7EB"}
          thumbTintColor="#6366F1"
        />
        <Text className="text-xs text-slate-400 w-8 text-right">
          {formatValue(max)}
        </Text>
      </View>
    </View>
  );

  // 测试语音
  const handleTestVoice = useCallback(() => {
    if (testSpeaking) return;
    
    setTestSpeaking(true);
    announceManual({
      distance: 5250, // 5.25公里
      duration: 1800, // 30分钟
      pace: 342, // 5分42秒/公里
      calories: 320,
    });
    
    setTimeout(() => {
      setTestSpeaking(false);
    }, 5000);
  }, [announceManual, testSpeaking]);

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
            {t("voiceSettings.title")}
          </Text>
          <View className="w-8" />
        </View>

        {/* --- 总开关 --- */}
        <View className="px-5 mt-4 mb-2">
          <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
            <SwitchItem
              icon="volume-high"
              title={t("voiceSettings.enableVoice")}
              subtitle={t("voiceSettings.enableVoiceDesc")}
              value={settings.enabled}
              onValueChange={(value) => updateSetting("enabled", value)}
              colorScheme="primary"
            />
          </View>
        </View>

        {settings.enabled && (
          <>
            {/* --- 播报频率 --- */}
            <View className="px-5 mt-4 mb-2">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
                {t("voiceSettings.frequency")}
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl p-4">
                {renderFrequencySelector()}
              </View>
            </View>

            {/* --- 语音参数 --- */}
            <View className="px-5 mt-4 mb-2">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
                {t("voiceSettings.voiceParams")}
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl p-4">
                {renderSlider(
                  t("voiceSettings.volume"),
                  settings.volume,
                  0,
                  1,
                  0.1,
                  (val) => updateSetting("volume", val),
                  (val) => `${Math.round(val * 100)}%`
                )}
                <Divider />
                {renderSlider(
                  t("voiceSettings.rate"),
                  settings.rate,
                  0.5,
                  2,
                  0.1,
                  (val) => updateSetting("rate", val),
                  (val) => `${val.toFixed(1)}x`
                )}
                <Divider />
                {renderSlider(
                  t("voiceSettings.pitch"),
                  settings.pitch,
                  0.5,
                  2,
                  0.1,
                  (val) => updateSetting("pitch", val),
                  (val) => `${val.toFixed(1)}`
                )}
              </View>
            </View>

            {/* --- 播报内容 --- */}
            <View className="px-5 mt-4 mb-2">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
                {t("voiceSettings.announceContent")}
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
                <SwitchItem
                  icon="flag"
                  title={t("voiceSettings.announceStartFinish")}
                  subtitle={t("voiceSettings.announceStartFinishDesc")}
                  value={settings.announceStartFinish}
                  onValueChange={(value) =>
                    updateSetting("announceStartFinish", value)
                  }
                  colorScheme="success"
                />
                <Divider />
                <SwitchItem
                  icon="pause-circle"
                  title={t("voiceSettings.announcePauseResume")}
                  subtitle={t("voiceSettings.announcePauseResumeDesc")}
                  value={settings.announcePauseResume}
                  onValueChange={(value) =>
                    updateSetting("announcePauseResume", value)
                  }
                  colorScheme="warning"
                />
                <Divider />
                <SwitchItem
                  icon="navigate"
                  title={t("voiceSettings.announceDistance")}
                  subtitle={t("voiceSettings.announceDistanceDesc")}
                  value={settings.announceDistance}
                  onValueChange={(value) =>
                    updateSetting("announceDistance", value)
                  }
                  colorScheme="primary"
                />
                <Divider />
                <SwitchItem
                  icon="time"
                  title={t("voiceSettings.announceTime")}
                  subtitle={t("voiceSettings.announceTimeDesc")}
                  value={settings.announceTime}
                  onValueChange={(value) =>
                    updateSetting("announceTime", value)
                  }
                  colorScheme="primary"
                />
                <Divider />
                <SwitchItem
                  icon="speedometer"
                  title={t("voiceSettings.announcePace")}
                  subtitle={t("voiceSettings.announcePaceDesc")}
                  value={settings.announcePace}
                  onValueChange={(value) =>
                    updateSetting("announcePace", value)
                  }
                  colorScheme="purple"
                />
                <Divider />
                <SwitchItem
                  icon="flame"
                  title={t("voiceSettings.announceCalories")}
                  subtitle={t("voiceSettings.announceCaloriesDesc")}
                  value={settings.announceCalories}
                  onValueChange={(value) =>
                    updateSetting("announceCalories", value)
                  }
                  colorScheme="danger"
                />
              </View>
            </View>

            {/* --- 测试语音 --- */}
            <View className="px-5 mt-4 mb-2">
              <TouchableOpacity
                onPress={handleTestVoice}
                disabled={testSpeaking}
                className={`flex-row items-center justify-center py-4 rounded-xl ${
                  testSpeaking
                    ? "bg-indigo-300 dark:bg-indigo-800"
                    : "bg-indigo-500"
                }`}
              >
                <Ionicons
                  name={testSpeaking ? "volume-high" : "play"}
                  size={20}
                  color="#fff"
                />
                <Text className="ml-2 text-white font-semibold">
                  {testSpeaking
                    ? t("voiceSettings.testing")
                    : t("voiceSettings.testVoice")}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* --- 重置按钮 --- */}
        <View className="px-5 mt-6 mb-8">
          <TouchableOpacity
            onPress={() => {
              settings.resetSettings();
            }}
            className="flex-row items-center justify-center py-3 bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            <Ionicons name="refresh" size={18} color="#6B7280" />
            <Text className="ml-2 text-slate-600 dark:text-slate-400 font-medium">
              {t("voiceSettings.reset")}
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-slate-400 text-xs mt-6 px-4">
            {t("voiceSettings.tips")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
