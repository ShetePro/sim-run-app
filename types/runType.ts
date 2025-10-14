export type TrackPoint = {
  lat: number;
  lng: number;
  heading: number;
  timestamp: number;
};

export type RunRecord = {
  id?: number;
  date: number;
  distance: number;
  time: number;
  pace: number;
  energy: number;
  points?: TrackPoint[];
  isFinish: 0 | 1;
};
