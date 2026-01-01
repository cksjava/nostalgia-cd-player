import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import type { Track } from "../types";
import { api } from "../api";

export function TrackList({
  tracks,
  current,
  onPicked,
}: {
  tracks: Track[];
  current: number;
  onPicked?: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-zinc-200">Tracks</div>
      <div className="max-h-[70vh] overflow-auto space-y-1 pr-1">
        {tracks.map((t) => {
          const active = t.index === current;
          return (
            <button
              key={t.index}
              onClick={async () => {
                await api("/api/track/play", "POST", { index: t.index });
                onPicked?.();
              }}
              className={[
                "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                active ? "bg-white/15" : "bg-white/5 hover:bg-white/10",
              ].join(" ")}
            >
              <div className="w-6 text-zinc-300">
                {active ? <FontAwesomeIcon icon={faPlay} /> : <span>{t.index + 1}</span>}
              </div>
              <div className="flex-1 truncate text-zinc-100">{t.title}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
