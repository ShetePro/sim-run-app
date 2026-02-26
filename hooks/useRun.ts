import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { LocationObjectCoords } from "expo-location";
import { secondFormatHours } from "@/utils/util";
import { useRunDB } from "@/hooks/useSQLite";
import { RunRecord } from "@/types/runType";
import {
  mapPointToLonLat,
  requestLocationPermission,
} from "@/utils/location/location";
import { DeviceEventEmitter } from "react-native";
import { RUNNING_UPDATE_EVENT } from "@/utils/location/event";
import { useRunStore } from "@/store/runStore";
import { LiveActivity } from "@/utils/LiveActivityController";
import { backupDatabase } from "@/utils/backup";
import {
  LOCATION_TASK_NAME,
  resetLocationTask,
  pauseLocationTask,
  resumeLocationTask,
} from "@/utils/location/locationTask";
import { saveRunningCache, clearRunningCache } from "@/utils/runningCache";
const runData: RunRecord = {
  startTime: Date.now(),
  distance: 0,
  time: 0,
  pace: 0,
  energy: 0,
  steps: 0,
  elevationGain: 0,
  points: [],
  isFinish: 0,
};

// const eventEmitter = new NativeEventEmitter(NativeModules.EventEmitter);
export function useRun() {
  const currenLocation = useRunStore.getState().currentLocation;
  const setLocation = useRunStore((state) => state.setLocation);
  const stepCount = useRunStore((state) => state.stepCount);
  const [distance, setDistance] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const isTracking = useRef(false);
  const isPaused = useRef(false);
  const { addRun, updateRun } = useRunDB();
  const headingSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]);
  const routePointsRef = useRef<any[]>([]);
  const distanceRef = useRef(0);

  // 保持 ref 与 state 同步
  useEffect(() => {
    routePointsRef.current = routePoints;
  }, [routePoints]);

  // 保持 distanceRef 与 distance state 同步
  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);

  // watch running data from background task
  useEffect(() => {
    // 监听后台任务传回的数据
    const subscription = DeviceEventEmitter.addListener(
      RUNNING_UPDATE_EVENT,
      async (data) => {
        console.log("触发emit 事件", data);
        if (!isTracking.current || isPaused.current) return;
        const locationUpdate = data;
        const newPoint = mapPointToLonLat({
          latitude: locationUpdate.latitude,
          longitude: locationUpdate.longitude,
          timestamp: locationUpdate.timestamp,
        });
        setLocation(newPoint);

        // 使用 ref 获取最新的 routePoints，避免闭包问题
        const updatedPoints = [...routePointsRef.current, newPoint];
        if (runData.id) {
          updateRun({
            id: runData.id,
            points: updatedPoints,
          });
        }
        setRoutePoints(updatedPoints);

        // 直接使用后台返回的总距离，不再减去暂停距离
        const currentDistance = data.distance || distanceRef.current;
        setDistance(Math.max(0, currentDistance));

        // 同步跑步数据到缓存
        if (runData.id) {
          try {
            await saveRunningCache({
              runId: runData.id,
              startTime: runData.startTime || Date.now(),
              distance: currentDistance,
              duration: useRunStore.getState().duration,
              isPaused: isPaused.current,
            });
          } catch (error) {
            console.error("[useRun] 保存跑步缓存失败:", error);
          }
        }

        try {
          await LiveActivity.update({
            distance: Number((currentDistance / 1000).toFixed(2)),
            duration: secondFormatHours(useRunStore.getState().duration),
            pace: secondFormatHours(useRunStore.getState().pace),
          });
        } catch (e) {
          console.log("LiveActivity update error:", e);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  // request location permissions
  const requestPermissions = async () => {
    await requestLocationPermission();
    try {
      // 2. 获取当前位置
      let locationData = await Location.getCurrentPositionAsync({
        // 设置精度：建议使用 High 或 Highest 获取更准确的 GPS 结果
        accuracy: Location.Accuracy.High,
        // 允许等待更长时间来获取高精度位置
        mayShowUserSettingsDialog: true,
      });
      // save heading direction
      if (locationData.coords.heading) {
        setHeading(locationData.coords.heading);
      }
      const coords = mapPointToLonLat<LocationObjectCoords>({
        ...locationData.coords,
      });
      setLocation(coords);
      headingSubscription.current = await Location.watchHeadingAsync((data) => {
        setHeading(data.trueHeading);
      });
      const locationUpdateTask = await Location.startLocationUpdatesAsync(
        LOCATION_TASK_NAME,
        {
          accuracy: Location.Accuracy.BestForNavigation,
          activityType: Location.ActivityType.AutomotiveNavigation,
          pausesUpdatesAutomatically: false,
          timeInterval: 5000, // 1秒更新一次
          distanceInterval: 10, // 1米移动更新
          foregroundService: {
            notificationTitle: "跑步记录中",
            notificationBody: "正在使用高精度滤波器优化轨迹",
            notificationColor: "#4CAF50",
          },
        },
      );
      setLocationSubscription(locationUpdateTask);
    } catch (err) {
      setErrorMsg("获取位置信息失败，请检查GPS是否开启。");
    } finally {
    }
    return true;
  };
  useEffect(() => {
    requestPermissions();
  }, []);
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;
    isTracking.current = true;
    isPaused.current = false;

    // 重置所有状态
    resetLocationTask(); // 重置后台任务的距离计算
    setRoutePoints([]); // 开始新会话时清空路径
    setDistance(0); // 重置距离
    distanceRef.current = 0; // 重置距离 ref

    await LiveActivity.start();
    console.log(Date.now(), "开始跑步时间");
    runData.id = await addRun({
      startTime: Date.now(),
      distance: 0,
      time: 0,
      pace: 0,
      energy: 0,
      steps: 0,
      elevationGain: 0,
      points: currenLocation
        ? [
            {
              latitude: currenLocation.latitude,
              longitude: currenLocation.longitude,
              heading: heading,
              timestamp: Date.now(),
            },
          ]
        : [],
      isFinish: 0,
    });
    console.log("✅ 已保存跑步数据", runData);
  };
  // 3. 停止位置追踪
  const stopTracking = async (data: {
    time: number;
    pace: number;
    energy: number;
  }): Promise<void> => {
    if (!isTracking.current) return;
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    await LiveActivity.stop();
    const { time, pace, energy } = data;
    // 直接使用当前距离，不再减去暂停距离
    const finalDistance = distanceRef.current;

    // 计算累计海拔爬升
    const elevationGain = calculateElevationGain(routePoints);
    console.log("📊 累计海拔爬升:", elevationGain, "米");

    // 等待数据库更新完成
    await updateRun({
      id: runData.id,
      time,
      pace,
      energy,
      distance: Math.max(0, finalDistance),
      steps: stepCount,
      elevationGain,
      isFinish: 1,
      endTime: Date.now(),
    });

    isTracking.current = false;
    isPaused.current = false;
    console.log("跑步会话结束，总点数：", routePoints.length);

    // 清空跑步缓存
    try {
      await clearRunningCache();
    } catch (error) {
      console.error("[useRun] 清空跑步缓存失败:", error);
    }

    // 备份数据库到 documentDirectory 以便 iCloud 备份
    await backupDatabase();
  };

  // 暂停追踪
  const pauseTracking = async () => {
    if (!isTracking.current || isPaused.current) return;
    isPaused.current = true;
    // 通知后台任务暂停计算距离
    pauseLocationTask();
    console.log("⏸️ 跑步已暂停，当前距离:", distanceRef.current);
  };

  // 继续追踪
  const resumeTracking = async () => {
    if (!isTracking.current || !isPaused.current) return;
    // 通知后台任务恢复计算
    resumeLocationTask();
    isPaused.current = false;
    console.log("▶️ 跑步已恢复，继续从当前距离计算");
  };

  // 计算累计海拔爬升（只计算上升，不计算下降）
  const calculateElevationGain = (points: any[]): number => {
    if (points.length < 2) return 0;
    let gain = 0;
    for (let i = 1; i < points.length; i++) {
      const prevAltitude = points[i - 1].altitude;
      const currAltitude = points[i].altitude;
      // 只累加上升的海拔差
      if (prevAltitude !== undefined && currAltitude !== undefined) {
        const diff = currAltitude - prevAltitude;
        if (diff > 0) {
          gain += diff;
        }
      }
    }
    return gain;
  };

  // 4. 组件卸载时停止追踪
  useEffect(() => {
    return () => {
      // clearInterval(call);
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);
  // 获取当前跑步ID
  const getCurrentRunId = () => runData.id;

  return {
    location: currenLocation,
    errorMsg,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    getCurrentRunId,
    routePoints,
    distance,
    heading,
    isPaused: () => isPaused.current,
  };
}
