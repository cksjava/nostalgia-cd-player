import net from "net";

const SOCKET_PATH = "/tmp/mpv-cd.sock";

export function mpvCommand(command) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(SOCKET_PATH, () => {
      client.write(JSON.stringify(command) + "\n");
    });

    client.on("data", data => {
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
