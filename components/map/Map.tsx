import MapView from "react-native-maps";
import { StyleProp, ViewStyle } from "react-native";
import * as Location from "expo-location";

async function requestPermissions() {
  // 前台定位权限
  let { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== "granted") {
    console.log("前台定位权限被拒绝");
    return;
  }

  // 如果你需要后台定位
  let { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== "granted") {
    console.log("后台定位权限被拒绝");
    return;
  }

  console.log("定位权限全部授予");
}
function Map({
  style,
  className,
}: {
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  requestPermissions();
  return (
    <MapView
      className={className}
      style={style}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    ></MapView>
  );
}

export default Map;
