import {
    defaultReconnect,
    defaultReconnectDelayMs,
    defaultReconnectMaxDelayMs,
    defaultWebsocketAddress,
    defaultWebsocketEndpoint,
    defaultWebsocketPort,
    SETTING_KEYS,
} from "../config/defaults";
import { getSettingValue } from "../config/provider";
import { notify } from "../log/notify";
import { registerEvents, registerListeners } from "./registry";
import { WebsocketConnectionStatus } from "./types";
import { WebsocketEvent } from "./outgoing/types";
import PubSub from "pubsub-js";
import { sendInitialPlayerState } from "./outgoing/initial-state";

type WebsocketConfig = {
    address: string;
    port: string;
    endpoint: string;
}

type ReconnectConfig = {
    enabled: boolean;
    delayMs: number;
    maxDelayMs: number;
}

// Settings arrive as strings from the .ini file and from spcr-settings' number inputs.
const readNumberSetting = (key: string, fallback: number): number => {
    const parsed = Number(getSettingValue<string | number>(key));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export class WebsocketClient {

    private websocketUrl: string | null = null;
    private ws: WebSocket | null = null;
    private status: WebsocketConnectionStatus = WebsocketConnectionStatus.NOT_CONNECTED;
    private reconnectAttempts = 0;
    private reconnectTimer: number | undefined;
    // Set while disconnect() is in effect, so a deliberate close never reconnects.
    private closedByUser = false;

    constructor() {
        const config = this.getConfig();
        this.websocketUrl = this.getUrl(config);
        if (this.getAutoconnect()) {
            this.openSocket();
        }
    }

    getUrl(config: WebsocketConfig) {
        const { address, port, endpoint } = config;
        return `ws://${address}:${port}${endpoint}`;
    }

    getAutoconnect() {
        const autoconnect = getSettingValue<boolean>(SETTING_KEYS.startOnLaunch) ?? true;
        return autoconnect;
    }

    getConfig() {
        const websocketAddress = getSettingValue<string>(SETTING_KEYS.address) ?? defaultWebsocketAddress;
        const websocketPort = getSettingValue<string>(SETTING_KEYS.port) ?? defaultWebsocketPort;
        const websocketEndpoint = getSettingValue<string>(SETTING_KEYS.endpoint) ?? defaultWebsocketEndpoint;
        const config: WebsocketConfig = {
            address: websocketAddress,
            port: websocketPort,
            endpoint: websocketEndpoint,
        };
        return config;
    }

    getReconnectConfig(): ReconnectConfig {
        return {
            enabled: getSettingValue<boolean>(SETTING_KEYS.reconnect) ?? defaultReconnect,
            delayMs: readNumberSetting(SETTING_KEYS.reconnectDelayMs, defaultReconnectDelayMs),
            maxDelayMs: readNumberSetting(SETTING_KEYS.reconnectMaxDelayMs, defaultReconnectMaxDelayMs),
        };
    }

    public connect() {
        this.closedByUser = false;
        this.cancelReconnect();
        this.reconnectAttempts = 0;
        this.discardSocket();
        this.openSocket();
    }

    public disconnect() {
        this.closedByUser = true;
        this.cancelReconnect();
        this.reconnectAttempts = 0;
        this.discardSocket();
        this.setConnectionStatus(WebsocketConnectionStatus.NOT_CONNECTED);
    }

    private openSocket() {
        const config = this.getConfig();
        this.websocketUrl = this.getUrl(config);
        this.ws = new WebSocket(this.websocketUrl);
        this.initialize();
    }

    // Detaches handlers before closing so the outgoing socket cannot trigger a reconnect.
    private discardSocket() {
        const socket = this.ws;
        this.ws = null;
        if (!socket) return;
        socket.onopen = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.onmessage = null;
        try {
            socket.close();
        } catch (error) {
            console.error("Failed to close websocket", error);
        }
    }

    private cancelReconnect() {
        if (this.reconnectTimer !== undefined) {
            window.clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }

    private scheduleReconnect() {
        if (this.closedByUser) return;
        if (this.reconnectTimer !== undefined) return;

        const { enabled, delayMs, maxDelayMs } = this.getReconnectConfig();
        if (!enabled) {
            this.setConnectionStatus(WebsocketConnectionStatus.NOT_CONNECTED);
            return;
        }

        const backoffMs = Math.min(delayMs * Math.pow(2, this.reconnectAttempts), maxDelayMs);
        this.reconnectAttempts++;
        this.setConnectionStatus(WebsocketConnectionStatus.RECONNECTING);
        console.log(`Reconnecting in ${backoffMs}ms (attempt ${this.reconnectAttempts})`);

        this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = undefined;
            this.openSocket();
        }, backoffMs);
    }

    setConnectionStatus(status: WebsocketConnectionStatus) {
        this.status = status;
        PubSub.publish("websocket:status-change", status);
    }

    public getStatus() {
        return this.status;
    }

    public getReconnectAttempts() {
        return this.reconnectAttempts;
    }

    initialize() {
        const client = this.ws;
        if (!client) return;
        this.setConnectionStatus(WebsocketConnectionStatus.CONNECTING);

        client.onerror = () => {
            console.log('Connection Error');
            // Only announce the first failure, so a long retry loop stays quiet.
            if (this.reconnectAttempts === 0) {
                notify("Websocket connection error");
            }
            this.setConnectionStatus(WebsocketConnectionStatus.CONNECTION_ERROR);
        };

        client.onclose = () => {
            if (this.closedByUser || this.ws !== client) return;
            if (this.status === WebsocketConnectionStatus.CONNECTED) {
                notify("Websocket disconnected");
            }
            this.scheduleReconnect();
        };

        client.onopen = () => {
            if (client.readyState !== client.OPEN) return;

            const wasReconnecting = this.reconnectAttempts > 0;
            this.reconnectAttempts = 0;
            notify(wasReconnecting ? "Websocket reconnected" : "Websocket connection established");
            this.setConnectionStatus(WebsocketConnectionStatus.CONNECTED);

            // Send initial player data
            sendInitialPlayerState(this).catch((error) => {
                console.warn('Could not send initial player state', error);
            });
            // Register event listeners for outgoing events
            registerListeners(this);
            // Set up event handlers for incoming messages
            registerEvents(this);
        };
    }

    public getWebsocket() {
        return this.ws;
    }

    public sendWebsocketMessage = <T extends WebsocketEvent<any>>(payload: T) => {
        const ws = this.getWebsocket();
        if (!ws) return;
        if (ws.readyState === ws.OPEN) {
            console.log('Sending message to server');
            ws.send(JSON.stringify(payload));
        } else {
            console.log('WebSocket is not open. Ready state: ' + ws.readyState);
        }
    }
}
