import { Controls } from "./Controls";
import { SeekBar } from "./SeekBar";

export function NowPlaying({
  status,
  onSeek
}: {
  status: any;
  onSeek: (v: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">
        Track {status.track + 1}
      </div>

      <SeekBar
        time={status.time}
        duration={status.duration}
        onSeek={onSeek}
      />

      <Controls paused={status.paused} />
    </div>
  );
}
