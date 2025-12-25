import { Pedometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { useRunStore } from "@/store/runStore";
export function usePedometer() {
  const setCurrentStepCount = useRunStore().setStepCount;
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
  let subscription: Pedometer.Subscription | null = null;
  useEffect(() => {
    getPermission();
    return () => subscription?.remove();
  }, []);
  const getPermission = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    const { status } = await Pedometer.getPermissionsAsync();
    console.log(isAvailable, status, "计步器权限状态");
  };
  const startPedometer = () => {
    subscription = Pedometer.watchStepCount((result) => {
      setCurrentStepCount(result.steps);
    });
  };
  const stopPedometer = () => {
    subscription?.remove();
    setCurrentStepCount(0);
  };
  return {
    isPedometerAvailable,
    startPedometer,
    stopPedometer,
    getPermission,
  };
}
