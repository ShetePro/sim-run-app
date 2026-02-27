# System Patterns (系统模式)

## 技术栈 (Tech Stack)

### 核心框架

- **框架**: React Native 0.81 + Expo SDK 54
- **构建工具**: Metro (Expo 内置)
- **语言**: TypeScript 5.9
- **运行时**: React 19.1

### UI 与样式

- **样式方案**: NativeWind 4.2 (TailwindCSS for React Native)
- **图标**: @expo/vector-icons (Ionicons, MaterialCommunityIcons)
- **渐变**: expo-linear-gradient / react-native-linear-gradient
- **图片**: expo-image (高性能图片加载)

### 状态管理

- **全局状态**: Zustand 5.0
  - `useRunStore` - 跑步状态（位置、距离、时间）
  - `useSettingsStore` - 应用设置（语言、主题、单位）
  - `useCloudSyncStore` - 云同步状态
- **本地存储**: expo-secure-store (敏感数据), AsyncStorage (普通数据)
- **数据库**: expo-sqlite (SQLite)

### 路由与导航

- **路由**: Expo Router 6.0 (基于文件系统的路由)
- **导航**: React Navigation 7.x (底部 Tab、栈导航)
- **深度链接**: expo-linking

### 定位与地图

- **定位**: expo-location (GPS)
- **地图**: react-native-maps (iOS 原生地图 / Google Maps)
- **地理计算**: geolib (距离计算)
- **轨迹滤波**: 工业级卡尔曼滤波 (自定义实现)

### 原生功能

- **后台任务**: expo-task-manager (LOCATION_TASK_NAME)
- **计步器**: expo-sensors (Pedometer)
- **语音**: expo-speech (TTS)
- **通知**: 本地通知 + iOS Live Activity
- **文件系统**: expo-file-system, expo-document-picker
- **网络**: expo-network

### 国际化

- **方案**: i18next + react-i18next
- **语言**: 简体中文 (cn) / 英文 (en)
- **检测**: expo-localization

## 架构模式

### 1. 组件化设计

- **页面组件**: `app/` 目录下按路由组织
- **业务组件**: `components/` 按功能分组
  - `card/` - 卡片组件
  - `ui/` - 通用 UI 组件
  - `form/` - 表单组件
  - `tab-bar/` - 导航栏组件
- **布局组件**: `_layout.tsx` 定义路由布局

### 2. Hooks 逻辑复用

- **自定义 Hooks**:
  - `useRun` - 跑步逻辑（定位、轨迹、计时）
  - `useRunDB` - 数据库操作封装
  - `useTick` - 计时器逻辑
  - `usePedometer` - 计步器封装
  - `useVoiceAnnounce` - 语音播报
  - `useSettingsStore` - 设置管理

### 3. 文件结构约定

```
app/                          # 路由页面
├── (tabs)/                   # Tab 导航组
│   ├── index.tsx            # 首页
│   ├── history.tsx          # 历史记录
│   ├── charts.tsx           # 统计图表
│   └── user.tsx             # 个人中心
├── (views)/                  # 子页面
│   ├── run.tsx              # 跑步中页面
│   ├── run-summary.tsx      # 跑步结算
│   ├── profile.tsx          # 编辑资料
│   └── ...
└── _layout.tsx              # 根布局

components/                   # 组件
├── card/                    # 卡片组件
├── ui/                      # 通用 UI
├── map/                     # 地图相关
└── ...

hooks/                       # 自定义 Hooks
├── useRun.ts
├── useSQLite.ts
└── ...

store/                       # Zustand 状态
├── runStore.ts
├── settingsStore.ts
└── cloudSyncStore.ts

utils/                       # 工具函数
├── location/               # 定位相关
│   ├── location.ts
│   ├── locationTask.ts
│   └── kalmanFilter.ts
├── i18n/                   # 国际化
│   └── index.ts
└── ...

locales/                     # 本地化文件
├── en.json                 # iOS/Android 权限提示
└── zh.json
```

### 4. 数据流模式

- **单向数据流**: UI → Action → Store → Database → UI
- **实时更新**: DeviceEventEmitter 广播位置更新
- **状态持久化**: Zustand + AsyncStorage 自动同步

## 关键约定

### 命名规范

- **组件**: PascalCase (例: `TodayActivityCard`)
- **Hooks**: camelCase with `use` prefix (例: `useRun`)
- **工具函数**: camelCase (例: `secondFormatHours`)
- **常量**: UPPER_SNAKE_CASE (例: `LOCATION_TASK_NAME`)
- **类型**: PascalCase with descriptive names

### 代码风格

- **Imports 顺序**: React → 第三方 → 项目绝对路径 → 相对路径
- **TypeScript**: 严格模式，避免 `any`
- **错误处理**: 所有 Promise 必须有 try/catch
- **日志**: 使用 `console.log` 带上下文前缀（例: `[App]`, `[i18n]`）

### 性能优化

- **列表优化**: 使用 FlashList 替代 FlatList
- **重渲染优化**: 复杂计算使用 useMemo
- **动画**: 使用原生驱动 (useNativeDriver: true)
- **图片**: 使用 expo-image 自动优化

### 国际化

- **所有 UI 文本**: 必须使用 `t("key")`
- **键名规范**: `section.subsection.field` (例: `run.finish`)
- **语言文件**: `utils/i18n/index.ts` 中定义
