import { create } from "zustand";
import { getStorageItemAsync, setStorageItemAsync } from "@/hooks/useStorageState";
import { getBackupInfo, getDatabaseInfo, backupDatabase, restoreDatabase } from "@/utils/backup";
// Note: Using process.env.EXPO_OS as per Expo best practices instead of Platform.OS
import * as Network from "expo-network";

// ==================== 类型定义 ====================

export type SyncProvider = "icloud" | "none";

export type SyncStatus = 
  | "idle"           // 空闲状态
  | "checking"       // 检查中
  | "uploading"      // 上传中
  | "downloading"    // 下载中
  | "success"        // 成功
  | "error";         // 失败

export interface SyncSettings {
  // 同步 provider
  provider: SyncProvider;
  
  // 自动同步设置
  autoSync: boolean;
  wifiOnly: boolean;
  
  // 同步频率（分钟）
  syncInterval: number; // 0 表示仅在应用启动时同步
}

export interface BackupMetadata {
  // 备份是否存在
  exists: boolean;
  
  // 备份大小（字节）
  size?: number;
  
  // 最后修改时间
  modificationTime?: number;
  
  // 最后同步时间（本地记录）
  lastSyncTime?: number;
  
  // 数据库大小
  dbSize?: number;
}

export interface SyncState {
  // 当前状态
  status: SyncStatus;
  
  // 错误信息
  errorMessage?: string;
  
  // 进度（0-100）
  progress: number;
}

// ==================== 默认值 ====================

export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  provider: "icloud",
  autoSync: true,
  wifiOnly: true,
  syncInterval: 0, // 默认只在应用启动时同步
};

// Storage keys
const SYNC_SETTINGS_KEY = "cloud-sync-settings";
const SYNC_METADATA_KEY = "cloud-sync-metadata";

// ==================== Zustand Store ====================

interface CloudSyncState {
  // 设置
  settings: SyncSettings;
  
  // 备份元数据
  metadata: BackupMetadata;
  
  // 同步状态
  syncState: SyncState;
  
  // 是否已加载
  isLoaded: boolean;
  
  // 网络状态
  isWifiConnected: boolean;
  
  // 初始化
  initialize: () => Promise<void>;
  
  // 刷新备份信息
  refreshBackupInfo: () => Promise<void>;
  
  // 更新设置
  updateSettings: (settings: Partial<SyncSettings>) => Promise<void>;
  
  // 执行同步（上传）
  performSync: () => Promise<boolean>;
  
  // 执行恢复（下载）
  performRestore: () => Promise<boolean>;
  
  // 检查网络状态
  checkNetworkStatus: () => Promise<void>;
  
  // 重置状态
  resetState: () => void;
}

