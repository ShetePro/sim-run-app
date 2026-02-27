import * as TaskManager from "expo-task-manager";
import { DeviceEventEmitter } from "react-native";
import { IndustrialKalmanFilter } from "./kalmanFilter";
import { getDistance3D, Point3D } from "./distance3D";
import {
  RUNNING_UPDATE_EVENT,
  LOCATION_ERROR_EVENT,
} from "@/utils/location/event";
import { useRunStore } from "@/store/runStore";

export const LOCATION_TASK_NAME = "SIM_RUN_RUNNING_TRACKER_TASK";
const filter = new IndustrialKalmanFilter();

// 存储内存中的变量（仅限任务运行期间）
let lastPoint: Point3D | null = null;
let totalDistance = 0;
let isPaused = false; // 暂停状态标志

const setAccuracy = useRunStore.getState().setAccuracy;

// 重置任务状态（开始新跑步时调用）
export function resetLocationTask() {
  lastPoint = null;
  totalDistance = 0;
  isPaused = false;
  filter.reset();
  console.log("✅ 位置任务状态已重置");
}

// 暂停位置追踪（暂停跑步时调用）
export function pauseLocationTask() {
  isPaused = true;
  console.log("⏸️ 位置任务已暂停，当前距离:", totalDistance);
}

// 恢复位置追踪（继续跑步时调用）
export function resumeLocationTask() {
  isPaused = false;
  // 恢复时重置 lastPoint，避免计算暂停期间的大距离跳跃
  lastPoint = null;
  console.log("▶️ 位置任务已恢复，继续计算距离");
}

// 获取当前距离（用于 UI 显示）
export function getCurrentDistance(): number {
  return totalDistance;
}

// 解析 iOS/Android 定位错误
function parseLocationError(error: any): { type: string; message: string } {
  if (!error) return { type: "unknown", message: "未知错误" };

  const errorCode = error.code || error.errorCode;
  const errorDomain = error.domain || error.errorDomain;

  // iOS Core Location 错误
  if (errorDomain === "kCLErrorDomain" || errorDomain === "CLErrorDomain") {
    switch (errorCode) {
      case 0:
        return {
          type: "permission_denied",
          message: "定位权限被拒绝，请在设置中开启",
        };
      case 1:
        return {
          type: "service_disabled",
          message: "定位服务已关闭，请检查系统设置",
        };
      case 2:
        return {
          type: "signal_weak",
          message: "无法获取位置，请移动到开阔地带",
        };
      case 3:
        return { type: "background_restricted", message: "后台定位受限" };
      default:
        return { type: "unknown", message: `定位异常 (Code: ${errorCode})` };
    }
  }

  // Android 定位错误
  if (error.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes("permission") || msg.includes("denied")) {
      return { type: "permission_denied", message: "定位权限被拒绝" };
    }
    if (msg.includes("disabled") || msg.includes("provider")) {
      return { type: "service_disabled", message: "定位服务已关闭" };
    }
    if (msg.includes("timeout") || msg.includes("unavailable")) {
      return { type: "signal_weak", message: "定位信号弱" };
    }
  }

  return { type: "unknown", message: error.message || "定位服务异常" };
}

console.log("定义位置任务:, LOCATION_TASK_NAME");
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  // 如果有错误，静默处理并广播给 UI
  if (error) {
    const errorInfo = parseLocationError(error);
    // 只在控制台记录，不抛出
    console.log("[LocationTask] 位置错误:", errorInfo.type, errorInfo.message);

    // 广播错误事件给 UI
    DeviceEventEmitter.emit(LOCATION_ERROR_EVENT, {
      type: errorInfo.type,
      message: errorInfo.message,
      timestamp: Date.now(),
    });
    return;
  }

  console.log(data, "后台获取当前位置");

  if (data) {
    const { locations } = data;
    console.log(locations);

    for (const rawPoint of locations) {
      console.log(rawPoint.coords.accuracy, "信号强度");
      setAccuracy(rawPoint.coords.accuracy);

      if (rawPoint.coords.accuracy > 30) return;

      // 2. 喂给工业级滤波器
      const filtered = filter.process(
        rawPoint.coords.latitude,
        rawPoint.coords.longitude,
        rawPoint.coords.accuracy,
        rawPoint.timestamp,
      );

      // 3. 计算 3D 距离累加（包含海拔高度）
      const currentPoint: Point3D = {
        latitude: filtered.latitude,
        longitude: filtered.longitude,
        altitude: rawPoint.coords.altitude,
      };

      // 只有在非暂停状态下才计算距离
      if (!isPaused) {
        if (lastPoint) {
          const delta = getDistance3D(lastPoint, currentPoint);

          // 运动过滤：跑步者 1秒钟位移通常在 1m-10m 之间
          // 如果 delta < 0.5m，说明是原地漂移，不计入里程
          if (delta > 0.5 && delta < 15) {
            totalDistance += delta;
          }
        }
        lastPoint = currentPoint;
      }

      console.log(rawPoint, "rawPoint");

      // 4. 将结果广播给 UI（无论是否暂停都广播位置）
      DeviceEventEmitter.emit(RUNNING_UPDATE_EVENT, {
        latitude: filtered.latitude,
        longitude: filtered.longitude,
        altitude: rawPoint.coords.altitude,
        distance: totalDistance, // 直接返回总距离
        speed: rawPoint.coords.speed,
        heading: rawPoint.coords.heading,
        isPaused: isPaused, // 添加暂停状态
      });
    }
  }
});
