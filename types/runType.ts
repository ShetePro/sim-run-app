export type TrackPoint = {
  latitude: number;
  longitude: number;
  altitude?: number; // 海拔高度（米）
  heading: number;
  timestamp: number;
  steps?: number; // 累计步数（用于后续分析）
};

export type RunRecord = {
  id?: number;
  distance: number;
  time: number;
  pace: number;
  energy: number;
  steps: number;
  elevationGain: number; // 累计爬升（米）
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
