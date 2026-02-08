import { useCallback, useRef, useEffect } from "react";
import * as Speech from "expo-speech";
import { useVoiceSettingsStore, AnnounceFrequency } from "@/store/voiceSettingsStore";
import { useTranslation } from "react-i18next";
import { secondFormatHours } from "@/utils/util";

interface AnnounceData {
  distance: number; // 米
  duration: number; // 秒
  pace: number; // 秒/公里
  calories: number;
}

// 获取语音标识符（iOS）
const getVoiceIdentifier = (language: string): string | undefined => {
  // iOS 上可以选择特定语音
  if (language === "zh-CN") {
    // 中文普通话
    return "com.apple.voice.compact.zh-CN.Tingting";
  } else if (language === "en-US") {
    // 英文
    return "com.apple.voice.compact.en-US.Samantha";
  }
  return undefined;
};

export function useVoiceAnnounce() {
  const { t, i18n } = useTranslation();
  const settings = useVoiceSettingsStore();
  
  // 记录上一次播报的状态
  const lastDistanceRef = useRef(0); // 上次播报时的距离（米）
  const lastTimeRef = useRef(0); // 上次播报时的时间（秒）
  const isSpeakingRef = useRef(false);

  // 清理
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // 基础播报函数
  const speak = useCallback(
    async (text: string, priority: "high" | "normal" = "normal") => {
      if (!settings.enabled) return;
      
      // 高优先级播报会打断当前播报
      if (isSpeakingRef.current && priority === "normal") {
        return;
      }
      
      if (isSpeakingRef.current) {
        await Speech.stop();
      }

      isSpeakingRef.current = true;
      
      const options: Speech.SpeechOptions = {
        language: settings.language || i18n.language,
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
        onDone: () => {
          isSpeakingRef.current = false;
        },
        onError: () => {
          isSpeakingRef.current = false;
        },
      };

      // iOS 特定语音
      const voice = getVoiceIdentifier(settings.language || i18n.language);
      if (voice) {
        // @ts-ignore - voice 属性在类型定义中可能没有
        options.voice = voice;
      }

      Speech.speak(text, options);
    },
    [settings, i18n.language]
  );

  // 格式化数字（保留一位小数）
  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

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
      
      let text = t("voice.finishRunning", { distance: distanceKm, time: timeStr });
      
      if (settings.announcePace && data.pace > 0) {
        text += t("voice.finishPace", { pace: paceStr });
      }
      
      if (settings.announceCalories && data.calories > 0) {
        text += t("voice.finishCalories", { calories: data.calories });
      }
      
      speak(text, "high");
    },
    [settings.announceStartFinish, settings.announcePace, settings.announceCalories, speak, t]
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
        if (isMilestone && Math.abs(distanceKm - Math.round(distanceKm)) < 0.01) {
          // 整数公里里程碑
          parts.push(t("voice.milestoneDistance", { distance: Math.round(distanceKm) }));
        } else {
          parts.push(t("voice.distance", { distance: formatNumber(distanceKm) }));
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
    ]
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
        // 每公里播报
        const km = Math.floor(currentDistance / 1000);
        const lastKm = Math.floor(lastDistanceRef.current / 1000);
        if (km > lastKm && currentDistance >= 1000) {
          shouldAnnounce = true;
          isMilestone = true;
        }
      } else if (frequency === "2km") {
        // 每2公里播报
        const km = Math.floor(currentDistance / 1000);
        const lastKm = Math.floor(lastDistanceRef.current / 1000);
        if (km > lastKm && km % 2 === 0 && currentDistance >= 2000) {
          shouldAnnounce = true;
          isMilestone = true;
        }
      } else if (frequency === "5km") {
        // 每5公里播报
        const km = Math.floor(currentDistance / 1000);
        const lastKm = Math.floor(lastDistanceRef.current / 1000);
        if (km > lastKm && km % 5 === 0 && currentDistance >= 5000) {
          shouldAnnounce = true;
          isMilestone = true;
        }
      } else if (frequency === "10min") {
        // 每10分钟播报
        const min = Math.floor(currentTime / 600);
        const lastMin = Math.floor(lastTimeRef.current / 600);
        if (min > lastMin && min % 1 === 0 && currentTime >= 600) {
          shouldAnnounce = true;
        }
      } else if (frequency === "30min") {
        // 每30分钟播报
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
    [settings.enabled, settings.frequency, buildPeriodicAnnouncement, speak]
  );

  // 手动触发播报（用于测试）
  const announceManual = useCallback(
    (data: AnnounceData) => {
      const text = buildPeriodicAnnouncement(data, false);
      speak(text, "high");
      lastDistanceRef.current = data.distance;
      lastTimeRef.current = data.duration;
    },
    [buildPeriodicAnnouncement, speak]
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
    // 状态
    isSpeaking: () => isSpeakingRef.current,
    settings,
    
    // 控制方法
    speak,
    stopSpeaking,
    resetAnnounceState,
    
    // 场景播报
    announceStart,
    announceFinish,
    announcePause,
    announceResume,
    checkAndAnnounce,
    announceManual,
  };
}
