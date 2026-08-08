import { SettingsSection } from "spcr-settings";

import { nameId } from "../settings.json";
import {
    defaultReconnect,
    defaultReconnectDelayMs,
    defaultReconnectMaxDelayMs,
    defaultStartOnLaunch,
    defaultWebsocketAddress,
    defaultWebsocketEndpoint,
    defaultWebsocketPort,
    SETTING_KEYS,
} from "./defaults";
import { setSettingsProvider } from "./provider";

export const settings = new SettingsSection("Websocket integration", nameId);

export async function addSettings() {
    settings.addInput(SETTING_KEYS.address, "Address", defaultWebsocketAddress);
    settings.addInput(SETTING_KEYS.port, "Port", defaultWebsocketPort, undefined, 'number');
    settings.addInput(SETTING_KEYS.endpoint, "Endpoint", defaultWebsocketEndpoint);
    settings.addToggle(SETTING_KEYS.startOnLaunch, "Start on launch", defaultStartOnLaunch);
    settings.addToggle(SETTING_KEYS.reconnect, "Reconnect automatically", defaultReconnect);
    settings.addInput(
        SETTING_KEYS.reconnectDelayMs,
        "Reconnect delay (ms)",
        String(defaultReconnectDelayMs),
        undefined,
        'number',
    );
    settings.addInput(
        SETTING_KEYS.reconnectMaxDelayMs,
        "Max reconnect delay (ms)",
        String(defaultReconnectMaxDelayMs),
        undefined,
        'number',
    );
    await settings.pushSettings();

    setSettingsProvider(settings);
}
