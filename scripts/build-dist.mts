// Packages the standalone client for distribution.
//
//   npm run package            windows binary
//   npm run package -- --all   windows, linux and macOS binaries
//
// Output (dist-standalone/):
//   spotify-ws-host.exe   self-contained host with the client embedded
//   websocket-client.ini  config, copied from the example if not already present
//   start.cmd             launcher that keeps the window open on failure
//   README.txt
//
// The client bundle lives inside the binary, so it is not shipped separately. A
// client.js placed next to the executable still overrides it, which is useful for
// debugging without a rebuild.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "dist-standalone";
const buildAll = process.argv.includes("--all");

mkdirSync(OUT_DIR, { recursive: true });

// Builds client.js and compiles the Go binaries that embed it.
execFileSync(
  process.execPath,
  [join("scripts", "build-go.mts"), ...(buildAll ? ["--all"] : [])],
  { stdio: "inherit" },
);

const configTarget = join(OUT_DIR, "websocket-client.ini");
if (!existsSync(configTarget)) {
  copyFileSync("websocket-client.example.ini", configTarget);
  console.log(`\n  wrote ${configTarget}`);
} else {
  console.log(`\n  kept existing ${configTarget}`);
}

writeFileSync(
  join(OUT_DIR, "start.cmd"),
  ["@echo off", 'cd /d "%~dp0"', "spotify-ws-host.exe", "if errorlevel 1 pause", ""].join("\r\n"),
);

writeFileSync(
  join(OUT_DIR, "README.txt"),
  `Spotify Websocket Client - standalone
=====================================

Controls Spotify and streams player events over a websocket. Works with any websocket
server. Does not use Spicetify and does not modify any Spotify files.


REQUIREMENTS
------------
Spotify desktop, installed from spotify.com. The Microsoft Store build is sandboxed
and will not accept the required launch flag.

Nothing else - the host is a single self-contained executable.


SETUP
-----
1. Open websocket-client.ini and set address / port / endpoint to match the websocket
   server you want Spotify to connect to.
2. Run start.cmd  (or spotify-ws-host.exe directly).


WHAT HAPPENS ON FIRST RUN
-------------------------
Spotify only accepts the remote-debugging flag at launch, and it enforces a single
instance. So if Spotify is already running, the host CLOSES AND REOPENS IT. Your
playback will stop for a few seconds. Set  restart = false  in the [spotify] section
if you would rather it refuse than restart Spotify for you.

Once connected you will see Spotify's log lines in the terminal window. Leave the
window open: it re-injects the client whenever Spotify reloads. Closing it leaves the
client running until Spotify next reloads.


NOTES
-----
- The client reconnects on its own if the websocket server restarts, backing off up to
  30 seconds between attempts. It keeps retrying indefinitely.
- While running, Spotify listens on a local debug port (127.0.0.1:9223 by default). It
  is not reachable from other machines, but any program on this computer could use it
  to control Spotify. Change it with debugPort, and close the window when you are done
  if that matters to you.
- Nothing about your Spotify installation is modified. Stop the host and everything is
  back to normal on the next Spotify restart.
- Advanced: dropping a client.js next to the executable overrides the embedded client.


TROUBLESHOOTING
---------------
"could not find Spotify"
    Set  executable = <full path to Spotify.exe>  in the [spotify] section.

"Spotify did not open the debug port"
    Usually the Microsoft Store build. Reinstall Spotify from spotify.com.

"no page target matching xpui appeared"
    Spotify was still starting up. Run it again.

Connects but your app sees nothing
    Check the endpoint in the .ini matches your server's path exactly.
`,
);

console.log("\npackaged:");
for (const name of [
  "spotify-ws-host.exe",
  "spotify-ws-host-linux",
  "spotify-ws-host-macos",
  "websocket-client.ini",
  "start.cmd",
  "README.txt",
]) {
  const path = join(OUT_DIR, name);
  if (!existsSync(path)) continue;
  const size = statSync(path).size;
  const shown = size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${size} B`;
  console.log(`  ${name.padEnd(24)} ${shown}`);
}
console.log(`\n${OUT_DIR}/ is ready to zip - no runtime required`);
