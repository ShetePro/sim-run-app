// import { requireNativeModule } from "expo-modules-core";

// 1. 获取刚才写的原生模块
// 名字必须和 Swift 文件里 Name("SimRun") 一致
// const LiveActivityModule = requireNativeModule("Smart");
import {
  startLiveActivity,
  updateLiveActivity,
  stopLiveActivity,
} from "../modules/activity-controller";

interface LiveActivityParams {
  distance: number;
  pace: string;
  duration: string;
}

export const LiveActivity = {
  /**
   * 启动灵动岛
   * 建议在点击“开始跑步”按钮时调用
   */
  start: async () => {
    try {
      await startLiveActivity();
      console.log("JS: 请求启动灵动岛");
    } catch (e) {
      console.error("JS: 启动灵动岛失败", e);
    }
  },

  /**
   * 更新数据
   * 建议在 TaskManager 或 Zustand 状态变化时调用
   */
  update: (() => {
    let lastUpdateTime = 0;
    const MIN_UPDATE_INTERVAL = 3000; // 最少 3 秒更新一次
    let isUpdating = false;

    return async (params: LiveActivityParams) => {
      // 频率限制
      const now = Date.now();
      if (now - lastUpdateTime < MIN_UPDATE_INTERVAL) {
        return;
      }
      lastUpdateTime = now;

      // 防止并发更新
      if (isUpdating) {
        return;
      }

      isUpdating = true;
      try {
        await updateLiveActivity(params);
      } catch (e) {
        // 忽略错误，避免因为更新频繁导致 crash
        console.log("LiveActivity update skipped:", e);
      } finally {
        isUpdating = false;
      }
    };
  })(),

  /**
   * 关闭灵动岛
   * 建议在点击"结束跑步"或"保存记录"时调用
   */
  stop: async () => {
    try {
      await stopLiveActivity();
      console.log("JS: 请求关闭灵动岛");
    } catch (e) {
      console.error("JS: 关闭灵动岛失败", e);
    }
  },
};
