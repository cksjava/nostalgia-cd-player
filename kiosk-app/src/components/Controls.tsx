import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackwardStep,
  faForwardStep,
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeLow,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../api";

export function Controls({ paused }: { paused: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <IconBtn onClick={() => api("/api/prev", "POST")} icon={faBackwardStep} />
        <button
          onClick={() => api(paused ? "/api/play" : "/api/pause", "POST")}
          className="h-14 w-14 rounded-full bg-white text-black grid place-items-center text-xl active:scale-95 transition"
        >
          <FontAwesomeIcon icon={paused ? faPlay : faPause} />
        </button>
        <IconBtn onClick={() => api("/api/next", "POST")} icon={faForwardStep} />
      </div>

      <div className="flex items-center gap-2">
        <IconBtn onClick={() => api("/api/volume", "POST", { delta: -5 })} icon={faVolumeLow} />
        <IconBtn onClick={() => api("/api/volume", "POST", { delta: 5 })} icon={faVolumeHigh} />
      </div>
    </div>
  );
}

function IconBtn({ icon, onClick }: { icon: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-11 w-11 rounded-full bg-white/10 hover:bg-white/15 text-white grid place-items-center active:scale-95 transition"
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}
