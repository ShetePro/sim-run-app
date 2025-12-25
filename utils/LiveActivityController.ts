import { requireNativeModule } from "expo-modules-core";

// 1. 获取刚才写的原生模块
// 名字必须和 Swift 文件里 Name("SimRun") 一致
const LiveActivityModule = requireNativeModule("LiveActivity");

// 2. 定义接口
interface LiveActivityAPI {
  startActivity(): void;
  updateActivity(distance: number, pace: string): void;
  endActivity(): void;
}

// 3. 导出封装好的函数
export const LiveActivity = {
  /**
   * 启动灵动岛
   * 建议在点击“开始跑步”按钮时调用
   */
  start: () => {
    try {
      LiveActivityModule.startActivity();
      console.log("JS: 请求启动灵动岛");
    } catch (e) {
      console.error("JS: 启动灵动岛失败", e);
    }
  },

  /**
   * 更新数据
   * 建议在 TaskManager 或 Zustand 状态变化时调用
   */
  update: (distance: number, pace: string) => {
    try {
      LiveActivityModule.updateActivity(distance, pace);
    } catch (e) {
      // 忽略错误，避免因为更新频繁导致 crash
    }
  },

  /**
   * 关闭灵动岛
   * 建议在点击“结束跑步”或“保存记录”时调用
   */
  stop: () => {
    try {
      LiveActivityModule.endActivity();
      console.log("JS: 请求关闭灵动岛");
    } catch (e) {
      console.error("JS: 关闭灵动岛失败", e);
    }
  },
};
