import * as FileSystem from "expo-file-system/legacy";
import { defaultDatabaseDirectory } from "expo-sqlite";
import { Platform } from "react-native";

const DB_NAME = "simrun.db";
const BACKUP_FILE_NAME = "simrun_backup.db";

// ==================== 类型定义 ====================

export interface RunRecord {
  id?: number;
  startTime: number;
  endTime: number;
  distance: number;
  time: number;
  pace: number;
  energy: number;
  steps: number;
  elevationGain: number;
  note?: string;
  isFinish: number;
}

export interface TrackPoint {
  id?: number;
  runId: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  timestamp?: number;
  heading?: number;
}

export interface RestoreResult {
  success: boolean;
  mode: "incremental" | "force";
  restoredRuns: RestoredRunItem[];
  skippedCount: number;
  error?: string;
}

export interface RestoredRunItem {
  date: string;
  distance: number;
  duration: number;
  isNew: boolean;
}

// ==================== 辅助函数 ====================

import * as SQLite from "expo-sqlite";

/**
 * 获取数据库连接
 */
async function getDatabase() {
  return await SQLite.openDatabaseAsync(DB_NAME);
}

/**
 * 格式化日期
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 将距离从米转换为公里
 */
function metersToKm(meters: number): number {
  return Number((meters / 1000).toFixed(2));
}

/**
 * 获取数据库文件的完整路径
 */
export function getDatabasePath(): string {
  // 使用 expo-sqlite 的默认数据库目录
  const dbDirectory = defaultDatabaseDirectory;
  return `${dbDirectory}/${DB_NAME}`;
}

/**
 * 获取备份文件路径
 */
export function getBackupPath(): string {
  return `${FileSystem.documentDirectory}${BACKUP_FILE_NAME}`;
}

/**
 * 检查数据库文件是否存在
 */
export async function checkDatabaseExists(): Promise<boolean> {
  try {
    const dbPath = getDatabasePath();
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    return fileInfo.exists;
  } catch {
    return false;
  }
}

/**
 * 备份 SQLite 数据库到 FileSystem.documentDirectory
 * 这样可以利用 iCloud 自动备份功能
 *
 * iOS 说明：
 * - DocumentDirectory 中的文件默认会被 iCloud 备份
 * - 这是苹果推荐的存储用户数据的位置
 */
export async function backupDatabase(): Promise<void> {
  try {
    // 获取数据库文件路径
    const dbPath = getDatabasePath();
    const backupPath = getBackupPath();

    // 检查数据库文件是否存在
    const dbFileInfo = await FileSystem.getInfoAsync(dbPath);
    if (!dbFileInfo.exists) {
      console.log("⚠️ 数据库文件不存在，跳过备份");
      return;
    }

    // 复制数据库文件到 documentDirectory
    await FileSystem.copyAsync({
      from: dbPath,
      to: backupPath,
    });

    // iOS: documentDirectory 中的文件默认会被 iCloud 备份
    if (Platform.OS === "ios") {
      console.log("✅ 数据库已备份到 iCloud 可备份目录:", backupPath);
    } else {
      console.log("✅ 数据库已备份到:", backupPath);
    }
  } catch (error) {
    console.error("❌ 备份数据库失败:", error);
    // 备份失败不影响主流程，只记录错误
  }
}

/**
 * 从备份恢复数据库（如果需要）
 *
 * 使用场景：
 * - 应用重新安装后恢复数据
 * - 从 iCloud 恢复设备后恢复数据
 *
 * 注意：只有在数据库不存在时才会恢复，避免覆盖现有数据
 */
