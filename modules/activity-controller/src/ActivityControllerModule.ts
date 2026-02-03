import { requireNativeModule } from "expo";
import type {
  StartLiveActivityFn,
  UpdateLiveActivityFn,
  StopLiveActivityFn,
} from "./ActivityController.types";

const nativeModule = requireNativeModule("ActivityController");

export const startLiveActivity: StartLiveActivityFn = async () => {
  return nativeModule.startLiveActivity();
};

export const updateLiveActivity: UpdateLiveActivityFn = async (params) => {
  const { distance, duration, pace } = params;
  if (typeof nativeModule.updateLiveActivity === "function") {
    return nativeModule.updateLiveActivity(distance, duration, pace);
  }
  return Promise.resolve();
};

export const stopLiveActivity: StopLiveActivityFn = async () => {
  return nativeModule.stopLiveActivity();
};

// export const isLiveActivityRunning: IsLiveActivityRunningFn = () => {
//   return nativeModule.isLiveActivityRunning();
// };

export const areLiveActivitiesEnabled: boolean =
  nativeModule.areLiveActivitiesEnabled;
