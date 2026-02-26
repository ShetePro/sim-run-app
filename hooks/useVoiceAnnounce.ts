import { useCallback, useRef, useEffect } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";
import {
  useVoiceSettingsStore,
  AnnounceFrequency,
} from "@/store/voiceSettingsStore";
import { useTranslation } from "react-i18next";
import { secondFormatHours } from "@/utils/util";
import {
  getCharacterById,
  getVoiceIdForLanguage,
  getLanguageCode,
} from "@/constants/voiceCharacters";

interface AnnounceData {
  distance: number; // 米
  duration: number; // 秒
  pace: number; // 秒/公里
  calories: number;
}

export function useVoiceAnnounce() {
  const { t, i18n } = useTranslation();
  const settings = useVoiceSettingsStore();

  // 记录上一次播报的状态
  const lastDistanceRef = useRef(0);
  const lastTimeRef = useRef(0);
  const isSpeakingRef = useRef(false);

  // 清理
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // 获取当前语音配置 - 使用 settings 中保存的语言
  const getCurrentVoiceConfig = useCallback(() => {
    const character = getCharacterById(settings.characterId);
    // 使用 settings 中保存的语言
    const language = settings.language;

    if (!character) {
      return { voiceId: undefined, langCode: language };
    }

    const voiceId = getVoiceIdForLanguage(character, language);
    const langCode = getLanguageCode(character, language);

    return { voiceId, langCode };
  }, [settings.characterId, settings.language]);

  // 基础播报函数
  const speak = useCallback(
    async (text: string, priority: "high" | "normal" = "normal") => {
      if (!settings.enabled) return;

      // 空文本检查
      if (!text || text.trim().length === 0) {
        console.log("[VoiceAnnounce] Empty text, skipping speech");
        return;
      }

      // 高优先级播报会打断当前播报
      if (isSpeakingRef.current && priority === "normal") {
        return;
      }

      if (isSpeakingRef.current) {
        await Speech.stop();
      }

      isSpeakingRef.current = true;

      const { voiceId, langCode } = getCurrentVoiceConfig();

      const options: Speech.SpeechOptions = {
        useApplicationAudioSession: false,
        onDone: () => {
          console.log("[VoiceAnnounce] Speech completed");
          isSpeakingRef.current = false;
        },
        onError: (error) => {
          console.error("[VoiceAnnounce] Speech error:", error);
          isSpeakingRef.current = false;

          // 如果语音ID错误，尝试使用language重试
          if (voiceId) {
            console.log("[VoiceAnnounce] Retrying with language only...");
            Speech.speak(text, {
              language: langCode,
              useApplicationAudioSession: false,
              onDone: () => {
                isSpeakingRef.current = false;
              },
              onError: () => {
                isSpeakingRef.current = false;
              },
            });
          }
        },
        onStopped: () => {
          console.log("[VoiceAnnounce] Speech stopped");
          isSpeakingRef.current = false;
        },
      };

      // iOS: 优先使用 voice 参数（让语音角色决定语言）
      // Android: 使用 language 参数
      if (Platform.OS === "ios" && voiceId) {
        (options as any).voice = voiceId;
        console.log("[VoiceAnnounce] Using voice:", voiceId);
      } else {
        options.language = langCode;
        console.log("[VoiceAnnounce] Using language:", langCode);
      }

      console.log(
        '[VoiceAnnounce] Speaking: "' +
          text +
          '" with ' +
          (Platform.OS === "ios" && voiceId
            ? "voice: " + voiceId
            : "lang: " + langCode),
      );

      try {
        Speech.speak(text, options);
      } catch (error) {
        console.error("[VoiceAnnounce] Exception during speak:", error);
        isSpeakingRef.current = false;
      }
    },
    [settings.enabled, settings.characterId, getCurrentVoiceConfig],
  );

  // 格式化数字（保留一位小数）
  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  // 倒计时播报
  const announceCountdown = useCallback(
    (count: number) => {
      if (!settings.enabled) return;

      let text = "";
      switch (count) {
        case 3:
          text = t("voice.countdownThree");
          break;
        case 2:
          text = t("voice.countdownTwo");
          break;
        case 1:
          text = t("voice.countdownOne");
          break;
        case 0:
          text = t("voice.countdownGo");
          break;
        default:
          return;
      }

      speak(text, "high");
    },
    [settings.enabled, speak, t],
  );

  // 带完成回调的倒计时播报
  const announceCountdownWithCallback = useCallback(
    (count: number, onComplete?: () => void) => {
      if (!settings.enabled) {
        onComplete?.();
        return;
      }

      let text = "";
      switch (count) {
        case 3:
          text = t("voice.countdownThree");
          break;
        case 2:
          text = t("voice.countdownTwo");
          break;
        case 1:
          text = t("voice.countdownOne");
          break;
        case 0:
          text = t("voice.countdownGo");
          break;
        default:
          onComplete?.();
          return;
      }

      // 停止当前播报
      Speech.stop();

      const { voiceId, langCode } = getCurrentVoiceConfig();

      const options: Speech.SpeechOptions = {
        useApplicationAudioSession: false,
        onDone: () => {
          console.log("[VoiceAnnounce] Countdown speech completed:", count);
          onComplete?.();
        },
        onError: () => {
          console.error("[VoiceAnnounce] Countdown speech error:", count);
          onComplete?.();
        },
        onStopped: () => {
          onComplete?.();
        },
      };

      // iOS: 优先使用 voice 参数（让语音角色决定语言）
      // Android: 使用 language 参数
      if (Platform.OS === "ios" && voiceId) {
        (options as any).voice = voiceId;
      } else {
        options.language = langCode;
      }

      console.log('[VoiceAnnounce] Countdown speaking: "' + text + '"');

      try {
        Speech.speak(text, options);
      } catch (error) {
        console.error("[VoiceAnnounce] Exception during countdown:", error);
        onComplete?.();
      }
    },
    [settings.enabled, getCurrentVoiceConfig, t],
  );

  // 跑步开始播报
  const announceStart = useCallback(() => {
    if (!settings.announceStartFinish) return;
    const text = t("voice.startRunning");
    speak(text, "high");
  }, [settings.announceStartFinish, speak, t]);

  // 跑步结束播报
  const announceFinish = useCallback(
    (data: AnnounceData) => {
      if (!settings.announceStartFinish) return;

      const distanceKm = (data.distance / 1000).toFixed(2);
      const timeStr = secondFormatHours(data.duration);
      const paceStr = secondFormatHours(data.pace);

      let text = t("voice.finishRunning", {
        distance: distanceKm,
        time: timeStr,
      });

      if (settings.announcePace && data.pace > 0) {
        text += t("voice.finishPace", { pace: paceStr });
      }

      if (settings.announceCalories && data.calories > 0) {
        text += t("voice.finishCalories", { calories: data.calories });
      }

      speak(text, "high");
    },
    [
      settings.announceStartFinish,
      settings.announcePace,
      settings.announceCalories,
      speak,
      t,
    ],
  );

  // 暂停播报
  const announcePause = useCallback(() => {
    if (!settings.announcePauseResume) return;
    speak(t("voice.paused"), "high");
  }, [settings.announcePauseResume, speak, t]);

  // 恢复播报
  const announceResume = useCallback(() => {
    if (!settings.announcePauseResume) return;
    speak(t("voice.resumed"), "high");
  }, [settings.announcePauseResume, speak, t]);

  // 构建周期性播报文本
  const buildPeriodicAnnouncement = useCallback(
    (data: AnnounceData, isMilestone: boolean = false): string => {
      const parts: string[] = [];

      // 距离播报
      if (settings.announceDistance) {
        const distanceKm = data.distance / 1000;
        if (
          isMilestone &&
          Math.abs(distanceKm - Math.round(distanceKm)) < 0.01
        ) {
          parts.push(
            t("voice.milestoneDistance", { distance: Math.round(distanceKm) }),
          );
        } else {
          parts.push(
            t("voice.distance", { distance: formatNumber(distanceKm) }),
          );
        }
      }

      // 用时播报
      if (settings.announceTime) {
        parts.push(t("voice.time", { time: secondFormatHours(data.duration) }));
      }

      // 配速播报
      if (settings.announcePace && data.pace > 0) {
        parts.push(t("voice.pace", { pace: secondFormatHours(data.pace) }));
      }

      // 卡路里播报
      if (settings.announceCalories && data.calories > 0) {
        parts.push(t("voice.calories", { calories: data.calories }));
      }

      return parts.join("，");
    },
    [
      settings.announceDistance,
      settings.announceTime,
      settings.announcePace,
      settings.announceCalories,
      t,
    ],
  );

  // 周期性播报检查
  const checkAndAnnounce = useCallback(
    (data: AnnounceData) => {
      if (!settings.enabled || settings.frequency === "off") return;

      const currentDistance = data.distance;
      const currentTime = data.duration;
      const frequency = settings.frequency;

      let shouldAnnounce = false;
      let isMilestone = false;

      if (frequency === "1km") {
        const km = Math.floor(currentDistance / 1000);
        const lastKm = Math.floor(lastDistanceRef.current / 1000);
        if (km > lastKm && currentDistance >= 1000) {
          shouldAnnounce = true;
          isMilestone = true;
        }
      } else if (frequency === "2km") {
        const km = Math.floor(currentDistance / 1000);
        const lastKm = Math.floor(lastDistanceRef.current / 1000);
        if (km > lastKm && km % 2 === 0 && currentDistance >= 2000) {
          shouldAnnounce = true;
          isMilestone = true;
        }
      } else if (frequency === "5km") {
        const km = Math.floor(currentDistance / 1000);
        const lastKm = Math.floor(lastDistanceRef.current / 1000);
        if (km > lastKm && km % 5 === 0 && currentDistance >= 5000) {
          shouldAnnounce = true;
          isMilestone = true;
        }
      } else if (frequency === "10min") {
        const min = Math.floor(currentTime / 600);
        const lastMin = Math.floor(lastTimeRef.current / 600);
        if (min > lastMin && min % 1 === 0 && currentTime >= 600) {
          shouldAnnounce = true;
        }
      } else if (frequency === "30min") {
        const min = Math.floor(currentTime / 1800);
        const lastMin = Math.floor(lastTimeRef.current / 1800);
        if (min > lastMin && min % 1 === 0 && currentTime >= 1800) {
          shouldAnnounce = true;
        }
      }

      if (shouldAnnounce) {
        const text = buildPeriodicAnnouncement(data, isMilestone);
        speak(text);
        lastDistanceRef.current = currentDistance;
        lastTimeRef.current = currentTime;
      }
    },
    [settings.enabled, settings.frequency, buildPeriodicAnnouncement, speak],
  );

  // 手动触发播报（用于测试）
  const announceManual = useCallback(
    (data: AnnounceData) => {
      const parts: string[] = [];

      const distanceKm = data.distance / 1000;
      parts.push(t("voice.distance", { distance: formatNumber(distanceKm) }));
      parts.push(t("voice.time", { time: secondFormatHours(data.duration) }));

      if (data.pace > 0) {
        parts.push(t("voice.pace", { pace: secondFormatHours(data.pace) }));
      }

      if (data.calories > 0) {
        parts.push(t("voice.calories", { calories: data.calories }));
      }

      const text = parts.join("，");
      speak(text, "high");
      lastDistanceRef.current = data.distance;
      lastTimeRef.current = data.duration;
    },
    [speak, t],
  );

  // 重置播报状态
  const resetAnnounceState = useCallback(() => {
    lastDistanceRef.current = 0;
    lastTimeRef.current = 0;
    isSpeakingRef.current = false;
  }, []);

  // 停止播报
  const stopSpeaking = useCallback(async () => {
    await Speech.stop();
    isSpeakingRef.current = false;
  }, []);

  return {
    isSpeaking: () => isSpeakingRef.current,
    settings,
    speak,
    stopSpeaking,
    resetAnnounceState,
    announceCountdown,
    announceCountdownWithCallback,
    announceStart,
    announceFinish,
    announcePause,
    announceResume,
    checkAndAnnounce,
    announceManual,
  };
}
