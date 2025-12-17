import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { LocationObjectCoords, LocationSubscription } from "expo-location";
import { haversineDistance } from "@/utils/util";
import { useRunDB } from "@/hooks/useSQLite";
import { RunRecord } from "@/types/runType";
import { mapPointToLonLat, requestLocationPermission } from "@/utils/location";
import { useStorageState } from "@/hooks/useStorageState";
const runData: RunRecord = {
  startTime: Date.now(),
  distance: 0,
  time: 0,
  pace: 0,
  energy: 0,
  points: [],
  isFinish: 0,
};
export function useRun() {
  const [[isLoading, locationCache], setLocationCache] =
    useStorageState("location");
  const [location, setLocation] = useState<LatLon | null>(
    mapPointToLonLat(locationCache ? JSON.parse(locationCache) : null),
  );
  const [distance, setDistance] = useState<number>(1);
  const [heading, setHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const isTracking = useRef(false);
  const { addRun, updateRun } = useRunDB();
  let calcIndex = 0;
  const headingSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const [locationSubscription, setLocationSubscription] =
    useState<LocationSubscription | null>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]);
  // 计算距离逻辑
  useEffect(() => {
    if (routePoints.length < 2 || routePoints.length <= calcIndex + 1) {
      return;
    }
    const start = routePoints[calcIndex];
    const end = routePoints[calcIndex + 1];
    calcIndex++;
    const distance = haversineDistance(start, end);
    console.log("距离", routePoints);
    setDistance((prev) => prev + distance);
  }, [routePoints]);

  // 手动模拟跑步
  const simulateRun = () => {
    const point = routePoints.at(-1);
    let lat = point?.latitude || location?.latitude || 0;
    let lon = point?.longitude || location?.longitude || 0;
    let index = 0;
    const interval = setInterval(() => {
      lat += 0.00003; // 每次增加一点纬度
      // lon += 0.0001; // 每次增加一点经度
      const newPoint = {
        latitude: lat.toFixed(6),
        longitude: lon,
        timestamp: Date.now(),
      };
      setLocation(newPoint);
      setRoutePoints((prevPoints) => [...prevPoints, newPoint]);
      index++;
    }, 1000);
  };

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
      setLocationCache(JSON.stringify(coords));
      headingSubscription.current = await Location.watchHeadingAsync((data) => {
        setHeading(data.trueHeading);
      });
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High, // 高精度模式
          timeInterval: 1000, // 每 1 秒更新一次
          distanceInterval: 5, // 每移动 5 米更新一次
        },
        (locationUpdate) => {
          const newPoint = mapPointToLonLat({
            latitude: locationUpdate.coords.latitude,
            longitude: locationUpdate.coords.longitude,
            timestamp: locationUpdate.timestamp,
          });
          setLocation(newPoint);
          if (isTracking.current) {
            setRoutePoints((prevPoints) => [...prevPoints, newPoint]);
          }
        },
      );
      setLocationSubscription(subscription);
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
    setRoutePoints([]); // 开始新会话时清空路径
    // simulateRun();
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
    // 在这里你可以将 routePoints 保存到本地或发送到服务器
  };
  // 4. 组件卸载时停止追踪
  useEffect(() => {
    // const call = setInterval(() => {
    //   const random = Math.floor(Math.random() * 10) % 10;
    //   setHeading((prevState) => prevState + random);
    // }, 1500);
    return () => {
      // clearInterval(call);
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);
  return {
    location,
    errorMsg,
    startTracking,
    stopTracking,
    routePoints,
    distance,
    heading,
  };
}