export const useCloudSyncStore = create<CloudSyncState>((set, get) => ({
  settings: DEFAULT_SYNC_SETTINGS,
  metadata: {
    exists: false,
  },
  syncState: {
    status: "idle",
    progress: 0,
  },
  isLoaded: false,
  isWifiConnected: true,

  initialize: async () => {
    try {
      // 加载设置
      const storedSettings = await getStorageItemAsync(SYNC_SETTINGS_KEY) as string | null;
      const settings = storedSettings 
        ? { ...DEFAULT_SYNC_SETTINGS, ...JSON.parse(storedSettings) }
        : DEFAULT_SYNC_SETTINGS;
      
      // 加载元数据
      const storedMetadata = await getStorageItemAsync(SYNC_METADATA_KEY) as string | null;
      const metadata = storedMetadata
        ? JSON.parse(storedMetadata)
        : { exists: false };
      
      // 检查网络状态
      const networkState = await Network.getNetworkStateAsync();
      
      set({ 
        settings, 
        metadata, 
        isLoaded: true,
        isWifiConnected: networkState.type === Network.NetworkStateType.WIFI,
      });
      
      // 刷新备份信息
      await get().refreshBackupInfo();
    } catch (error) {
      console.error("Failed to initialize cloud sync:", error);
      set({ isLoaded: true });
    }
  },

  refreshBackupInfo: async () => {
    try {
      const [backupInfo, dbInfo] = await Promise.all([
        getBackupInfo(),
        getDatabaseInfo(),
      ]);
      
      const metadata: BackupMetadata = {
        exists: backupInfo.exists,
        size: backupInfo.size,
        modificationTime: backupInfo.modificationTime,
        dbSize: dbInfo.size,
      };
      
      // 保存到存储
      await setStorageItemAsync(SYNC_METADATA_KEY, JSON.stringify(metadata));
      
      set({ metadata });
    } catch (error) {
      console.error("Failed to refresh backup info:", error);
    }
  },

  updateSettings: async (newSettings) => {
    const { settings } = get();
    const updated = { ...settings, ...newSettings };
    
    await setStorageItemAsync(SYNC_SETTINGS_KEY, JSON.stringify(updated));
    set({ settings: updated });
  },

  performSync: async () => {
    const { settings, checkNetworkStatus } = get();
    
    // 检查网络状态
    await checkNetworkStatus();
    const { isWifiConnected } = get();
    
    // 如果设置了仅 WiFi 同步，但当前不是 WiFi
    if (settings.wifiOnly && !isWifiConnected) {
      set({
        syncState: {
          status: "error",
          errorMessage: "需要 WiFi 连接才能同步",
          progress: 0,
        },
      });
      return false;
    }
    
    // 开始同步
    set({
      syncState: {
        status: "uploading",
        progress: 0,
      },
    });
    
    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        set((state) => ({
          syncState: {
            ...state.syncState,
            progress: Math.min(state.syncState.progress + 10, 90),
          },
        }));
      }, 100);
      
      // 执行备份
      await backupDatabase();
      clearInterval(progressInterval);
      
      // 更新元数据
      const now = Date.now();
      const [backupInfo, dbInfo] = await Promise.all([
        getBackupInfo(),
        getDatabaseInfo(),
      ]);
      
      const metadata: BackupMetadata = {
        exists: backupInfo.exists,
        size: backupInfo.size,
        modificationTime: backupInfo.modificationTime,
        lastSyncTime: now,
        dbSize: dbInfo.size,
      };
      
      await setStorageItemAsync(SYNC_METADATA_KEY, JSON.stringify(metadata));
      
      set({
        metadata,
        syncState: {
          status: "success",
          progress: 100,
        },
      });
      
      // 3秒后重置状态
      setTimeout(() => {
        set({ syncState: { status: "idle", progress: 0 } });
      }, 3000);
      
      return true;
    } catch (error) {
      console.error("Sync failed:", error);
      set({
        syncState: {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "同步失败",
          progress: 0,
        },
      });
      return false;
    }
  },

  performRestore: async () => {
    const { checkNetworkStatus } = get();
    
    await checkNetworkStatus();
    
    set({
      syncState: {
        status: "downloading",
        progress: 0,
      },
    });
    
    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        set((state) => ({
          syncState: {
            ...state.syncState,
            progress: Math.min(state.syncState.progress + 15, 90),
          },
        }));
      }, 100);
      
      // 执行恢复
      await restoreDatabase();
      clearInterval(progressInterval);
      
      // 刷新元数据
      await get().refreshBackupInfo();
      
      set({
        syncState: {
          status: "success",
          progress: 100,
        },
      });
      
      setTimeout(() => {
        set({ syncState: { status: "idle", progress: 0 } });
      }, 3000);
      
      return true;
    } catch (error) {
      console.error("Restore failed:", error);
      set({
        syncState: {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "恢复失败",
          progress: 0,
        },
      });
      return false;
    }
  },

  checkNetworkStatus: async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      set({
        isWifiConnected: networkState.type === Network.NetworkStateType.WIFI,
      });
    } catch (error) {
      console.error("Failed to check network:", error);
    }
  },

  resetState: () => {
    set({
      syncState: { status: "idle", progress: 0 },
    });
  },
}));

// ==================== 便捷 Hook ====================

/**
 * 获取格式化的同步时间
 */
export function useFormattedSyncTime(): string {
  const { metadata } = useCloudSyncStore();
  
  if (!metadata.lastSyncTime) {
    return "从未同步";
  }
  
  const now = Date.now();
  const diff = now - metadata.lastSyncTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  
  return new Date(metadata.lastSyncTime).toLocaleDateString("zh-CN");
}

/**
 * 获取格式化的文件大小
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 检查是否应该自动同步
 */
export async function shouldAutoSync(): Promise<boolean> {
  const settings = await getStorageItemAsync(SYNC_SETTINGS_KEY) as string | null;
  if (!settings) return false;
  
  const parsed: SyncSettings = JSON.parse(settings);
  if (!parsed.autoSync) return false;
  
  // 检查网络
  const networkState = await Network.getNetworkStateAsync();
  if (parsed.wifiOnly && networkState.type !== Network.NetworkStateType.WIFI) {
    return false;
  }
  
  return true;
}
