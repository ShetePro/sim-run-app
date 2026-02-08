import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AnnounceFrequency = "off" | "1km" | "2km" | "5km" | "10min" | "30min";

export interface VoiceSettings {
  enabled: boolean;
  volume: number; // 0-1
  rate: number; // 语速 0.5-2.0
  pitch: number; // 音调 0.5-2.0
  language: string; // 语言
  frequency: AnnounceFrequency; // 播报频率
  announceDistance: boolean; // 播报距离
  announceTime: boolean; // 播报用时
  announcePace: boolean; // 播报配速
  announceCalories: boolean; // 播报卡路里
  announcePauseResume: boolean; // 播报暂停/恢复
  announceStartFinish: boolean; // 播报开始/结束
  voiceIdentifier?: string; // iOS 特定语音标识
}

const defaultSettings: VoiceSettings = {
  enabled: true,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
  language: "zh-CN",
  frequency: "1km",
  announceDistance: true,
  announceTime: true,
  announcePace: true,
  announceCalories: true,
  announcePauseResume: true,
  announceStartFinish: true,
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
