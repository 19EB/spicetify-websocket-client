// Config keys and defaults, kept free of any Spicetify import so the standalone
// bundle can use them too.

export const defaultWebsocketAddress = "127.0.0.1";
export const defaultWebsocketPort = "9090";
export const defaultWebsocketEndpoint = "/";
export const defaultStartOnLaunch = false;

export const defaultReconnect = true;
// First retry waits this long, doubling up to the max.
export const defaultReconnectDelayMs = 1000;
export const defaultReconnectMaxDelayMs = 30000;

export const SETTING_KEYS = {
    address: "websocketAddress",
    port: "websocketPort",
    endpoint: "websocketEndpoint",
    startOnLaunch: "startWebsocketOnLaunch",
    reconnect: "websocketReconnect",
    reconnectDelayMs: "websocketReconnectDelayMs",
    reconnectMaxDelayMs: "websocketReconnectMaxDelayMs",
} as const;
