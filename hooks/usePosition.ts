import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { LocationSubscription } from "expo-location";

export function usePosition() {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isTracking, setIsTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] =
    useState<LocationSubscription | null>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]);
  // request location permissions
  const requestPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("权限被拒绝，无法获取位置。");
      return false;
    }

    // 对于后台追踪，需要额外请求
    if (Platform.OS === "android") {
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== "granted") {
        setErrorMsg("后台位置权限被拒绝，无法在后台追踪。");
        return false;
      }
    }

    return true;
  };
  const startTracking = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsTracking(true);
    setRoutePoints([]); // 开始新会话时清空路径

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High, // 高精度模式
        timeInterval: 1000, // 每 1 秒更新一次
        distanceInterval: 5, // 每移动 5 米更新一次
      },
      (locationUpdate) => {
        const newPoint = {
          latitude: locationUpdate.coords.latitude,
          longitude: locationUpdate.coords.longitude,
          timestamp: locationUpdate.timestamp,
        };
        setLocation(newPoint);
        setRoutePoints((prevPoints) => [...prevPoints, newPoint]);
      },
    );
    setLocationSubscription(subscription);
  };
  // 3. 停止位置追踪
  const stopTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
    console.log("跑步会话结束，总点数：", routePoints.length);
    // 在这里你可以将 routePoints 保存到本地或发送到服务器
  };
  // 4. 组件卸载时停止追踪
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);
  return { location, errorMsg, startTracking, stopTracking, routePoints };
}
