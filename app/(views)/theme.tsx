import { Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettingsStore, ThemeMode } from "@/store/settingsStore";

interface ThemeOptionProps {
  code: ThemeMode;
  name: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

const ThemeOption = ({
  name,
  description,
  icon,
  isSelected,
  onPress,
}: ThemeOptionProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="flex-row items-center justify-between p-4 bg-white dark:bg-slate-800"
  >
    <View className="flex-row items-center flex-1">
      <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 items-center justify-center mr-3">
        <Ionicons name={icon as any} size={18} color="#6366F1" />
      </View>
      <View className="flex-1">
        <Text className="text-base text-slate-700 dark:text-slate-200 font-medium">
          {name}
        </Text>
        <Text className="text-xs text-slate-400 mt-0.5">{description}</Text>
      </View>
    </View>

    {isSelected && <Ionicons name="checkmark" size={24} color="#6366F1" />}
  </TouchableOpacity>
);

const THEME_NAMES: Record<ThemeMode, { cn: string; en: string }> = {
  system: { cn: "跟随系统", en: "System" },
  dark: { cn: "深色模式", en: "Dark" },
  light: { cn: "浅色模式", en: "Light" },
};

const THEME_DESCRIPTIONS: Record<ThemeMode, { cn: string; en: string }> = {
  system: { cn: "根据系统设置自动切换", en: "Follow system settings" },
  dark: { cn: "始终使用深色主题", en: "Always use dark theme" },
  light: { cn: "始终使用浅色主题", en: "Always use light theme" },
};

const THEME_ICONS: Record<ThemeMode, string> = {
  system: "phone-portrait-outline",
  dark: "moon",
  light: "sunny",
};

export default function ThemeView() {
  const { t, i18n } = useTranslation();
  const { settings, updateSetting } = useSettingsStore();
  const isCN = i18n.language === "cn";

  const themes: { code: ThemeMode }[] = [
    { code: "system" },
    { code: "dark" },
    { code: "light" },
  ];

  const handleThemeChange = (theme: ThemeMode) => {
    updateSetting("themeMode", theme);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900 px-4">
      <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2 ml-2 mt-4">
        {t("theme.title")}
      </Text>
      <View className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        {themes.map((theme, index) => (
          <View key={theme.code}>
            <ThemeOption
              code={theme.code}
              name={
                isCN ? THEME_NAMES[theme.code].cn : THEME_NAMES[theme.code].en
              }
              description={
                isCN
                  ? THEME_DESCRIPTIONS[theme.code].cn
                  : THEME_DESCRIPTIONS[theme.code].en
              }
              icon={THEME_ICONS[theme.code]}
              isSelected={settings.themeMode === theme.code}
              onPress={() => handleThemeChange(theme.code)}
            />
            {index < themes.length - 1 && (
              <View className="h-px bg-gray-100 dark:bg-slate-700 ml-16" />
            )}
          </View>
        ))}
      </View>

      <Text className="text-slate-400 text-xs mt-4 ml-2">
        {t("theme.description")}
      </Text>
    </SafeAreaView>
  );
}
