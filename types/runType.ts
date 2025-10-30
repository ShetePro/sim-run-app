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
};
