import { create } from "zustand";

interface RunState {
  distance: number;
  currentLocation: LatLon | null;
  accuracy: number;
  stepCount: number;
  setAccuracy: (accuracy: number) => void;
  setStepCount: (steps: number) => void;
  setLocation: (location: LatLon) => void;
}

export const useRunStore = create<RunState>((set) => ({
  distance: 0,
  currentLocation: null,
  accuracy: 0,
  stepCount: 0,
  setAccuracy: (accuracy: number) =>
    set(() => ({
      accuracy: accuracy,
    })),
  setStepCount: (steps: number) =>
    set(() => ({
      stepCount: steps,
    })),
  setLocation: (location: LatLon) =>
    set(() => ({
      currentLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
    })),
}));
