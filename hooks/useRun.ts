import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";
import { LocationSubscription } from "expo-location";
import { haversineDistance } from "@/utils/util";

export function useRun() {
  const [location, setLocation] = useState<any>(null);
  const [distance, setDistance] = useState<number>(1);
  const [heading, setHeading] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isTracking, setIsTracking] = useState(false);
  let calcIndex = 0;
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
    setDistance((prev) => prev + distance);
  }, [routePoints]);

  // 手动模拟跑步
  const simulateRun = () => {
    const point = routePoints.at(-1);
    let lat = point?.latitude || location.latitude;
    let lon = point?.longitude || location.longitude;
    let index = 0;
    const interval = setInterval(() => {
      console.log(lat);
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
    // 请求前台权限
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
        Alert.alert(
          "需要背景位置权限",
          "为了应用的功能正常运行，请手动在设置中授予‘始终允许’位置权限。",
          [
            {
              text: "取消",
              style: "cancel",
            },
            {
              text: "前往设置",
              onPress: () => {
                // 3. 跳转到应用的系统设置页面
                if (Platform.OS === "ios" || Platform.OS === "android") {
                  // React Native 的 Linking 模块提供了一个 openSettings() 方法
                  // 它可以直接打开应用的设置页面，兼容 iOS 和 Android。
                  Linking.openSettings();
                } else {
                  // 其他平台（如 Web 或桌面端）的处理
                  console.log("无法跳转到设置");
                }
              },
            },
          ],
        );
        return false;
      }
    }
    try {
      // 2. 获取当前位置
      let locationData = await Location.getCurrentPositionAsync({
        // 设置精度：建议使用 High 或 Highest 获取更准确的 GPS 结果
        accuracy: Location.Accuracy.High,
        // 允许等待更长时间来获取高精度位置
        mayShowUserSettingsDialog: false,
      });
      // save heading direction
      // if (locationData.coords.heading) {
      //   setHeading(locationData.coords.heading);
      // }
      setLocation({ ...locationData.coords });
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
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsTracking(true);
    setRoutePoints([]); // 开始新会话时清空路径
    simulateRun();

    // const subscription = await Location.watchPositionAsync(
    //   {
    //     accuracy: Location.Accuracy.High, // 高精度模式
    //     timeInterval: 1000, // 每 1 秒更新一次
    //     distanceInterval: 5, // 每移动 5 米更新一次
    //   },
    //   (locationUpdate) => {
    //     const newPoint = {
    //       latitude: locationUpdate.coords.latitude,
    //       longitude: locationUpdate.coords.longitude,
    //       timestamp: locationUpdate.timestamp,
    //     };
    //     setLocation(newPoint);
    //     setRoutePoints((prevPoints) => [...prevPoints, newPoint]);
    //   },
    // );
    // setLocationSubscription(subscription);
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
