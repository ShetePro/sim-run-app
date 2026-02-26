import * as TaskManager from "expo-task-manager";
import { DeviceEventEmitter } from "react-native";
import { IndustrialKalmanFilter } from "./kalmanFilter";
import { getDistance3D, Point3D } from "./distance3D";
import { RUNNING_UPDATE_EVENT } from "@/utils/location/event";
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

console.log("定义位置任务:, LOCATION_TASK_NAME");
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  console.log(error, data, "后台获取当前位置");
  if (error) {
    console.error(error);
    return;
  }

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
