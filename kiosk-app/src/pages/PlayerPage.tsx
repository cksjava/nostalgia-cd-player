import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompactDisc, faList } from "@fortawesome/free-solid-svg-icons";
import { api } from "../api";
import type { Status, Track } from "../types";
import { Controls } from "../components/Controls";
import { SeekBar } from "../components/SeekBar";
import { TrackList } from "../components/TrackList";

export function PlayerPage() {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [showTracksMobile, setShowTracksMobile] = useState(false);

  useEffect(() => {
    if (!started) return;

    (async () => {
      try {
        await api<{ ok: boolean }>("/api/cd/load", "POST");
      } catch {
        // if no disc, we’ll add UX later; app still loads
      }

      try {
        const t = await api<Track[]>("/api/tracks");
        setTracks(t);
      } catch {
        setTracks([]);
      }
    })();

    const i = setInterval(async () => {
      try {
        const s = await api<Status>("/api/status");
        setStatus(s);
      } catch { }
    }, 800);

    return () => clearInterval(i);
  }, [started]);

  if (!started) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-950">
        <button
          onClick={() => setStarted(true)}
          className="h-32 w-32 rounded-full bg-white/10 hover:bg-white/15 text-white grid place-items-center transition active:scale-95"
        >
          <FontAwesomeIcon icon={faCompactDisc} className="text-6xl" />
        </button>
      </div>
    );
  }

  const current = status?.track ?? 0;
  const paused = !!status?.paused;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">
      <div className="mx-auto max-w-5xl grid gap-4 md:grid-cols-3">
        {/* Now playing */}
        <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-4 md:p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-zinc-400">Now Playing</div>
              <div className="text-2xl font-semibold">Track {current + 1}</div>
              <div className="text-sm text-zinc-400">
                {status?.trackCount ? `${status.trackCount} tracks` : "—"}
              </div>
            </div>

            {/* Mobile: open track list */}
            <button
              onClick={() => setShowTracksMobile(true)}
              className="md:hidden h-11 w-11 rounded-full bg-white/10 hover:bg-white/15 grid place-items-center"
              aria-label="Show tracks"
            >
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>

          <SeekBar
            time={status?.trackTime ?? 0}
            duration={status?.trackDuration ?? 0}
            onSeekCommit={(seconds) => api("/api/seek", "POST", { seconds })}
          />

          <Controls paused={paused} />
        </div>

        {/* Desktop track list */}
        <div className="hidden md:block rounded-2xl bg-white/5 border border-white/10 p-4 md:p-5">
          <TrackList tracks={tracks} current={current} />
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {showTracksMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setShowTracksMobile(false)}
        >
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-3xl bg-zinc-950 border-t border-white/10 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-10 bg-white/20 rounded-full mx-auto mb-4" />
            <TrackList
              tracks={tracks}
              current={current}
              onPicked={() => setShowTracksMobile(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
