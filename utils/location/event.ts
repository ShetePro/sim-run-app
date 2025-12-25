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
