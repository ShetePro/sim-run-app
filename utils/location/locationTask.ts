import * as TaskManager from "expo-task-manager";
import { DeviceEventEmitter } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IndustrialKalmanFilter } from "./kalmanFilter";
import { getDistance3D, Point3D } from "./distance3D";
import { RUNNING_UPDATE_EVENT } from "@/utils/location/event";
import { useRunStore } from "@/store/runStore";

export const LOCATION_TASK_NAME = "SIM_RUN_RUNNING_TRACKER_TASK";
const filter = new IndustrialKalmanFilter();
// 存储内存中的变量（仅限任务运行期间）
let lastPoint: Point3D | null = null;
let totalDistance = 0;
const setAccuracy = useRunStore.getState().setAccuracy;

// 存储键名
const PAUSED_DISTANCE_KEY = "@run_paused_distance";

// 重置任务状态（开始新跑步时调用）
export function resetLocationTask() {
  lastPoint = null;
  totalDistance = 0;
  filter.reset();
  // 清除持久化的暂停距离
  AsyncStorage.removeItem(PAUSED_DISTANCE_KEY);
  console.log("✅ 位置任务状态已重置");
}

// 保存当前距离（暂停时调用）
export async function savePausedDistance() {
  try {
    await AsyncStorage.setItem(PAUSED_DISTANCE_KEY, String(totalDistance));
    console.log("💾 已保存暂停距离:", totalDistance);
  } catch (error) {
    console.error("❌ 保存暂停距离失败:", error);
  }
}

// 恢复距离（继续跑步时调用）
export async function restoreDistance(): Promise<number> {
  try {
    const savedDistance = await AsyncStorage.getItem(PAUSED_DISTANCE_KEY);
    if (savedDistance) {
      totalDistance = Number(savedDistance);
      console.log("📂 已恢复距离:", totalDistance);
      return totalDistance;
    }
  } catch (error) {
    console.error("❌ 恢复距离失败:", error);
  }
  return 0;
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

      if (lastPoint) {
        const delta = getDistance3D(lastPoint, currentPoint);

        // 运动过滤：跑步者 1秒钟位移通常在 1m-10m 之间
        // 如果 delta < 0.5m，说明是原地漂移，不计入里程
        if (delta > 0.5 && delta < 15) {
          totalDistance += delta;
        }
      }

      lastPoint = currentPoint;
      console.log(rawPoint, "rawPoint");
      // 4. 将结果广播给 UI
      DeviceEventEmitter.emit(RUNNING_UPDATE_EVENT, {
        latitude: filtered.latitude,
        longitude: filtered.longitude,
        altitude: rawPoint.coords.altitude,
        distance: totalDistance,
        speed: rawPoint.coords.speed, // 原始速度
        heading: rawPoint.coords.heading,
      });
    }
  }
});
