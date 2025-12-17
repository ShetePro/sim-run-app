import { Alert, Linking, Platform } from "react-native";
import * as Location from "expo-location";
import { setStorageItemAsync } from "@/hooks/useStorageState";
import { wgs84togcj02 } from "@/utils/coordtransform";
export async function requestLocationPermission() {
  // 请求前台权限
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return false;
  }

  // 对于后台追踪，需要额外请求
  if (Platform.OS === "android") {
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
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
  let locationData = await Location.getCurrentPositionAsync({
    // 设置精度：建议使用 High 或 Highest 获取更准确的 GPS 结果
    accuracy: Location.Accuracy.High,
    // 允许等待更长时间来获取高精度位置
    mayShowUserSettingsDialog: true,
  });
  setStorageItemAsync("location", JSON.stringify(locationData.coords));
  console.log(locationData.coords, "获取位置权限成功");
  return true;
}
export function mapPointToLonLat<T>(
  coords: (LatLon & T) | null,
): (LatLon & T) | null {
  if (!coords) return coords;
  const lonLat = wgs84togcj02(coords.longitude, coords.latitude) as [
    number,
    number,
  ];
  return {
    ...coords,
    longitude: lonLat[0],
    latitude: lonLat[1],
  };
}
