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
const runData: RunRecord = {
  startTime: Date.now(),
  distance: 0,
  time: 0,
  pace: 0,
  energy: 0,
  points: [],
  isFinish: 0,
};

// const eventEmitter = new NativeEventEmitter(NativeModules.EventEmitter);
export function useRun() {
  const currenLocation = useRunStore.getState().currentLocation;
  const setLocation = useRunStore((state) => state.setLocation);
  const [distance, setDistance] = useState<number>(1);
  const [heading, setHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const isTracking = useRef(false);
  const { addRun, updateRun } = useRunDB();
  const headingSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]);
  // watch running data from background task
  useEffect(() => {
    // 监听后台任务传回的数据
    const subscription = DeviceEventEmitter.addListener(
      RUNNING_UPDATE_EVENT,
      (data) => {
        console.log("触发emit 事件", data);
        if (!isTracking.current) return;
        const locationUpdate = data;
        const newPoint = mapPointToLonLat({
          latitude: locationUpdate.latitude,
          longitude: locationUpdate.longitude,
          timestamp: locationUpdate.timestamp,
        });
        setLocation(newPoint);
        setRoutePoints((prevPoints) => [...prevPoints, newPoint]);
        setDistance(data.distance || distance);
        LiveActivity.update({
          distance: Number((data.distance / 1000).toFixed(2)),
          duration: secondFormatHours(useRunStore.getState().duration),
          pace: secondFormatHours(useRunStore.getState().pace),
        });
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
        "RUNNING_TRACKER_TASK",
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
    LiveActivity.start();
    setRoutePoints([]); // 开始新会话时清空路径
    console.log(Date.now(), "开始跑步时间");
    runData.id = await addRun({
      startTime: Date.now(),
      distance: 0,
      time: 0,
      pace: 0,
      energy: 0,
      points: [],
      isFinish: 0,
    });
    console.log("✅ 已保存跑步数据", runData);
  };
  // 3. 停止位置追踪
  const stopTracking = (data: {
    time: number;
    pace: number;
    energy: number;
  }) => {
    if (!isTracking.current) return;
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    LiveActivity.stop();
    const { time, pace, energy } = data;
    updateRun({
      id: runData.id,
      time,
      pace,
      energy,
      distance,
      isFinish: 1,
      endTime: Date.now(),
    }).then(() => {
      isTracking.current = false;
      console.log("跑步会话结束，总点数：", routePoints.length);
    });
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
    getCurrentRunId,
    routePoints,
    distance,
    heading,
  };
}
