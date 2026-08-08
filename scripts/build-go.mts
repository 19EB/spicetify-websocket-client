// Builds the native Go host, with the client bundle embedded in the binary.
//
//   npm run build-go            current platform
//   npm run build-go -- --all   windows, linux and macOS
//
// Requires Go on PATH (or installed in the default location).

import * as esbuild from "esbuild";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "dist-standalone";
const GO_DIR = "gohost";

const findGo = (): string => {
  const candidates = [
    process.env.GOEXE,
    "go",
    "C:\\Program Files\\Go\\bin\\go.exe",
    `${process.env.LOCALAPPDATA ?? ""}\\Programs\\Go\\bin\\go.exe`,
    "/usr/local/go/bin/go",
    "/usr/bin/go",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ["version"], { stdio: "pipe" });
      return candidate;
    } catch {
      // try the next one
    }
  }
  throw new Error("Go not found. Install it from https://go.dev/dl/ or set GOEXE.");
};

const targets = process.argv.includes("--all")
  ? [
      { goos: "windows", goarch: "amd64", out: "spotify-ws-host.exe" },
      { goos: "linux", goarch: "amd64", out: "spotify-ws-host-linux" },
      { goos: "darwin", goarch: "arm64", out: "spotify-ws-host-macos" },
    ]
  : [{ goos: "", goarch: "", out: process.platform === "win32" ? "spotify-ws-host.exe" : "spotify-ws-host" }];

mkdirSync(OUT_DIR, { recursive: true });

// The binary embeds this, so it must be built before `go build` runs. It goes straight
// into the Go module: shipping a loose client.js next to the binary would override the
// embedded copy and confuse things.
await esbuild.build({
  entryPoints: ["src/standalone/entry.ts"],
  bundle: true,
  format: "iife",
  target: "es2017",
  outfile: join(GO_DIR, "client.js"),
  minify: true,
  logLevel: "info",
});

const go = findGo();
console.log(`\nusing ${go}`);

for (const target of targets) {
  const env = { ...process.env };
  if (target.goos) env.GOOS = target.goos;
  if (target.goarch) env.GOARCH = target.goarch;

  const outfile = join("..", OUT_DIR, target.out);
  execFileSync(go, ["build", "-trimpath", "-ldflags=-s -w", "-o", outfile, "."], {
    cwd: GO_DIR,
    env,
    stdio: "inherit",
  });

  const built = join(OUT_DIR, target.out);
  if (existsSync(built)) {
    const size = (statSync(built).size / 1024 / 1024).toFixed(1);
    console.log(`  ${target.out}  ${size} MB${target.goos ? `  (${target.goos}/${target.goarch})` : ""}`);
  }
}

console.log("\nnative host built");
