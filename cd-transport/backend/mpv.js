import net from "net";

const SOCKET_PATH = "/tmp/mpv-cd.sock";

let REQ_ID = 0;

function mpvCommand(command) {
  return new Promise((resolve, reject) => {
    const request_id = ++REQ_ID;
    const payload = JSON.stringify({ ...command, request_id }) + "\n";

    const client = net.createConnection(SOCKET_PATH, () => client.write(payload));

    let buf = "";
    client.on("data", (chunk) => {
      buf += chunk.toString();
      let idx;
      while ((idx = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);

        if (!line) continue;

        try {
          const msg = JSON.parse(line);
          if (msg.request_id === request_id) {
            client.end();
            resolve(msg);
            return;
          }
        } catch {
          // ignore partial/garbage lines
        }
      }
    });

    client.on("error", reject);
  });
}
