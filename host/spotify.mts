// Locating, launching and (re)starting the Spotify desktop client with remote
// debugging enabled.
//
// Spotify enforces a single instance: if a copy is already running, launching again
// with --remote-debugging-port silently hands off to the existing process and the flag
// is ignored. So enabling the port on a running client means killing it first.

import { spawn, execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { isDebuggerUp } from "./cdp.mts";

const execFileAsync = promisify(execFile);

const START_POLL_MS = 500;
const DEFAULT_START_TIMEOUT_MS = 60_000;

export type EnsureResult = "already-listening" | "launched" | "restarted";

export interface EnsureSpotifyOptions {
  port: number;
  executable?: string;
  restartIfNeeded?: boolean;
  timeoutMs?: number;
  extraArgs?: string[];
}

export const findSpotifyExecutable = (): string | null => {
  const candidates =
    process.platform === "win32"
      ? [
          join(process.env.APPDATA ?? "", "Spotify", "Spotify.exe"),
          join(process.env.LOCALAPPDATA ?? "", "Microsoft", "WindowsApps", "Spotify.exe"),
          join(process.env.PROGRAMFILES ?? "", "Spotify", "Spotify.exe"),
        ]
      : process.platform === "darwin"
        ? ["/Applications/Spotify.app/Contents/MacOS/Spotify"]
        : ["/usr/bin/spotify", "/usr/share/spotify/spotify", "/snap/bin/spotify"];

  return candidates.find((candidate) => candidate && existsSync(candidate)) ?? null;
};

export const isSpotifyRunning = async (): Promise<boolean> => {
  try {
    if (process.platform === "win32") {
      const { stdout } = await execFileAsync("tasklist", ["/FI", "IMAGENAME eq Spotify.exe"]);
      return /Spotify\.exe/i.test(stdout);
    }
    const { stdout } = await execFileAsync("pgrep", ["-x", "Spotify"]);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
};

export const killSpotify = async (): Promise<void> => {
  try {
    if (process.platform === "win32") {
      await execFileAsync("taskkill", ["/F", "/IM", "Spotify.exe"]);
    } else {
      await execFileAsync("pkill", ["-x", "Spotify"]);
    }
  } catch {
    // not running, which is the state we wanted anyway
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));
};

export const launchSpotify = (executable: string, port: number, extraArgs: string[] = []): void => {
  const child = spawn(executable, [`--remote-debugging-port=${port}`, ...extraArgs], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
};

// Guarantees a Spotify client reachable on `port`, restarting it if the debug port is
// closed. Returns how that was achieved, for logging.
export const ensureSpotify = async ({
  port,
  executable,
  restartIfNeeded = true,
  timeoutMs = DEFAULT_START_TIMEOUT_MS,
  extraArgs = [],
}: EnsureSpotifyOptions): Promise<EnsureResult> => {
  if (await isDebuggerUp(port)) return "already-listening";

  const exe = executable ?? findSpotifyExecutable();
  if (!exe) {
    throw new Error(
      "Could not find Spotify.exe. Set [spotify] executable=<path> in the config file.",
    );
  }
  if (!existsSync(exe)) {
    throw new Error(`Configured Spotify executable does not exist: ${exe}`);
  }

  const running = await isSpotifyRunning();
  if (running && !restartIfNeeded) {
    throw new Error(
      `Spotify is running without remote debugging on port ${port}. ` +
        "Close it, or set [spotify] restart=true to let the host restart it.",
    );
  }

  if (running) await killSpotify();
  launchSpotify(exe, port, extraArgs);

  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await isDebuggerUp(port)) return running ? "restarted" : "launched";
    if (Date.now() >= deadline) {
      throw new Error(`Spotify did not open the debug port ${port} within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, START_POLL_MS));
  }
};
