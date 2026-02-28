# Active Context (当前活动上下文)

## 🚀 当前专注点 (Current Focus)

修复并完善 SimRun 跑步应用的核心功能与国际化体验，确保首次启动时正确跟随系统语言，以及跑步数据准确记录。

## 💡 最近的变更 (Recent Changes)

### 1. 修复跑步距离记录问题

- **问题**: 跑步结算时公里数显示 0.00
- **原因**:
  - `distance` 初始值错误设为 1
  - 缺少 `distanceRef` 同步追踪实时值
  - 后台任务的 `totalDistance` 未重置
  - `updateRun` 实时更新轨迹点时缺少 run ID
- **修复**:
  - 修正 `distance` 初始值为 0
  - 添加 `distanceRef` + `useEffect` 同步
  - 添加 `resetLocationTask()` 重置后台任务状态
  - 为卡尔曼滤波器添加 `reset()` 方法
  - 修复 `updateRun` 调用添加 `runData.id` 检查

### 2. 完善国际化 (i18n)

- **权限提示本地化**: 使用 Expo 官方方案配置 `locales/en.json` 和 `locales/zh.json`
- **应用内提示国际化**:
  - 国际化 `profile.tsx`（表单标签、Alert 提示）
  - 国际化 `cloud-sync.tsx`（导入导出提示）
  - 国际化 `run-summary.tsx`（加载/保存提示）
  - 国际化 `SignIn.tsx`（登录成功提示）
  - 国际化 `user.tsx`（退出登录提示）
- **新增翻译键**: profile、permission、login、run.loadFailed 等

### 3. 修复系统语言检测

- **问题**: 首次启动不跟随 iPhone 系统语言
- **原因**: `DEFAULT_SETTINGS.language` 硬编码为 "cn"
- **修复**:
  - 导入 `expo-localization` 检测系统语言
  - 添加 `getSystemLanguage()` 函数
  - 动态设置 `DEFAULT_SETTINGS.language`
  - 添加详细调试日志

### 4. 代码质量优化

- **替换废弃 API**: 将 `getStorageItem` 替换为 `getStorageItemAsync`
- **影响文件**: user.tsx、index.tsx、profile.tsx、run.tsx

### 5. 后台任务运行状态管理

- **问题**: 后台位置任务在非跑步状态下也会执行，造成性能开销
- **修复**:
  - 添加 `isRunning` 模块级状态标志
  - 实现 `startRunning()` / `stopRunning()` 控制任务处理
  - 在 `defineTask` 入口处添加快速退出逻辑

### 6. 修复步数存储为0的Bug

- **问题**: `stopPedometer()` 在 `stopTracking()` 之前调用，将步数重置为0
- **修复**: 调整调用顺序，确保数据保存后再重置计步器

### 7. 轨迹点步数记录功能

- **功能**: 在每个轨迹点记录累计步数，便于后续分析
- **实现**:
  - 修改 `TrackPoint` 类型，添加 `steps` 字段
  - 修改数据库表结构，添加 `steps` 列
  - 实现数据库迁移逻辑，兼容旧数据（steps 可为 null）
  - 在实时位置更新时记录当前累计步数

### 8. 优化首页每日统计UI

- **变更**: 将配速和步频改为燃效和总步数
- **燃效计算**: 总卡路里 / 总距离（kcal/km）
- **总步数**: 直接累加显示，更易理解
- **翻译**: 添加中英文支持（燃效/总步数）

### 9. 重新设计 History 页面列表

- **风格**: Apple Fitness 风格
- **改进**:
  - 大字体距离显示（36pt）作为核心数据
  - 三列数据网格布局（时长 | 配速 | 卡路里）
  - 24px 大圆角卡片设计
  - 微妙的阴影效果（elevation/shadow）
  - 运动图标（Ionicons walk-outline）
  - 右滑删除手势（react-native-gesture-handler Swipeable）
  - 改进的日期分组头部样式（带统计摘要）
- **交互**: 滑动删除替代长按删除，更符合 iOS 习惯
- **翻译**: 新增 `history.activities` 翻译键

### 10. 优化 Run Detail 页面

- **路径动画**: ✅ **已修复** - 使用 requestAnimationFrame 替代 Animated API
  - 使用 `requestAnimationFrame` 实现平滑动画循环
  - 添加缓动函数 `easeOut` 实现自然减速效果
  - 优化状态更新：只有当点数量变化时才更新（防抖）
  - 修复了 Animated API 导致的 React 渲染时序问题
- **地图类型切换**:
  - 右上角浮动胶囊按钮组（标准 | 卫星 | 混合）
  - 本地状态管理，不影响全局设置
  - 默认跟随全局地图设置
- **距离显示重新设计**:
  - ✅ **Apple Maps 风格可拖动底部卡片**（@gorhom/bottom-sheet）
  - 使用 BottomSheet 组件实现真正的手势拖动
  - 两个停靠点：25%（收起状态）和 50%（展开状态）
  - 地图全屏显示，BottomSheet 覆盖在上方
  - 拖动指示条：系统默认样式，自动适配暗色模式
  - 背景色：白色/深灰色（根据系统主题自动切换）
  - 支持手势拖动上下滑动
  - 编辑模式按钮在展开状态下可见
- **重播按钮**: ✅ **已恢复** - 点击可重新播放路径动画
- **翻译**: 新增 `map.type.*` 翻译键（standard/satellite/hybrid）

## 🚧 下一步计划 (Next Steps)

### 高优先级

- [ ] 测试系统语言切换功能（首次安装英文系统手机）
- [ ] 验证跑步距离记录准确性（实地测试）
- [ ] 检查调试日志输出，确认语言检测逻辑

### 功能优化

- [ ] 优化 GPS 信号弱时的体验
- [ ] 添加跑步暂停时的 UI 提示
- [ ] 完善语音播报功能测试

### 待修复问题

- [ ] 检查是否有其他废弃 API 警告
- [ ] 验证 iCloud 备份恢复功能
- [ ] 测试导出 GPX/JSON 功能

### 技术债务

- [ ] 清理控制台废弃警告
- [ ] 优化 React Hook 依赖警告
- [ ] 完善 TypeScript 类型定义
