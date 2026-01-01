import { execFile } from "child_process";

const FRAMES_PER_SECOND = 75;

export function readCdToc(device = "/dev/sr0") {
  return new Promise((resolve) => {
    execFile("cd-discid", [device], (err, stdout) => {
      if (err) {
        // no disc, no drive, permission issue, etc.
        resolve({ ok: false, tracks: [], error: err.message });
        return;
      }

      const line = String(stdout || "").trim();
      // Format: <ntracks> <offset1> <offset2> ... <offsetN> <leadout>
      const parts = line.split(/\s+/).map((x) => Number(x));
      const n = parts[0];

      if (!Number.isFinite(n) || n <= 0 || parts.length < n + 2) {
        resolve({ ok: false, tracks: [], error: "Unexpected cd-discid output" });
        return;
      }

      const offsets = parts.slice(1, 1 + n);
      const leadout = parts[1 + n];

      const tracks = offsets.map((startFrame, i) => {
        const nextFrame = i === offsets.length - 1 ? leadout : offsets[i + 1];
        const durationSec = Math.max(0, Math.round((nextFrame - startFrame) / FRAMES_PER_SECOND));
        return {
          index: i, // 0-based for your UI/backend
          title: `Track ${i + 1}`,
          duration: durationSec,
        };
      });

      resolve({ ok: true, tracks });
    });
  });
}
