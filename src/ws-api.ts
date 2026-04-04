import { defaultWebsocketAddress, defaultWebsocketPort, settings } from "./config/settings";
import { registerEvents, registerListeners } from "./registers";
import { WebsocketConnectionStatus } from "./svg/WebsocketSvg";
import { WebsocketEvent } from "./ws-listeners/types";
import PubSub from "pubsub-js";

type WebsocketConfig = {
    address: string;
    port: string;
    endpoint: string;
}

export class WebsocketClient {

    private websocketUrl: string | null = null;
    private ws: WebSocket | null = null;
    private status: WebsocketConnectionStatus = WebsocketConnectionStatus.NOT_CONNECTED;

    constructor() {
        const config = this.getConfig();
        this.websocketUrl = this.getUrl(config);
        const autoConnect = this.getAutoconnect();
        if (autoConnect) {
            this.ws = new WebSocket(this.websocketUrl);
            this.initialize();
        }
    }

    getUrl(config: WebsocketConfig) {
        const { address, port, endpoint } = config;
        return `ws://${address}:${port}${endpoint}`;
    }

    getAutoconnect() {
        const autoconnect = settings.getFieldValue<boolean>("startWebsocketOnLaunch") ?? true;
        return autoconnect;
    }

    getConfig() {
        const websocketAddress = settings.getFieldValue<string>("websocketAddress") ?? defaultWebsocketAddress;
        const websocketPort = settings.getFieldValue<string>("websocketPort") ?? defaultWebsocketPort;
        const websocketEndpoint = settings.getFieldValue<string>("websocketEndpoint") ?? "/";
        const config: WebsocketConfig = {
            address: websocketAddress,
            port: websocketPort,
            endpoint: websocketEndpoint,
        };
        return config;
    }

    public reconnect() {
        if (this.ws) {
            this.ws.close();
        }

        const config = this.getConfig();
        this.websocketUrl = this.getUrl(config);
        this.ws = new WebSocket(this.websocketUrl);

        if (!this.websocketUrl) {
            console.error("Websocket URL is not defined");
            return null;
        }
        this.ws = new WebSocket(this.websocketUrl);
        this.initialize();
    }

    setConnectionStatus(status: WebsocketConnectionStatus) {
        this.status = status;
        console.log('Publishing status', status);
        PubSub.publish("websocket:status-change", status);
    }

    public getStatus() {
        return this.status;
    }

    initialize() {
        const websocketClient = this;
        const client = this.ws;
        const setConnectionStatus = this.setConnectionStatus.bind(this);
        setConnectionStatus(WebsocketConnectionStatus.CONNECTING);
        if (!client) return;

        client.onerror = function () {
            console.log('Connection Error');
            Spicetify.showNotification("Websocket connection error");
            setConnectionStatus(WebsocketConnectionStatus.DISCONNECTED);
        };

        client.onopen = function () {
            if (client.readyState === client.OPEN) {
                Spicetify.showNotification("Websocket connection established");
                setConnectionStatus(WebsocketConnectionStatus.CONNECTED);
                // Register event listeners for outgoing events
                registerListeners(websocketClient);
                // Set up event handlers for incoming messages
                registerEvents(websocketClient);
            }
        };

        client.onclose = function () {
            setConnectionStatus(WebsocketConnectionStatus.DISCONNECTED);
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