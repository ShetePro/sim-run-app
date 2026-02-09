# 🎨 SimRun Logo 设计

## 设计理念

SimRun 的 Logo 体现了跑步应用的核心特质：
- **动感**：前倾的跑步姿态展现运动感
- **简洁**：纯色人形轮廓，易于识别
- **活力**：紫粉渐变背景，年轻时尚

## Logo 构成

```
┌─────────────────────────────┐
│      紫粉渐变背景            │
│    ┌─────────────┐          │
│    │  白色人形    │  ◀── 跑步姿态 │
│    │   跑步图标   │          │
│    └─────────────┘          │
│                             │
│       SimRun               │
└─────────────────────────────┘
```

## 颜色规范

| 颜色 | Hex | 用途 |
|------|-----|------|
| 主紫色 | `#6366F1` | 渐变起始 |
| 紫罗兰 | `#8B5CF6` | 渐变中间 |
| 粉色 | `#EC4899` | 渐变结束 |
| 白色 | `#FFFFFF` | 图标/文字 |

## 使用方法

### 方法一：使用 HTML 生成器（推荐）

1. 用浏览器打开 `docs/logo-generator.html`
2. 点击"导出 Logo 图片"按钮
3. 使用在线工具裁剪为所需尺寸

### 方法二：使用 Figma

[Figma 设计文件](https://www.figma.com/file/placeholder/simrun-logo)

1. 导入 `assets/images/logo.svg`
2. 导出为 1024×1024 PNG

### 方法三：使用命令行（需安装工具）

```bash
# macOS
brew install librsvg
./scripts/generate-logo.sh

# Linux
sudo apt-get install librsvg2-bin
./scripts/generate-logo.sh
```

## 尺寸规格

| 文件 | 尺寸 | 用途 |
|------|------|------|
| `icon.png` | 1024×1024 | iOS App Store |
| `splash-icon.png` | 1024×1024 | 启动屏 |
| `adaptive-icon.png` | 1024×1024 | Android |
| `favicon.png` | 32×32 | Web |

## 在线转换工具

如果没有安装命令行工具，可以使用：

- [Convertio SVG to PNG](https://convertio.co/svg-png/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)
- [SVG to PNG](https://svgtopng.com/)

**设置：**
- 宽度：1024 px
- 高度：1024 px
- 背景：透明或填充

## 图标变体

### 简化版（小尺寸使用）

仅保留跑步人形，去除文字：

```svg
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="25" r="10" fill="white"/>
  <path d="M50 35 L45 55 L35 75" stroke="white" stroke-width="5" stroke-linecap="round"/>
  <path d="M45 55 L60 65 L70 85" stroke="white" stroke-width="5" stroke-linecap="round"/>
</svg>
```

### 单色版（打印使用）

使用纯色背景：
- 主色：`#6366F1`
- 白色图标

## 应用效果预览

### iOS 桌面图标
- 圆角：22%（约 180px）
- 系统自动添加圆角

### Android 自适应图标
- 前景：跑步人形
- 背景：渐变
- 安全区域：中心 66%

### 启动屏
- 居中显示
- 背景色：`#6366F1`

## 版权信息

© 2025 SimRun. All rights reserved.
