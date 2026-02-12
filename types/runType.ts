export type TrackPoint = {
  lat: number;
  lng: number;
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
  steps?: number; // 步数（可选，用于演示数据）
};

export type TodayRunData = {
  distance: number;
  duration: number;
  pace: number;
  calories: number;
  steps: number;
};
