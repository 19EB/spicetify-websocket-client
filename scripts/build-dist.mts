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
// For archives to attach to a GitHub release, use `npm run release` instead: this
// script keeps any existing websocket-client.ini, which is convenient locally but
// would ship your own settings.
//
// The client bundle lives inside the binary, so it is not shipped separately. A
// client.js placed next to the executable still overrides it, which is useful for
// debugging without a rebuild.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readmeText, startCmd } from "./dist-files.mts";

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

writeFileSync(join(OUT_DIR, "start.cmd"), startCmd);
writeFileSync(join(OUT_DIR, "README.txt"), readmeText);

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
