# iCloud 数据库备份说明

## 功能概述

本应用支持将 SQLite 数据库自动备份到 iCloud，确保用户数据在以下场景不会丢失：

- 更换新 iPhone
- 重新安装应用
- 设备损坏后恢复

## 工作原理

### 1. 备份触发时机

每次跑步结束后，系统会自动将数据库备份到 `FileSystem.documentDirectory`。

```
跑步结束 → 更新数据库 → 复制到 documentDirectory → iCloud 自动备份
```

### 2. 文件位置

| 文件 | 位置 | 说明 |
|------|------|------|
| 数据库 | `ExpoSQLite.defaultDatabaseDirectory/simrun.db` | 应用运行时使用 |
| 备份 | `FileSystem.documentDirectory/simrun_backup.db` | iCloud 可备份 |

### 3. 恢复逻辑

应用启动时会自动检查：

1. 如果存在备份文件且数据库不存在 → 自动恢复
2. 如果数据库已存在 → 跳过恢复（避免覆盖现有数据）

## iOS 配置

iOS 的 `documentDirectory` 默认会被 iCloud 备份，无需额外配置。

### 注意事项

1. **备份时间**：iCloud 备份通常在设备充电、锁屏且连接 Wi-Fi 时进行
2. **存储空间**：备份占用用户的 iCloud 存储空间
3. **隐私**：备份文件包含所有跑步记录数据

## 手动操作 API

### 检查备份是否存在

```typescript
import { checkBackupExists } from "@/utils/backup";

const hasBackup = await checkBackupExists();
console.log("备份存在:", hasBackup);
```

### 获取备份信息

```typescript
import { getBackupInfo, getDatabaseInfo } from "@/utils/backup";

const backupInfo = await getBackupInfo();
console.log("备份大小:", backupInfo.size);
console.log("备份时间:", new Date(backupInfo.modificationTime || 0));

const dbInfo = await getDatabaseInfo();
console.log("数据库大小:", dbInfo.size);
```

### 强制恢复备份（覆盖现有数据）

```typescript
import { forceRestoreDatabase } from "@/utils/backup";

// ⚠️ 警告：这会覆盖当前数据库中的所有数据
await forceRestoreDatabase();
```

### 手动触发备份

```typescript
import { backupDatabase } from "@/utils/backup";

await backupDatabase();
```

## 故障排除

### 备份没有出现在 iCloud 中

1. 确保设备开启了 iCloud 备份：
   - 设置 → [你的名字] → iCloud → iCloud 备份 → 开启

2. 确保应用数据被包含在备份中：
   - 设置 → [你的名字] → iCloud → 管理账户储存空间 → 备份 → [设备名称] → 显示所有 App → 确认 SimRun 被开启

3. 手动触发 iCloud 备份：
   - 设置 → [你的名字] → iCloud → iCloud 备份 → 立即备份

### 恢复后数据不一致

- 检查备份时间戳：`getBackupInfo()` 返回的 `modificationTime`
- 确认是从正确的备份恢复

## 技术细节

- 使用 `expo-file-system` 进行文件操作
- 使用 `expo-sqlite` 的 `defaultDatabaseDirectory` 获取数据库路径
- 备份文件随应用数据一起被 iCloud 备份
