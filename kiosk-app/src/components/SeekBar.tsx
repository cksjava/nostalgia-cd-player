import { useEffect, useState } from "react";

export function SeekBar({
  time,
  duration,
  onSeekCommit,
}: {
  time: number | null;
  duration: number | null;
  onSeekCommit: (seconds: number) => void;
}) {
  const max = Math.max(0, Math.floor(duration ?? 0));
  const live = Math.max(0, Math.floor(time ?? 0));

  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useState(live);

  useEffect(() => {
    if (!dragging) setValue(live);
  }, [live, dragging]);

  return (
    <div className="space-y-1">
      <input
        type="range"
        min={0}
        max={max}
        value={Math.min(value, max)}
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => {
          setDragging(false);
          onSeekCommit(value);
        }}
        onTouchStart={() => setDragging(true)}
        onTouchEnd={() => {
          setDragging(false);
          onSeekCommit(value);
        }}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-white"
      />
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{fmt(live)}</span>
        <span>{fmt(max)}</span>
      </div>
    </div>
  );
}

function fmt(s: number) {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}
