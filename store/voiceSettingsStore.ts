import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AnnounceFrequency = "off" | "1km" | "2km" | "5km" | "10min" | "30min";

export interface VoiceSettings {
  enabled: boolean;
  language: string; // 语言
  frequency: AnnounceFrequency; // 播报频率
  announceDistance: boolean; // 播报距离
  announceTime: boolean; // 播报用时
  announcePace: boolean; // 播报配速
  announceCalories: boolean; // 播报卡路里
  announcePauseResume: boolean; // 播报暂停/恢复
  announceStartFinish: boolean; // 播报开始/结束
  characterId: string; // 选中的语音角色ID
}

const defaultSettings: VoiceSettings = {
  enabled: true,
  language: "zh-CN",
  frequency: "1km",
  announceDistance: true,
  announceTime: true,
  announcePace: true,
  announceCalories: true,
  announcePauseResume: true,
  announceStartFinish: true,
  characterId: "xiaomei", // 默认使用小美
};

interface VoiceSettingsState extends VoiceSettings {
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  resetSettings: () => void;
}

export const useVoiceSettingsStore = create<VoiceSettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "voice-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
