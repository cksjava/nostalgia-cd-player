import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompactDisc } from "@fortawesome/free-solid-svg-icons";

export function CdButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-32 h-32 rounded-full
                 bg-zinc-800 text-white text-5xl hover:bg-zinc-700 transition"
    >
      <FontAwesomeIcon icon={faCompactDisc} />
    </button>
  );
}
