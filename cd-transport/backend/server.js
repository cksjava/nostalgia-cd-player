import express from "express";
import { spawn } from "child_process";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { readCdToc } from "./cdToc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MPV_BIN = "/usr/bin/mpv";
const MPV_SOCKET = "/tmp/mpv-cd.sock";
const CDDA_DEVICE = process.env.CDDA_DEVICE || "/dev/sr0";

let mpvProcess = null;

function mpvCommand(command) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(MPV_SOCKET, () => {
      client.write(JSON.stringify(command) + "\n");
    });

    client.on("data", (data) => {
      try {
        resolve(JSON.parse(data.toString()));
      } catch {
        resolve(null);
      }
      client.end();
    });

    client.on("error", reject);
  });
}

function startMpv() {
  if (mpvProcess) return;

  mpvProcess = spawn(MPV_BIN, [
    "--no-video",
    "--idle=yes",
    `--input-ipc-server=${MPV_SOCKET}`,
  ]);

  mpvProcess.stdout.on("data", (d) =>
    console.log("[mpv]", d.toString().trim())
  );
  mpvProcess.stderr.on("data", (d) =>
    console.error("[mpv]", d.toString().trim())
  );

  mpvProcess.on("exit", () => {
    mpvProcess = null;
  });
}

startMpv();

const app = express();
app.use(express.json());

// Disable ETag globally (prevents 304 for JSON responses)
app.set("etag", false);

// Ensure API is never cached by browsers/proxies
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

/** Load CD (chapters become tracks) */
app.post("/api/cd/load", async (_, res) => {
  try {
    // loadfile supports per-file options as 4th arg (map), values must be strings
    await mpvCommand({
      command: ["loadfile", "cdda://", "replace", -1, { "cdda-device": CDDA_DEVICE }],
    });
    // auto-play
    await mpvCommand({ command: ["set_property", "pause", false] });
    res.json({ ok: true, device: CDDA_DEVICE });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Failed to load CD" });
  }
});

app.post("/api/cd/stop", async (_, res) => {
  await mpvCommand({ command: ["stop"] });
  res.json({ ok: true });
});

app.post("/api/play", async (_, res) => {
  await mpvCommand({ command: ["set_property", "pause", false] });
  res.json({ ok: true });
});

app.post("/api/pause", async (_, res) => {
  await mpvCommand({ command: ["set_property", "pause", true] });
  res.json({ ok: true });
});

/** Track navigation for CDDA: use chapters */
app.post("/api/next", async (_, res) => {
  await mpvCommand({ command: ["add", "chapter", 1] });
  res.json({ ok: true });
});

app.post("/api/prev", async (_, res) => {
  await mpvCommand({ command: ["add", "chapter", -1] });
  res.json({ ok: true });
});

/** Absolute seek (seconds from start of disc/track timeline) */
app.post("/api/seek", async (req, res) => {
  const secondsInTrack = Number(req.body?.seconds);
  if (!Number.isFinite(secondsInTrack)) return res.status(400).json({ ok: false });

  const chapterR = await mpvCommand({ command: ["get_property", "chapter"] });
  const chapterListR = await mpvCommand({ command: ["get_property", "chapter-list"] });

  const chapter = Number.isFinite(chapterR?.data) ? chapterR.data : 0;
  const chapterList = Array.isArray(chapterListR?.data) ? chapterListR.data : [];

  const start = typeof chapterList?.[chapter]?.time === "number" ? chapterList[chapter].time : 0;

  await mpvCommand({ command: ["set_property", "time-pos", start + secondsInTrack] });
  res.json({ ok: true });
});

app.post("/api/volume", async (req, res) => {
  const delta = Number(req.body?.delta);
  if (!Number.isFinite(delta)) return res.status(400).json({ ok: false });
  await mpvCommand({ command: ["add", "volume", delta] });
  res.json({ ok: true });
});

/** Tracks list from chapter-list (CD tracks) */
app.get("/api/tracks", async (_, res) => {
  const toc = await readCdToc(CDDA_DEVICE);
  res.json(toc.tracks);
});

/** Play a specific track by chapter index */
app.post("/api/track/play", async (req, res) => {
  const index = Number(req.body?.index);
  if (!Number.isFinite(index)) return res.status(400).json({ ok: false });
  // chapter is 0-based
  await mpvCommand({ command: ["set_property", "chapter", index] });
  await mpvCommand({ command: ["set_property", "pause", false] });
  res.json({ ok: true });
});

app.get("/api/status", async (_, res) => {
  const timePosR = await mpvCommand({ command: ["get_property", "time-pos"] });
  const durationR = await mpvCommand({ command: ["get_property", "duration"] });
  const pausedR = await mpvCommand({ command: ["get_property", "pause"] });
  const chapterR = await mpvCommand({ command: ["get_property", "chapter"] });

  const toc = await readCdToc(CDDA_DEVICE);

  res.json({
    timePos: typeof timePosR?.data === "number" ? timePosR.data : null,
    duration: typeof durationR?.data === "number" ? durationR.data : null,
    paused: pausedR?.data ?? null,
    track: Number.isFinite(chapterR?.data) ? chapterR.data : 0,
    trackCount: toc.ok ? toc.tracks.length : null,
  });
});

/** Static frontend hosting (Vite build copied to ../frontend) */
const frontendDir = path.join(__dirname, "../frontend");
app.use(express.static(frontendDir));
app.get("*", (_, res) => res.sendFile(path.join(frontendDir, "index.html")));

app.listen(3000, "127.0.0.1", () => {
  console.log("Backend listening on 127.0.0.1:3000");
});
