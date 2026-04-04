import { SettingsSection } from "spcr-settings";

import { nameId } from "../settings.json";

export const settings = new SettingsSection("Websocket integration", nameId);

export const defaultWebsocketAddress = "127.0.0.1";
export const defaultWebsocketPort = "9090";

export async function addSettings() {
    settings.addInput("websocketAddress", "Websocket address", defaultWebsocketAddress);
    settings.addInput("websocketPort", "Websocket port", defaultWebsocketPort);
    settings.addInput("websocketEndpoint", "Websocket endpoint", "/");
    settings.addToggle("startWebsocketOnLaunch", "Start websocket on launch", false);
    await settings.pushSettings();
}