export async function restoreDatabase(): Promise<void> {
  try {
    const dbPath = getDatabasePath();
    const backupPath = getBackupPath();

    // 检查备份文件是否存在
    const backupFileInfo = await FileSystem.getInfoAsync(backupPath);
    if (!backupFileInfo.exists) {
      console.log("⚠️ 备份文件不存在，无法恢复");
      return;
    }

    // 检查数据库文件是否已存在
    const dbFileInfo = await FileSystem.getInfoAsync(dbPath);
    if (dbFileInfo.exists) {
      console.log("ℹ️ 数据库已存在，跳过恢复以避免覆盖现有数据");
      return;
    }

    // 复制备份文件到数据库路径
    await FileSystem.copyAsync({
      from: backupPath,
      to: dbPath,
    });

    console.log("✅ 数据库已从备份恢复");
  } catch (error) {
    console.error("❌ 恢复数据库失败:", error);
  }
}

/**
 * 强制从备份恢复数据库（会覆盖现有数据）
 * 仅在用户明确选择恢复备份时使用
 */
export async function forceRestoreDatabase(): Promise<void> {
  try {
    const dbPath = getDatabasePath();
    const backupPath = getBackupPath();

    // 检查备份文件是否存在
    const backupFileInfo = await FileSystem.getInfoAsync(backupPath);
    if (!backupFileInfo.exists) {
      console.log("⚠️ 备份文件不存在，无法恢复");
      return;
    }

    // 复制备份文件到数据库路径（覆盖现有文件）
    await FileSystem.copyAsync({
      from: backupPath,
      to: dbPath,
    });

    console.log("✅ 数据库已从备份强制恢复（覆盖现有数据）");
  } catch (error) {
    console.error("❌ 强制恢复数据库失败:", error);
  }
}

/**
 * 检查备份是否存在
 */
export async function checkBackupExists(): Promise<boolean> {
  try {
    const backupPath = getBackupPath();
    const fileInfo = await FileSystem.getInfoAsync(backupPath);
    return fileInfo.exists;
  } catch {
    return false;
  }
}

/**
 * 验证备份文件有效性
 * @returns 验证结果和详细信息
 */
export async function validateBackupFile(): Promise<{
  valid: boolean;
  exists: boolean;
  size: number;
  readable: boolean;
  hasData: boolean;
  recordCount: number;
  error?: string;
}> {
  const result: {
    valid: boolean;
    exists: boolean;
    size: number;
    readable: boolean;
    hasData: boolean;
    recordCount: number;
    error?: string;
  } = {
    valid: false,
    exists: false,
    size: 0,
    readable: false,
    hasData: false,
    recordCount: 0,
  };

  try {
    const backupPath = getBackupPath();

    // 1. 检查文件是否存在
    const fileInfo = await FileSystem.getInfoAsync(backupPath);
    if (!fileInfo.exists) {
      result.error = "备份文件不存在";
      return result;
    }
    result.exists = true;

    // 2. 检查文件大小
    const fileSize = (fileInfo as any).size || 0;
    result.size = fileSize;
    if (fileSize === 0) {
      result.error = "备份文件为空";
      return result;
    }
    if (fileSize < 1024) {
      // 小于1KB可能是损坏的文件
      result.error = "备份文件过小，可能已损坏";
      return result;
    }

    // 3. 尝试读取并验证数据库内容
    try {
      const backupDb = await SQLite.openDatabaseAsync(BACKUP_FILE_NAME);
      result.readable = true;

      // 3.1 先检查 runs 表是否存在
      const tableInfo = await backupDb.getFirstAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='runs'",
      );

      if (!tableInfo) {
        result.error = "备份文件尚未初始化，请完成一次跑步记录后再试";
        await backupDb.closeAsync();
        return result;
      }

      // 3.2 查询 runs 表记录数
      const countResult = await backupDb.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM runs WHERE isFinish = 1",
      );
      const recordCount = countResult?.count || 0;
      result.recordCount = recordCount;

      if (recordCount > 0) {
        result.hasData = true;
        result.valid = true;
      } else {
        result.error = "备份文件中未找到有效的跑步记录";
      }

      await backupDb.closeAsync();
    } catch (dbError) {
      result.error = "无法读取备份文件，文件可能已损坏";
      console.error("验证备份文件数据库错误:", dbError);
    }

    return result;
  } catch (error) {
    result.error = "验证备份文件时发生错误";
    console.error("验证备份文件失败:", error);
    return result;
  }
}

