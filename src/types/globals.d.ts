import { WebsocketClient } from "../websocket/client";

// Extend the global object type to include websocketClient
declare global {
    // eslint-disable-next-line no-var
    var websocketClient: WebsocketClient;
    // Injected by the standalone CDP host before the client bundle runs
    // eslint-disable-next-line no-var
    var __WS_CLIENT_CONFIG__: Record<string, unknown> | undefined;
    // The standalone client instance, kept separate from the Spicetify build's handle
    // eslint-disable-next-line no-var
    var __WS_CLIENT_STANDALONE__: WebsocketClient | undefined;
}
