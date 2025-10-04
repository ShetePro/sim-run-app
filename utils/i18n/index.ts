import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      common: {
        today: "today",
        time: "Time",
      },
      tabs: {
        index: "Home",
        history: "History",
        charts: "Charts",
        user: "User",
      },
      login: {
        title: "Login here",
        registerTitle: "Create Account",
        registerDescription:
          "Create an account so you can explore all the existing jobs",
        welcome: "Welcome back you’ve been missed!",
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
      },
      activity: {
        distance: "Distance",
        steps: "Steps",
        energy: "Energy",
        pace: "Pace",
        runs: "Runs",
        hours: "Hours",
        mi: "mi",
        km: "km",
        kcal: "kcal",
      },
    },
  },
  cn: {
    translation: {
      common: {
        today: "今天",
        time: "时间",
      },
      tabs: {
        index: "首页",
        history: "记录",
        charts: "图表",
        user: "我的",
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
      },
      activity: {
        distance: "距离",
        steps: "平均步频",
        energy: "运动消耗",
        pace: "平均配速",
        runs: "跑步数",
        km: "公里",
        hours: "总时长",
        kcal: "千卡",
      },
    },
  },
};
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "cn",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
