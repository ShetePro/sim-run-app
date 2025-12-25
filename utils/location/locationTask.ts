import * as TaskManager from "expo-task-manager";
import { DeviceEventEmitter } from "react-native";
import { IndustrialKalmanFilter } from "./kalmanFilter";
import { getDistance } from "geolib";
import { RUNNING_UPDATE_EVENT } from "@/utils/location/event";
import { useRunStore } from "@/store/runStore";

export const LOCATION_TASK_NAME = "RUNNING_TRACKER_TASK";
const filter = new IndustrialKalmanFilter();
// 存储内存中的变量（仅限任务运行期间）
let lastPoint: { latitude: number; longitude: number } | null = null;
let totalDistance = 0;
const setAccuracy = useRunStore.getState().setAccuracy;
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

      // 3. 计算距离累加
      if (lastPoint) {
        const delta = getDistance(
          { latitude: lastPoint.latitude, longitude: lastPoint.longitude },
          { latitude: filtered.latitude, longitude: filtered.longitude },
          0.01, // 精度设置为厘米级
        );

        // 运动过滤：跑步者 1秒钟位移通常在 1m-10m 之间
        // 如果 delta < 0.5m，说明是原地漂移，不计入里程
        if (delta > 0.5 && delta < 15) {
          totalDistance += delta;
        }
      }

      lastPoint = filtered;
      console.log(rawPoint, "rawPoint");
      // 4. 将结果广播给 UI
      DeviceEventEmitter.emit(RUNNING_UPDATE_EVENT, {
        latitude: filtered.latitude,
        longitude: filtered.longitude,
        distance: totalDistance,
        speed: rawPoint.coords.speed, // 原始速度
        heading: rawPoint.coords.heading,
      });
    }
  }
});
