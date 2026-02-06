# 跑步数据导出功能

## 功能概述

在跑步详情页面添加了导出按钮，支持将单次跑步数据导出为多种格式，方便用户备份或分享数据。

## 使用方法

1. 进入**历史记录**页面
2. 点击任意一条跑步记录进入详情页
3. 点击右上角的 **分享/导出** 图标
4. 选择导出格式：
   - **JSON** - 完整数据结构，包含所有元数据和轨迹点
   - **GPX** - 标准 GPS 交换格式，可导入其他运动 App
   - **CSV** - 表格格式，方便在 Excel 中分析

## 导出格式说明

### JSON 格式

最完整的导出格式，包含：

```json
{
  "version": "1.0",
  "exportTime": "2024-01-15T10:30:00.000Z",
  "run": {
    "id": 123,
    "title": "晨跑",
    "distanceKm": "5.23",
    "timeFormatted": "00:32:15",
    "paceFormatted": "6'10\"",
    ...
  },
  "trackPoints": [
    {
      "index": 1,
      "latitude": 30.9042,
      "longitude": 122.4074,
      "heading": 90,
      "timestamp": 1705312800000
    }
  ],
  "stats": {
    "totalPoints": 156,
    "startPoint": {...},
    "endPoint": {...}
  }
}
```

### GPX 格式

通用的 GPS 轨迹格式，支持导入：
- Strava
- Keep
- 佳明 (Garmin)
- 高驰 (Coros)
- 其他支持 GPX 的运动 App

GPX 文件结构：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SimRun App">
  <metadata>
    <name>晨跑</name>
    <time>2024-01-15T08:00:00.000Z</time>
  </metadata>
  <trk>
    <trkseg>
      <trkpt lat="30.9042" lon="122.4074">
        <time>2024-01-15T08:00:00.000Z</time>
      </trkpt>
      ...
    </trkseg>
  </trk>
</gpx>
```

### CSV 格式

表格数据，包含所有轨迹点：

| index | latitude | longitude | heading | timestamp | timeFormatted |
|-------|----------|-----------|---------|-----------|---------------|
| 1 | 30.9042 | 122.4074 | 90 | 1705312800000 | 2024-01-15 08:00:00 |
| ... | ... | ... | ... | ... | ... |

## 技术实现

### 核心文件

- `utils/exportRun.ts` - 导出功能的核心实现
- `app/(views)/run-summary.tsx` - 详情页导出按钮

### 导出函数

```typescript
// 导出为 JSON
exportRunAsJSON(runData, trackPoints)

// 导出为 GPX
exportRunAsGPX(runData, trackPoints)

// 导出为 CSV
exportRunAsCSV(runData, trackPoints)
```

### 文件存储

导出的临时文件存储在 `FileSystem.documentDirectory`，分享完成后自动删除。

## 注意事项

1. **文件分享** - 使用系统分享面板，可选择保存到文件、发送给好友、上传到云盘等
2. **隐私保护** - 导出的文件包含完整的 GPS 轨迹，分享时请注意隐私
3. **兼容性** - GPX 格式兼容性最好，建议优先使用
4. **数据完整性** - JSON 格式包含最完整的数据，适合备份

## 常见问题

### 导出失败怎么办？

1. 检查是否有足够的存储空间
2. 检查应用是否有文件访问权限
3. 尝试重新进入详情页后再次导出

### 如何导入到其他 App？

1. 导出 GPX 格式
2. 在其他 App 中找到"导入"或"从文件导入"功能
3. 选择导出的 GPX 文件即可

### 支持批量导出吗？

目前仅支持单次跑步导出。如需批量导出，建议定期使用 iCloud 备份功能。
