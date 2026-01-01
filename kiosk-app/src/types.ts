export type Track = { index: number; title: string; duration: number };

export type Status = {
  // disc-level (optional)
  timePos: number | null;
  duration: number | null;

  // track-level (use these for UI)
  track: number;
  trackCount: number | null;
  trackTime: number | null;
  trackDuration: number | null;

  paused: boolean | null;
};
