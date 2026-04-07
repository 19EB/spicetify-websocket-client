import { WebsocketClient } from "../ws-api";

// Extend the global object type to include websocketClient
declare global {
    // eslint-disable-next-line no-var
    var websocketClient: WebsocketClient;
}