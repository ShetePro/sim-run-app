import { create } from "zustand";

interface RunState {
  distance: number;
  currentLocation: LatLon | null;
  accuracy: number;
  stepCount: number;
  duration: number;
  pace: number;
  setDuration: (time: number) => void;
  setPace: (pace: number) => void;
  setAccuracy: (accuracy: number) => void;
  setStepCount: (steps: number) => void;
  setLocation: (location: LatLon) => void;
  reset: () => void;
}

export const useRunStore = create<RunState>((set) => ({
  distance: 0,
  currentLocation: null,
  accuracy: 0,
  duration: 0,
  pace: 0,
  stepCount: 0,
  setDistance: (distance: number) =>
    set(() => ({
      distance: distance,
    })),
  setDuration: (time: number) =>
    set(() => ({
      duration: time,
    })),
  setPace: (pace: number) =>
    set(() => ({
      pace: pace,
    })),
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
  reset: () =>
    set(() => ({
      distance: 0,
      currentLocation: null,
      accuracy: 0,
      stepCount: 0,
      duration: 0,
      pace: 0,
    })),
}));
