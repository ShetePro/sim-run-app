export type LiveActivityParams = {
  distance: number;
  duration: string;
  pace: string;
};

export type StartLiveActivityFn = () => Promise<void>;

export type UpdateLiveActivityFn = (params: LiveActivityParams) => Promise<void>;

export type StopLiveActivityFn = () => Promise<void>;
