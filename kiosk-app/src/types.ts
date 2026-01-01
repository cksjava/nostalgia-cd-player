export type Track = { index: number; title: string; start: number | null };

export type Status = {
  time: number | null;
  duration: number | null;
  paused: boolean | null;
  track: number;
  trackCount: number | null;
};
