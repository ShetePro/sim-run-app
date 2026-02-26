import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 跑步缓存管理工具
 * 用于保存和恢复未完成的跑步会话
 */

// 缓存存储键名
const RUNNING_CACHE_KEY = "@simrun_running_cache";

// 缓存有效期（毫秒）- 2小时
const CACHE_VALIDITY_PERIOD = 2 * 60 * 60 * 1000;

/**
 * 跑步缓存数据接口
 */
export interface RunningCache {
  /** 跑步记录ID */
  runId: number;
  /** 开始时间戳 */
  startTime: number;
  /** 当前距离（米） */
  distance: number;
  /** 当前时长（秒） */
  duration: number;
  /** 是否暂停 */
  isPaused: boolean;
  /** 最后更新时间戳 */
  lastUpdateTime: number;
}

/**
 * 保存跑步缓存数据
 * @param data 跑步缓存数据（不含 lastUpdateTime）
 */
export async function saveRunningCache(
  data: Omit<RunningCache, "lastUpdateTime">,
): Promise<void> {
  try {
    const cacheData: RunningCache = {
      ...data,
      lastUpdateTime: Date.now(),
    };
    await AsyncStorage.setItem(RUNNING_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("[RunningCache] 保存缓存失败:", error);
    throw error;
  }
}

/**
 * 获取跑步缓存数据
 * @returns 缓存数据或null（如果没有缓存）
 */
export async function getRunningCache(): Promise<RunningCache | null> {
  try {
    const json = await AsyncStorage.getItem(RUNNING_CACHE_KEY);
    if (!json) return null;

    const cache: RunningCache = JSON.parse(json);
    return cache;
  } catch (error) {
    console.error("[RunningCache] 读取缓存失败:", error);
    return null;
  }
}

/**
 * 清空跑步缓存
 */
export async function clearRunningCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RUNNING_CACHE_KEY);
  } catch (error) {
    console.error("[RunningCache] 清空缓存失败:", error);
    throw error;
  }
}

/**
 * 检查缓存是否有效
 * @returns true-有效可以恢复, false-无效或不存在
 */
export async function isRunningCacheValid(): Promise<boolean> {
  try {
    const cache = await getRunningCache();
    if (!cache) return false;

    // 检查是否超过有效期
    const timeSinceUpdate = Date.now() - cache.lastUpdateTime;
    if (timeSinceUpdate > CACHE_VALIDITY_PERIOD) {
      await clearRunningCache();
      return false;
    }

    return true;
  } catch (error) {
    console.error("[RunningCache] 检查缓存有效性失败:", error);
    return false;
  }
}

/**
 * 格式化跑步数据用于显示
 * @param cache 缓存数据
 * @returns 格式化后的距离和时间字符串
 */
export function formatRunningCacheForDisplay(cache: RunningCache): {
  distance: string;
  duration: string;
} {
  // 距离：转换为公里并保留1位小数
  const distanceKm = (cache.distance / 1000).toFixed(1);

  // 时间：格式化为 HH:MM:SS
  const hours = Math.floor(cache.duration / 3600);
  const minutes = Math.floor((cache.duration % 3600) / 60);
  const seconds = cache.duration % 60;
  const durationStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return {
    distance: `${distanceKm} km`,
    duration: durationStr,
  };
}
