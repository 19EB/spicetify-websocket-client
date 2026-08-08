// Standalone entry point. Injected into Spotify by the CDP host (see host/), with no
// Spicetify present: settings arrive as a plain object from the host's .ini file, and
// the default notifier writes to the console, which the host mirrors to the terminal.

import { bootstrapPlatform } from "../platform";
import { createStaticSettingsProvider, setSettingsProvider } from "../config/provider";
import { WebsocketClient } from "../websocket/client";

const LOG_PREFIX = "[ws-client]";

async function main() {
    const config = globalThis.__WS_CLIENT_CONFIG__ ?? {};
    setSettingsProvider(createStaticSettingsProvider(config));

    const services = await bootstrapPlatform();
    console.log(`${LOG_PREFIX} platform ready, ${services.length} services resolved`);

    const websocketClient = new WebsocketClient();
    globalThis.__WS_CLIENT_STANDALONE__ = websocketClient;

    // Convenience handle for devtools, but never stomp the Spicetify build's client.
    if (!globalThis.websocketClient) {
        globalThis.websocketClient = websocketClient;
    }

    console.log(`${LOG_PREFIX} standalone client started`);
}

// Re-injecting replaces the previous standalone client rather than stacking a second
// one, so restarting the host picks up new code without reloading Spotify. Keyed on our
// own global: globalThis.websocketClient may belong to the Spicetify build.
const previous = globalThis.__WS_CLIENT_STANDALONE__;
if (previous) {
    console.log(`${LOG_PREFIX} replacing previous standalone client`);
    try {
        previous.disconnect();
    } catch (error) {
        console.warn(`${LOG_PREFIX} failed to stop previous client`, error);
    }
    if (globalThis.websocketClient === previous) {
        globalThis.websocketClient = undefined as unknown as WebsocketClient;
    }
}

main().catch((error) => {
    console.error(`${LOG_PREFIX} failed to start`, error);
});
