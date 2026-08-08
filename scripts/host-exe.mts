// Builds the native host and runs it, for trying the real binary locally.
//
//   npm run host:exe                          uses ./websocket-client.ini
//   npm run host:exe -- path/to/other.ini
//
// `npm run host` runs the Node host instead, which rebuilds the client on each start
// and is the faster loop while working on src/.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "dist-standalone";
const binary = join(
  OUT_DIR,
  process.platform === "win32" ? "spotify-ws-host.exe" : "spotify-ws-host",
);

execFileSync(process.execPath, [join("scripts", "build-go.mts")], { stdio: "inherit" });

if (!existsSync(binary)) {
  throw new Error(`build did not produce ${binary}`);
}

// Default to the repo-root config so this matches `npm run host`. Without it the binary
// would prefer dist-standalone/websocket-client.ini, which is the packaging copy.
const args = process.argv.slice(2);
if (args.length === 0) {
  if (!existsSync("websocket-client.ini")) {
    throw new Error(
      "No websocket-client.ini in the project root. Copy websocket-client.example.ini " +
        "to websocket-client.ini, or pass a path as an argument.",
    );
  }
  args.push("websocket-client.ini");
}

console.log(`\nrunning ${binary} ${args.join(" ")}\n`);
const result = spawnSync(binary, args, { stdio: "inherit" });
process.exit(result.status ?? 1);
