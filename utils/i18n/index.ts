import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getStorageItemAsync, setStorageItemAsync } from "@/hooks/useStorageState";

// 设置存储 key（与 settingsStore 保持一致）
const SETTINGS_STORAGE_KEY = "app-settings";

const resources = {
  en: {
    translation: {
      common: {
        today: "Today",
        yesterday: "Yesterday",
        time: "Time",
        error: "Error",
        cancel: "Cancel",
        saving: "Saving...",
        save: "Save",
        loading: "Loading",
        back: "Back",
        greeting: {
          morning: "Good morning",
          afternoon: "Good afternoon",
          evening: "Good evening",
        },
      },
      tabs: {
        index: "Home",
        history: "History",
        charts: "Stats",
        user: "User",
      },
      weather: {
        sunny: "Sunny",
        cloudy: "Cloudy",
        overcast: "Overcast",
        comfortable: "Comfortable",
        breezy: "Breezy",
        windy: "Windy",
        hot: "Hot",
        cold: "Cold",
        warm: "Warm",
        cool: "Cool",
        humid: "Humid",
        dry: "Dry",
        hazy: "Hazy",
        foggy: "Foggy",
        showery: "Showery",
        stormy: "Stormy",
        mild: "Mild",
        fresh: "Fresh",
      },
      login: {
        title: "Login here",
        registerTitle: "Create Account",
        registerDescription:
          "Create an account so you can explore all the existing jobs",
        welcome: "Welcome back you've been missed!",
        forgetPassword: "Forgot your password?",
        account: "Account",
        password: "Password",
        confirmPassword: "Confirm Password",
        createAccount: "Create new account",
        haveAccount: "Already have an account",
        continue: "Or continue with",
        login: "Sign in",
        register: "Sign up",
        confirmPasswordError: "The two passwords do not match",
      },
      home: {
        todayActivity: "Today's Activity",
        completeness: "Completeness",
        duration: "Duration",
        calories: "Calories",
        pace: "Average pace",
        stepFrequency: "Step frequency",
        totalDistance: "Total Distance",
        totalHours: "Total Hours",
        totalRuns: "Total Runs",
        startRun: "Start Run!",
        career: "Career Stats",
        recentActivities: "Recent Activities",
        showMore: "More",
      },
      charts: {
        title: "Activity Stats",
        sinceDate: "Since",
        weeklyDistance: "Distance",
        totalCalories: "Calories",
        avgPace: "Avg Pace",
        weekly: "Weekly",
        monthly: "Monthly",
        yearly: "Yearly",
        dailyDistance: "Daily Distance (km)",
        weeklyTrend: "Weekly Trend",
        dailyCalories: "Daily Calories (kcal)",
        caloriesBurned: "Calories Burned",
      },
      history: {
        outdoorRun: "Outdoor Run",
        noRecords: "No records yet",
      },
      run: {
        summary: "Run Summary",
        detail: "Run Detail",
        discard: "Discard",
        discardTitle: "Discard Run?",
        discardMessage: "This run will not be saved. Are you sure?",
        discardRecord: "Discard Record",
        saveRecord: "Save Record",
        editInfo: "Edit Info",
        info: "Run Info",
        addNote: "Add a note...",
        noNote: "No note",
        duration: "Duration",
        steps: "Steps",
        signal: "Signal",
        notFound: "Run record not found",
      },
      setting: {
        language: "Language",
        darkMode: "DarkMode",
        editProfile: "Edit Profile",
        cloudSync: "Cloud Sync Data",
        map: "Map Settings",
        notify: "Notification",
        helps: "Help and Feedback",
        about: "about Us",
        logout: "Log out",
        preferences: "Preferences",
        tools: "Running Tools",
        other: "Others",
      },
      language: {
        title: "Language",
        cn: "中文",
        en: "English",
      },
      activity: {
        distance: "Distance",
        steps: "Steps",
        energy: "Energy",
        pace: "Pace",
        runs: "Runs",
        hours: "Hours",
      },
      unit: {
        km: "km",
        mi: "mi",
        kcal: "kcal",
        hours: "h",
        minutes: "min",
        seconds: "s",
        spm: "spm",
      },
      time: {
        week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        months: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
      },
    },
  },
  cn: {
    translation: {
      common: {
        today: "今天",
        yesterday: "昨天",
        time: "时间",
        error: "错误",
        cancel: "取消",
        saving: "保存中...",
        save: "保存",
        loading: "加载中",
        back: "返回",
        greeting: {
          morning: "早上好",
          afternoon: "下午好",
          evening: "晚上好",
        },
      },
      tabs: {
        index: "首页",
        history: "记录",
        charts: "图表",
        user: "我的",
      },
      weather: {
        sunny: "晴朗",
        cloudy: "多云",
        overcast: "阴天",
        comfortable: "舒适",
        breezy: "微风",
        windy: "有风",
        hot: "炎热",
        cold: "寒冷",
        warm: "温暖",
        cool: "凉爽",
        humid: "潮湿",
        dry: "干燥",
        hazy: "朦胧",
        foggy: "有雾",
        showery: "阵雨",
        stormy: "雷暴",
        mild: "温和",
        fresh: "清新",
      },
      login: {
        title: "在这里登陆",
        registerTitle: "创建账户",
        registerDescription: "创建一个帐户，以便您可以探索所有现有的功能",
        welcome: "欢迎回来，我们都很想念你！",
        account: "账号",
        password: "密码",
        confirmPassword: "确认密码",
        forgetPassword: "忘记密码?",
        createAccount: "创建新账号",
        haveAccount: "已有账户",
        continue: "其他方式登陆",
        login: "登陆",
        register: "注册",
        confirmPasswordError: "两次密码不一致",
      },
      home: {
        todayActivity: "今日活动",
        completeness: "目标完成度",
        duration: "运动时长",
        calories: "运动消耗",
        pace: "平均配速",
        stepFrequency: "平均步频",
        totalDistance: "总公里",
        totalHours: "总时长",
        totalRuns: "总次数",
        startRun: "开始跑步",
        career: "生涯累计",
        recentActivities: "最近活动",
        showMore: "查看全部",
      },
      charts: {
        title: "运动统计",
        sinceDate: "至今",
        weeklyDistance: "本周里程",
        totalCalories: "总消耗",
        avgPace: "平均配速",
        weekly: "周",
        monthly: "月",
        yearly: "年",
        dailyDistance: "每日跑量 (km)",
        weeklyTrend: "本周累计趋势",
        dailyCalories: "卡路里消耗 (kcal)",
        caloriesBurned: "每日热量燃烧",
      },
      history: {
        outdoorRun: "户外跑步",
        noRecords: "暂无记录",
      },
      run: {
        summary: "跑步总结",
        discard: "放弃",
        discardTitle: "放弃本次跑步?",
        discardMessage: "本次跑步数据将不会被保存，确定放弃吗？",
        discardRecord: "放弃记录",
        saveRecord: "保存记录",
        editInfo: "编辑信息",
        addNote: "添加备注...",
        duration: "运动时长",
        steps: "步数",
        signal: "信号强度",
        notFound: "未找到跑步记录",
      },
      setting: {
        language: "语言/Language",
        darkMode: "深色模式",
        editProfile: "编辑资料",
        map: "地图设置",
        cloudSync: "云端同步",
        notify: "消息通知",
        helps: "帮助与反馈",
        about: "关于我们",
        logout: "退出登录",
        preferences: "偏好设置",
        tools: "跑步工具",
        other: "其他",
      },
      language: {
        title: "语言设置",
        cn: "中文",
        en: "English",
      },
      activity: {
        distance: "距离",
        steps: "平均步频",
        energy: "运动消耗",
        pace: "平均配速",
        runs: "跑步数",
        hours: "总时长",
      },
      unit: {
        kcal: "千卡",
        km: "公里",
        mi: "米",
        hours: "小时",
        minutes: "分",
        seconds: "秒",
        spm: "步/分",
      },
      time: {
        week: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        months: [
          "1月", "2月", "3月", "4月", "5月", "6月",
          "7月", "8月", "9月", "10月", "11月", "12月"
        ],
      },
    },
  },
};

// 从 settings 存储中获取语言
const getLanguageFromSettings = async (): Promise<string | null> => {
  try {
    const stored = await getStorageItemAsync(SETTINGS_STORAGE_KEY) as string | null;
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.language || null;
    }
  } catch (error) {
    console.error("Failed to get language from settings:", error);
  }
  return null;
};

// 初始化 i18n
const initI18n = async () => {
  // 首先尝试从新的 settings 存储读取
  let savedLang = await getLanguageFromSettings();
  
  // 如果没找到，尝试旧 key（兼容旧版本）
  if (!savedLang) {
    savedLang = await getStorageItemAsync("app-language") as string | null;
  }
  
  i18n.use(initReactI18next).init({
    resources,
    lng: savedLang || "cn",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
};

initI18n();

export default i18n;
