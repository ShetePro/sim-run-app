import { Platform, Linking } from "react-native";

export interface VoiceCharacter {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  emoji: string;
  color: string;
  descriptionEn: string;
  descriptionZh: string;
  // iOS 语音标识符映射 - 使用免费内置语音
  iosVoiceIds: {
    zh: string;  // 中文语音ID
    en: string;  // 英文语音ID
  };
  // Android 语言代码
  androidLang: {
    zh: string;
    en: string;
  };
}

// 使用 iOS 免费内置语音的角色
// 注意：iOS 中文免费语音有限，使用不同语种但风格各异的语音来增加变化
export const VOICE_CHARACTERS: VoiceCharacter[] = [
  {
    id: "xiaomei",
    name: "小美",
    nameEn: "Mei",
    nameZh: "小美",
    emoji: "🌸",
    color: "#FF6B9D",
    descriptionEn: "Gentle and sweet female voice",
    descriptionZh: "温柔甜美的女声",
    iosVoiceIds: {
      zh: "com.apple.speech.synthesis.voice.tingting", // 婷婷 - 普通话女声
      en: "com.apple.speech.synthesis.voice.samantha", // Samantha - 英文女声
    },
    androidLang: {
      zh: "zh-CN",
      en: "en-US",
    },
  },
  {
    id: "xiaogang",
    name: "小刚",
    nameEn: "Gang",
    nameZh: "小刚",
    emoji: "💪",
    color: "#4A90E2",
    descriptionEn: "Energetic male voice",
    descriptionZh: "活力充沛的男声",
    iosVoiceIds: {
      // iOS 免费中文语音有限，使用粤语 Sinji 作为替代（偏低沉）
      zh: "com.apple.speech.synthesis.voice.sinji", // Sinji - 粤语
      en: "com.apple.speech.synthesis.voice.fred", // Fred - 英文男声
    },
    androidLang: {
      zh: "zh-HK",
      en: "en-US",
    },
  },
  {
    id: "xiaoyu",
    name: "小雨",
    nameEn: "Yu",
    nameZh: "小雨",
    emoji: "🌧️",
    color: "#5AC8FA",
    descriptionEn: "Fresh and lively female voice",
    descriptionZh: "清新活泼的女声",
    iosVoiceIds: {
      zh: "com.apple.speech.synthesis.voice.meijia", // 美佳 - 台湾女声
      en: "com.apple.speech.synthesis.voice.karen", // Karen - 澳洲女声
    },
    androidLang: {
      zh: "zh-TW",
      en: "en-AU",
    },
  },
  {
    id: "robot",
    name: "R2-D2",
    nameEn: "R2-D2",
    nameZh: "R2-D2",
    emoji: "🤖",
    color: "#34C759",
    descriptionEn: "Robotic synthesized voice",
    descriptionZh: "机器人合成音",
    iosVoiceIds: {
      // 使用英文语音读中文，创造机器人效果
      zh: "com.apple.speech.synthesis.voice.alex", // Alex 读中文
      en: "com.apple.speech.synthesis.voice.alex", // Alex - 经典合成音
    },
    androidLang: {
      zh: "zh-CN",
      en: "en-US",
    },
  },
];

// 判断是否为中文（支持 "cn" 和 "zh" 开头）
function isChinese(language: string): boolean {
  return language === "cn" || language.startsWith("zh");
}

// 可用的语音ID列表（会在应用启动时检测）
let availableVoiceIds: Set<string> = new Set();

// 设置可用语音列表
export function setAvailableVoices(voices: { identifier: string }[]) {
  availableVoiceIds = new Set(voices.map(v => v.identifier.toLowerCase()));
  console.log("[VoiceCharacters] Available voices:", availableVoiceIds.size);
}

// 检查语音是否可用
export function isVoiceAvailable(voiceId: string): boolean {
  return availableVoiceIds.has(voiceId.toLowerCase());
}

// 根据当前语言获取语音ID，如果不可用则返回undefined
export function getVoiceIdForLanguage(character: VoiceCharacter, language: string): string | undefined {
  const isZh = isChinese(language);
  if (Platform.OS === "ios") {
    const voiceId = isZh ? character.iosVoiceIds.zh : character.iosVoiceIds.en;
    // 检查语音是否可用
    if (isVoiceAvailable(voiceId)) {
      return voiceId;
    }
    console.log("[VoiceCharacters] Voice not available:", voiceId);
    return undefined; // 让系统使用默认语音
  }
  // Android 使用语言代码
  return undefined; // Android 通过 language 参数自动选择
}

// 获取语言代码
export function getLanguageCode(character: VoiceCharacter, language: string): string {
  const isZh = isChinese(language);
  return isZh ? character.androidLang.zh : character.androidLang.en;
}

// 根据ID获取角色
export function getCharacterById(id: string): VoiceCharacter | undefined {
  return VOICE_CHARACTERS.find((c) => c.id === id);
}

// 获取角色显示名称
export function getCharacterName(character: VoiceCharacter, language: string): string {
  return isChinese(language) ? character.nameZh : character.nameEn;
}

// 获取角色描述
export function getCharacterDescription(character: VoiceCharacter, language: string): string {
  return isChinese(language) ? character.descriptionZh : character.descriptionEn;
}

// 打开系统语音设置页面 (iOS)
export async function openVoiceSettings(): Promise<void> {
  if (Platform.OS === "ios") {
    await Linking.openURL("App-Prefs:ACCESSIBILITY");
  } else {
    await Linking.openSettings();
  }
}
