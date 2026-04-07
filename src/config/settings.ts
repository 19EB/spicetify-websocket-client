import { SettingsSection } from "spcr-settings";

import { nameId } from "../settings.json";

export const settings = new SettingsSection("Websocket integration", nameId);

export const defaultWebsocketAddress = "127.0.0.1";
export const defaultWebsocketPort = "9090";

export async function addSettings() {
    settings.addInput("websocketAddress", "Address", defaultWebsocketAddress);
    settings.addInput("websocketPort", "Port", defaultWebsocketPort, undefined, 'number');
    settings.addInput("websocketEndpoint", "Endpoint", "/");
    settings.addToggle("startWebsocketOnLaunch", "Start on launch", false);
    await settings.pushSettings();
}