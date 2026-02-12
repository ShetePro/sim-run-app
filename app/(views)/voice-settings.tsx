import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
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
import * as Speech from "expo-speech";
import {
  VOICE_CHARACTERS,
  VoiceCharacter,
  getCharacterById,
  getVoiceIdForLanguage,
  getLanguageCode,
  getCharacterName,
  getCharacterDescription,
  setAvailableVoices,
} from "@/constants/voiceCharacters";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 两列布局

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
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const settings = useVoiceSettingsStore();
  const [testSpeaking, setTestSpeaking] = useState(false);
  const [availableVoiceIds, setAvailableVoiceIds] = useState<Set<string>>(new Set());

  // 同步应用语言到语音设置
  useEffect(() => {
    // 当应用语言变化时，更新语音语言设置
    const appLanguage = i18n.language;
    if (settings.language !== appLanguage) {
      console.log("[VoiceSettings] Syncing language:", appLanguage);
      updateSetting("language", appLanguage);
    }
  }, [i18n.language]);

  // 加载可用语音列表
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const voiceIds = new Set(voices.map((v: any) => v.identifier.toLowerCase()));
        setAvailableVoiceIds(voiceIds);
        setAvailableVoices(voices as any);
        console.log("[VoiceSettings] Loaded voices:", voices.length);
      } catch (error) {
        console.error("[VoiceSettings] Error loading voices:", error);
      }
    };
    loadVoices();
  }, []);

  // 更新设置
  const updateSetting = useCallback(
    <K extends keyof typeof settings>(
      key: K,
      value: (typeof settings)[K]
    ) => {
      console.log("[VoiceSettings] Updating " + String(key) + ":", value);
      settings.updateSettings({ [key]: value });
    },
    [settings]
  );

  // 选择角色
  const selectCharacter = useCallback(
    (character: VoiceCharacter) => {
      console.log("[VoiceSettings] Selected character:", character.id);
      updateSetting("characterId", character.id);

      // 播放预览
      previewCharacter(character);
    },
    [updateSetting, previewCharacter]
  );

  // 判断是否为中文
  const isChinese = (lang: string) => lang === "cn" || lang.startsWith("zh");

  // 预览角色语音
  const previewCharacter = useCallback(
    async (character: VoiceCharacter) => {
      await Speech.stop();

      // 使用设置中保存的语言
      const lang = settings.language;
      const previewText = isChinese(lang)
        ? "你好，我是" + character.nameZh
        : "Hi, I'm " + character.nameEn;

      const voiceId = getVoiceIdForLanguage(character, lang);
      const langCode = getLanguageCode(character, lang);

      console.log(
        "[VoiceSettings] Previewing:",
        character.name,
        "with voice:",
        voiceId,
        "lang:",
        langCode
      );

      const options: Speech.SpeechOptions = {
        language: langCode,
        useApplicationAudioSession: false,
      };

      if (voiceId) {
        (options as any).voice = voiceId;
      }

      try {
        Speech.speak(previewText, options);
      } catch (error) {
        console.error("[VoiceSettings] Preview error:", error);
        // 失败时使用默认语音重试
        Speech.speak(previewText, {
          language: lang,
          useApplicationAudioSession: false,
        });
      }
    },
    [settings.language]
  );

  // 测试语音
  const handleTestVoice = useCallback(async () => {
    if (testSpeaking) return;

    const character = getCharacterById(settings.characterId);
    console.log("[VoiceSettings] Test voice with character:", character?.name);

    setTestSpeaking(true);

    // 使用设置中保存的语言
    const lang = settings.language;

    try {
      await Speech.stop();

      const testText = isChinese(lang)
        ? t("voiceSettings.testVoiceContent")
        : "Voice test successful";

      const voiceId = character
        ? getVoiceIdForLanguage(character, lang)
        : undefined;
      const langCode = character
        ? getLanguageCode(character, lang)
        : lang;

      console.log("[VoiceSettings] Testing with voice:", voiceId, "lang:", langCode);

      const options: Speech.SpeechOptions = {
        language: langCode,
        useApplicationAudioSession: false,
        onDone: () => setTestSpeaking(false),
        onError: (error) => {
          console.error("[VoiceSettings] Test error:", error);
          setTestSpeaking(false);
          // 出错时使用默认设置重试
          Speech.speak(testText, {
            language: lang,
            useApplicationAudioSession: false,
          });
        },
      };

      if (voiceId) {
        (options as any).voice = voiceId;
      }

      Speech.speak(testText, options);
    } catch (error) {
      console.error("[VoiceSettings] Exception:", error);
      setTestSpeaking(false);
      // 出错时使用默认设置重试
      try {
        const testText = isChinese(lang)
          ? t("voiceSettings.testVoiceContent")
          : "Voice test successful";
        Speech.speak(testText, {
          language: lang,
          useApplicationAudioSession: false,
        });
      } catch (e) {
        // 忽略
      }
    }
  }, [settings.characterId, settings.language, testSpeaking, t]);

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

  // 渲染角色卡片
  const renderCharacterCard = (character: VoiceCharacter) => {
    const isSelected = settings.characterId === character.id;
    // 使用设置中保存的语言显示名称和描述
    const lang = settings.language;
    const name = getCharacterName(character, lang);
    const description = getCharacterDescription(character, lang);

    return (
      <TouchableOpacity
        key={character.id}
        onPress={() => selectCharacter(character)}
        style={{ width: CARD_WIDTH }}
        className={`rounded-2xl p-4 mb-3 ${
          isSelected
            ? "border-2 border-indigo-500 dark:border-indigo-400"
            : "border border-slate-200 dark:border-slate-700"
        }`}
        activeOpacity={0.8}
      >
        {/* 头像背景 */}
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-3 self-center"
          style={{ backgroundColor: character.color + "20" }}
        >
          <Text className="text-4xl">{character.emoji}</Text>
        </View>

        {/* 名字 */}
        <Text
          className={`text-center font-bold text-base mb-1 ${
            isSelected
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-800 dark:text-slate-200"
          }`}
        >
          {name}
        </Text>

        {/* 描述 */}
        <Text
          className="text-center text-xs text-slate-500 dark:text-slate-400"
          numberOfLines={2}
        >
          {description}
        </Text>

        {/* 选中标记 */}
        {isSelected && (
          <View className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-500 items-center justify-center">
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 当前选中的角色
  const currentCharacter = getCharacterById(settings.characterId);

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
            {/* --- 当前语音角色展示 --- */}
            {currentCharacter && (
              <View className="px-5 mt-4 mb-2">
                <View
                  className="rounded-2xl p-6 flex-row items-center"
                  style={{ backgroundColor: currentCharacter.color + "15" }}
                >
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: currentCharacter.color + "30" }}
                  >
                    <Text className="text-5xl">{currentCharacter.emoji}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                      {t("voiceSettings.currentVoice")}
                    </Text>
                    <Text className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                      {getCharacterName(currentCharacter, settings.language)}
                    </Text>
                    <Text className="text-sm text-slate-600 dark:text-slate-300">
                      {getCharacterDescription(currentCharacter, settings.language)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* --- 选择语音角色 --- */}
            <View className="px-5 mt-4 mb-2">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-3 ml-2">
                {t("voiceSettings.selectVoice")}
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {VOICE_CHARACTERS.map(renderCharacterCard)}
              </View>
            </View>

            {/* --- 播报频率 --- */}
            <View className="px-5 mt-4 mb-2">
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2">
                {t("voiceSettings.frequency")}
              </Text>
              <View className="bg-white dark:bg-slate-800 rounded-xl p-4">
                {renderFrequencySelector()}
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
          </>
        )}

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
          <Text className="text-center text-slate-400 text-xs mt-3 px-4">
            {t("voiceSettings.testVoiceHint")}
          </Text>
        </View>

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
