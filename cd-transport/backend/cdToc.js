import { execFile } from "child_process";

const FRAMES_PER_SECOND = 75;

export function readCdToc(device = "/dev/sr0") {
  return new Promise((resolve) => {
    execFile("cd-discid", [device], (err, stdout, stderr) => {
      if (err) {
        resolve({ ok: false, tracks: [], error: err.message, stderr: String(stderr || "") });
        return;
      }

      const line = String(stdout || "").trim();

      // Extract all numeric tokens (ignore any disc-id strings etc.)
      const nums = line
        .split(/\s+/)
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n));

      // Find the first plausible track-count:
      // track counts are small (1..99); offsets/leadout are large frame numbers.
      const nIndex = nums.findIndex((v) => Number.isInteger(v) && v >= 1 && v <= 99);

      if (nIndex === -1) {
        resolve({ ok: false, tracks: [], error: `Unexpected cd-discid output (no track count): ${line}` });
        return;
      }

      const n = nums[nIndex];

      // After track count, expect n offsets + 1 leadout
      const need = n + 1;
      const rest = nums.slice(nIndex + 1);

      if (rest.length < need) {
        resolve({
          ok: false,
          tracks: [],
          error: `Unexpected cd-discid output (need ${need} numbers after track count, got ${rest.length}): ${line}`,
        });
        return;
      }

      const offsets = rest.slice(0, n);
      const leadout = rest[n];

      const tracks = offsets.map((startFrame, i) => {
        const nextFrame = i === offsets.length - 1 ? leadout : offsets[i + 1];
        const durationSec = Math.max(
          0,
          Math.round((nextFrame - startFrame) / FRAMES_PER_SECOND)
        );

        return {
          index: i,
          title: `Track ${i + 1}`,
          duration: durationSec,
        };
      });

      resolve({ ok: true, tracks });
    });
  });
}