/**
 * 获取备份文件信息
 */
export async function getBackupInfo(): Promise<{
  exists: boolean;
  size?: number;
  modificationTime?: number;
}> {
  try {
    const backupPath = getBackupPath();
    const fileInfo = await FileSystem.getInfoAsync(backupPath);
    return {
      exists: fileInfo.exists,
      size: (fileInfo as any).size,
      modificationTime: (fileInfo as any).modificationTime,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * 获取数据库文件信息
 */
export async function getDatabaseInfo(): Promise<{
  exists: boolean;
  size?: number;
  modificationTime?: number;
}> {
  try {
    const dbPath = getDatabasePath();
    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (fileInfo.exists) {
      return {
        exists: true,
        size: (fileInfo as any).size,
        modificationTime: (fileInfo as any).modificationTime,
      };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}

// ==================== 增量同步功能 ====================

/**
 * 读取云端备份数据库中的数据
 * @returns 备份中的跑步记录和轨迹点
 */
export async function readCloudBackup(): Promise<{
  runs: RunRecord[];
  trackPoints: TrackPoint[];
} | null> {
  try {
    const backupPath = getBackupPath();
    const backupFileInfo = await FileSystem.getInfoAsync(backupPath);

    if (!backupFileInfo.exists) {
      console.log("⚠️ 备份文件不存在");
      return null;
    }

    // 打开备份数据库（只读）
    const backupDb = await SQLite.openDatabaseAsync(BACKUP_FILE_NAME);

    // 读取所有跑步记录
    const runs = await backupDb.getAllAsync<RunRecord>(
      `SELECT * FROM runs WHERE isFinish = 1 ORDER BY startTime DESC`,
    );

    // 读取所有轨迹点
    const trackPoints = await backupDb.getAllAsync<TrackPoint>(
      `SELECT * FROM track_points ORDER BY timestamp ASC`,
    );

    await backupDb.closeAsync();

    console.log(
      `📖 读取备份数据: ${runs.length} 条记录, ${trackPoints.length} 个轨迹点`,
    );

    return { runs, trackPoints };
  } catch (error) {
    console.error("❌ 读取备份数据失败:", error);
    return null;
  }
}

/**
 * 获取本地所有跑步记录（用于对比）
 */
async function getLocalRuns(): Promise<RunRecord[]> {
  try {
    const db = await getDatabase();
    const runs = await db.getAllAsync<RunRecord>(
      `SELECT * FROM runs WHERE isFinish = 1`,
    );
    return runs;
  } catch (error) {
    console.error("❌ 获取本地记录失败:", error);
    return [];
  }
}

/**
 * 判断两条记录是否为同一条（基于开始和结束时间戳）
 */
function isSameRecord(local: RunRecord, cloud: RunRecord): boolean {
  return local.startTime === cloud.startTime && local.endTime === cloud.endTime;
}

/**
 * 插入跑步记录到本地数据库
 */
async function insertRun(
  db: SQLite.SQLiteDatabase,
  run: RunRecord,
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO runs (startTime, endTime, distance, time, pace, energy, steps, elevationGain, note, isFinish)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      run.startTime,
      run.endTime,
      run.distance,
      run.time,
      run.pace,
      run.energy,
      run.steps,
      run.elevationGain,
      run.note || null,
      run.isFinish,
    ],
  );
  return result.lastInsertRowId;
}

/**
 * 插入轨迹点到本地数据库
 */
async function insertTrackPoints(
  db: SQLite.SQLiteDatabase,
  points: TrackPoint[],
  runId: number,
): Promise<void> {
  for (const point of points) {
    await db.runAsync(
      `INSERT INTO track_points (runId, latitude, longitude, altitude, timestamp, heading)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        runId,
        point.latitude,
        point.longitude,
        point.altitude || null,
        point.timestamp || null,
        point.heading || null,
      ],
    );
  }
}

/**
 * 增量恢复数据（只恢复本地不存在的记录）
 */
export async function incrementalRestore(): Promise<RestoreResult> {
  const result: RestoreResult = {
    success: false,
    mode: "incremental",
    restoredRuns: [],
    skippedCount: 0,
  };

  try {
    // 1. 读取云端备份
    const cloudData = await readCloudBackup();
    if (!cloudData) {
      result.error = "备份文件不存在";
      return result;
    }

    // 2. 获取本地记录
    const localRuns = await getLocalRuns();

    // 3. 筛选出需要恢复的记录
    const runsToRestore: RunRecord[] = [];
    for (const cloudRun of cloudData.runs) {
      const exists = localRuns.some((local) => isSameRecord(local, cloudRun));
      if (!exists) {
        runsToRestore.push(cloudRun);
      } else {
        result.skippedCount++;
      }
    }

    if (runsToRestore.length === 0) {
      result.success = true;
      console.log("ℹ️ 没有新记录需要恢复");
      return result;
    }

    // 4. 批量插入（使用事务）
    const db = await getDatabase();

    await db.withTransactionAsync(async () => {
      for (const run of runsToRestore) {
        // 插入跑步记录
        const newRunId = await insertRun(db, run);

        // 查找并插入关联的轨迹点
        const relatedPoints = cloudData.trackPoints.filter(
          (p) => p.runId === run.id,
        );
        if (relatedPoints.length > 0) {
          await insertTrackPoints(db, relatedPoints, newRunId);
        }

        // 添加到结果列表
        result.restoredRuns.push({
          date: formatDate(run.startTime),
          distance: metersToKm(run.distance),
          duration: run.time,
          isNew: true,
        });
      }
    });

    result.success = true;
    console.log(
      `✅ 增量恢复完成: 新增 ${result.restoredRuns.length} 条记录, 跳过 ${result.skippedCount} 条`,
    );
  } catch (error) {
    console.error("❌ 增量恢复失败:", error);
    result.error = error instanceof Error ? error.message : "恢复失败";
  }

  return result;
}

/**
 * 强制恢复数据（覆盖本地所有数据）
 */
export async function forceRestore(): Promise<RestoreResult> {
  const result: RestoreResult = {
    success: false,
    mode: "force",
    restoredRuns: [],
    skippedCount: 0,
  };

  try {
    // 1. 读取云端备份
    const cloudData = await readCloudBackup();
    if (!cloudData) {
      result.error = "备份文件不存在";
      return result;
    }

    // 2. 获取本地记录数量（用于显示）
    const localRuns = await getLocalRuns();
    result.skippedCount = localRuns.length; // 被覆盖的记录数

    // 3. 清空本地数据
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM track_points`);
      await db.runAsync(`DELETE FROM runs`);
    });

    // 4. 插入所有云端记录
    await db.withTransactionAsync(async () => {
      for (const run of cloudData.runs) {
        const newRunId = await insertRun(db, run);

        const relatedPoints = cloudData.trackPoints.filter(
          (p) => p.runId === run.id,
        );
        if (relatedPoints.length > 0) {
          await insertTrackPoints(db, relatedPoints, newRunId);
        }

        result.restoredRuns.push({
          date: formatDate(run.startTime),
          distance: metersToKm(run.distance),
          duration: run.time,
          isNew: false, // 强制恢复的记录标记为已存在
        });
      }
    });

    result.success = true;
    console.log(`✅ 强制恢复完成: 恢复 ${result.restoredRuns.length} 条记录`);
  } catch (error) {
    console.error("❌ 强制恢复失败:", error);
    result.error = error instanceof Error ? error.message : "恢复失败";
  }

  return result;
}
