// import {
//   DeviceEventEmitter,
//   NativeEventEmitter,
//   NativeModules,
//   Platform,
// } from "react-native";

// 获取原生模块（如果你的原生代码没有暴露，可以使用 DeviceEventEmitter 模拟）
// 在纯 Expo 环境中，我们通常使用下方的适配器
// const { MyLocationModule } = NativeModules;
//
// export const RunningEventEmitter = Platform.select({
//   ios: new NativeEventEmitter(MyLocationModule),
//   android: DeviceEventEmitter,
//   default: new NativeEventEmitter(MyLocationModule),
// });

export const RUNNING_UPDATE_EVENT = "ON_RUNNING_UPDATE";

// 定位错误事件
export const LOCATION_ERROR_EVENT = "ON_LOCATION_ERROR";

// 定位错误类型
export type LocationErrorType =
  | "permission_denied" // 权限被拒绝
  | "service_disabled" // 定位服务关闭
  | "signal_weak" // 信号弱/无GPS
  | "background_restricted" // 后台限制
  | "unknown"; // 未知错误
