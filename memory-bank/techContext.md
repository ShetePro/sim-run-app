# Tech Context (技术环境)

## 开发环境

### 基础要求

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **TypeScript**: 5.9.x
- **iOS**: Xcode 15+ (iOS 16.0+)
- **Android**: Android Studio (Android 10+ API 29+)

### 开发工具

- **IDE**: VS Code (推荐插件: ESLint, Prettier, Tailwind CSS IntelliSense)
- **模拟器**: iOS Simulator / Android Emulator
- **真机调试**: Expo Go (开发) / 自定义 Development Client (生产)

## 关键依赖

### 核心框架

| 依赖         | 版本     | 用途           |
| ------------ | -------- | -------------- |
| expo         | ~54.0.12 | 跨平台开发框架 |
| react-native | 0.81.4   | 原生 UI 框架   |
| react        | 19.1.0   | UI 库          |
| typescript   | ~5.9.2   | 类型系统       |

### 状态与存储

| 依赖                                      | 版本    | 用途                 |
| ----------------------------------------- | ------- | -------------------- |
| zustand                                   | ^5.0.9  | 轻量级状态管理       |
| expo-sqlite                               | ~16.0.8 | 本地 SQLite 数据库   |
| @react-native-async-storage/async-storage | ^2.2.0  | 异步存储             |
| expo-secure-store                         | ~14.0.0 | 安全存储（敏感数据） |

### 定位与地图

| 依赖              | 版本    | 用途     |
| ----------------- | ------- | -------- |
| expo-location     | ~19.0.7 | GPS 定位 |
| react-native-maps | 1.18.0  | 地图组件 |
| expo-task-manager | ~14.0.9 | 后台任务 |
| geolib            | ^3.3.4  | 地理计算 |

### UI 与样式

| 依赖                    | 版本    | 用途               |
| ----------------------- | ------- | ------------------ |
| nativewind              | 4.2     | TailwindCSS for RN |
| tailwindcss             | ^3.4.15 | 原子化 CSS         |
| @expo/vector-icons      | ^15.0.2 | 图标库             |
| expo-image              | ~3.0.8  | 图片加载           |
| react-native-reanimated | ~4.1.1  | 动画库             |

### 路由与导航

| 依赖                     | 版本    | 用途         |
| ------------------------ | ------- | ------------ |
| expo-router              | ~6.0.10 | 文件系统路由 |
| @react-navigation/native | ^7.1.8  | 导航核心     |

### 国际化

| 依赖              | 版本    | 用途         |
| ----------------- | ------- | ------------ |
| i18next           | ^24.0.2 | 国际化框架   |
| react-i18next     | ^15.1.2 | React 绑定   |
| expo-localization | ^17.0.8 | 系统语言检测 |

### 原生功能

| 依赖                  | 版本    | 用途              |
| --------------------- | ------- | ----------------- |
| expo-speech           | ~14.0.8 | 语音合成 (TTS)    |
| expo-sensors          | ~15.0.8 | 传感器（计步器）  |
| @bacons/apple-targets | ^3.0.6  | iOS Live Activity |

### 数据可视化

| 依赖                       | 版本    | 用途        |
| -------------------------- | ------- | ----------- |
| victory-native             | ^37.3.6 | 图表库      |
| @shopify/react-native-skia | 2.2.12  | 2D 图形渲染 |

### 工具库

| 依赖            | 版本     | 用途      |
| --------------- | -------- | --------- |
| axios           | ^1.7.8   | HTTP 请求 |
| dayjs           | ^1.11.13 | 日期处理  |
| react-hook-form | ^7.53.2  | 表单管理  |
| jsencrypt       | ^3.3.2   | RSA 加密  |

## 部署/发布

### EAS Build (推荐)

```bash
# iOS 生产构建
npm run build:ios

# Android 生产构建
npm run build:android

# 本地构建
npm run build:ios-local
```

### 配置

- **EAS 配置**: `eas.json`
- **Expo 配置**: `app.json`
- **构建环境**: EAS Cloud (托管) / 本地 (local)

### 发布渠道

- **测试**: TestFlight (iOS) / Internal Testing (Android)
- **生产**: App Store (iOS) / Google Play (Android)

## 开发脚本

```bash
# 开发服务器
npm start

# 平台特定运行
npm run ios
npm run android

# 代码检查
npm run lint

# 测试
npm test

# 重置项目
npm run reset-project
```
