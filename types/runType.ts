export type TrackPoint = {
  lat: number;
  lng: number;
  altitude?: number; // 海拔高度（米）
  heading: number;
  timestamp: number;
};

export type RunRecord = {
  id?: number;
  distance: number;
  time: number;
  pace: number;
  energy: number;
  isFinish: 0 | 1;
  points?: TrackPoint[];
  startTime?: number;
  endTime?: number;
  title?: string;
  note?: string;
};

export type TodayRunData = {
  distance: number;
  duration: number;
  pace: number;
  calories: number;
  steps: number;
};
