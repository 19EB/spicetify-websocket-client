// Standalone host: makes sure Spotify is running with remote debugging, injects the
// websocket client into the xpui page, and mirrors the page's console to the terminal.
//
//   node host/index.mts [path/to/websocket-client.ini]

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { attach, type CdpSession, type ExceptionDetails, type RemoteObject } from "./cdp.mts";
import { ensureSpotify } from "./spotify.mts";
import { parseIni, getSection, asBoolean, asNumber } from "./ini.mts";

const HOST_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = resolve(HOST_DIR, "..");
const XPUI_PATTERN = /xpui/i;

// Resolved so the host runs both from the repo (host/index.mts, building from src/) and
// from a packaged folder where host.mjs, client.js and the .ini sit side by side.
const ENTRY_POINT = join(PROJECT_DIR, "src", "standalone", "entry.ts");
const BUNDLE_CANDIDATES = [
  join(HOST_DIR, "client.js"),
  join(PROJECT_DIR, "dist-standalone", "client.js"),
];
const CONFIG_CANDIDATES = [
  join(HOST_DIR, "websocket-client.ini"),
  join(PROJECT_DIR, "websocket-client.ini"),
];

const firstExisting = (paths: string[]): string | undefined => paths.find((p) => existsSync(p));

const DEFAULTS = {
  address: "127.0.0.1",
  port: "9090",
  endpoint: "/",
  startOnLaunch: true,
  debugPort: 9223,
  reconnect: true,
  reconnectDelayMs: 1000,
  reconnectMaxDelayMs: 30000,
};

interface ClientSettings {
  websocketAddress: string;
  websocketPort: string;
  websocketEndpoint: string;
  startWebsocketOnLaunch: boolean;
  websocketReconnect: boolean;
  websocketReconnectDelayMs: number;
  websocketReconnectMaxDelayMs: number;
}

const log = (...parts: unknown[]) => console.log("[host]", ...parts);
const warn = (...parts: unknown[]) => console.warn("[host]", ...parts);

const loadConfig = (path: string) => {
  if (!existsSync(path)) {
    warn(`no config at ${path}, using defaults`);
    return {};
  }
  log(`config: ${path}`);
  return parseIni(readFileSync(path, "utf8"));
};

// Prefer building fresh so edits to src/ take effect; fall back to a prebuilt bundle
// when esbuild is not installed.
const loadClientBundle = async (): Promise<string> => {
  if (existsSync(ENTRY_POINT)) {
    try {
      const esbuild = await import("esbuild");
      const result = await esbuild.build({
        entryPoints: [ENTRY_POINT],
        bundle: true,
        format: "iife",
        target: "es2017",
        write: false,
        logLevel: "silent",
      });
      log("built client bundle from src/standalone/entry.ts");
      return result.outputFiles[0].text;
    } catch (error) {
      warn(
        `could not build from source (${error instanceof Error ? error.message : String(error)}), ` +
          "falling back to a prebuilt bundle",
      );
    }
  }

  const prebuilt = firstExisting(BUNDLE_CANDIDATES);
  if (prebuilt) {
    log(`using prebuilt bundle ${prebuilt}`);
    return readFileSync(prebuilt, "utf8");
  }

  throw new Error(
    `No client bundle found. Looked for:\n  ${BUNDLE_CANDIDATES.join("\n  ")}\n` +
      "Run `npm run build-standalone` to create one.",
  );
};

const formatArg = (arg: RemoteObject | undefined): string => {
  if (!arg) return "undefined";
  if ("value" in arg) return typeof arg.value === "string" ? arg.value : JSON.stringify(arg.value);
  if (arg.unserializableValue) return String(arg.unserializableValue);
  if (arg.preview?.properties) {
    const body = arg.preview.properties.map((p) => `${p.name}: ${p.value}`).join(", ");
    return `${arg.className ?? "Object"} { ${body} }`;
  }
  return arg.description ?? arg.className ?? arg.type ?? "?";
};

const mirrorConsole = (session: CdpSession) => {
  session.on("Runtime.consoleAPICalled", ({ type, args }) => {
    const text = ((args ?? []) as RemoteObject[]).map(formatArg).join(" ");
    const stream = type === "error" || type === "warning" ? console.error : console.log;
    stream(`[spotify:${type}]`, text);
  });

  session.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
    const detail = exceptionDetails as ExceptionDetails | undefined;
    console.error("[spotify:exception]", detail?.exception?.description ?? detail?.text ?? "unknown error");
  });
};

const buildInjection = (bundle: string, settings: ClientSettings) =>
  `globalThis.__WS_CLIENT_CONFIG__ = ${JSON.stringify(settings)};\n${bundle}`;

const prepareSession = async (session: CdpSession, injection: string) => {
  await session.ready;
  await session.send("Runtime.enable");
  await session.send("Page.enable");
  mirrorConsole(session);
  // Covers future reloads; the evaluate covers the page as it stands right now.
  await session.send("Page.addScriptToEvaluateOnNewDocument", { source: injection });
  await session.evaluate(injection, { awaitPromise: false });
};

const run = async () => {
  const configPath = resolve(
    process.argv[2] ?? firstExisting(CONFIG_CANDIDATES) ?? join(PROJECT_DIR, "websocket-client.ini"),
  );
  const config = loadConfig(configPath);
  const websocket = getSection(config, "websocket");
  const spotify = getSection(config, "spotify");

  const settings: ClientSettings = {
    websocketAddress: websocket.address ?? DEFAULTS.address,
    websocketPort: String(websocket.port ?? DEFAULTS.port),
    websocketEndpoint: websocket.endpoint ?? DEFAULTS.endpoint,
    startWebsocketOnLaunch: asBoolean(websocket.startOnLaunch, DEFAULTS.startOnLaunch),
    websocketReconnect: asBoolean(websocket.reconnect, DEFAULTS.reconnect),
    websocketReconnectDelayMs: asNumber(websocket.reconnectDelayMs, DEFAULTS.reconnectDelayMs),
    websocketReconnectMaxDelayMs: asNumber(
      websocket.reconnectMaxDelayMs,
      DEFAULTS.reconnectMaxDelayMs,
    ),
  };

  const debugPort = asNumber(spotify.debugPort, DEFAULTS.debugPort);
  log(
    `target ws://${settings.websocketAddress}:${settings.websocketPort}${settings.websocketEndpoint}`,
  );

  const state = await ensureSpotify({
    port: debugPort,
    executable: spotify.executable,
    restartIfNeeded: asBoolean(spotify.restart, true),
  });
  log(`spotify ${state} on debug port ${debugPort}`);

  const bundle = await loadClientBundle();
  const injection = buildInjection(bundle, settings);

  let session = await attach(debugPort, XPUI_PATTERN);
  await prepareSession(session, injection);
  log(`attached to ${session.target.url}`);
  log("client injected");

  // If Spotify navigates or the target dies, reattach and inject again.
  const reattach = async () => {
    log("session lost, reattaching...");
    try {
      session = await attach(debugPort, XPUI_PATTERN);
      await prepareSession(session, injection);
      session.on("__closed", reattach);
      log("reattached and reinjected");
    } catch (error) {
      warn(`reattach failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  session.on("__closed", reattach);

  const shutdown = () => {
    log("shutting down");
    session.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  log("running — press Ctrl+C to stop");
};

run().catch((error) => {
  console.error("[host] fatal:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
