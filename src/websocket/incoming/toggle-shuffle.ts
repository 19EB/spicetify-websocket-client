import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function toggleShuffle() {
    Spicetify.Player.toggleShuffle();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_SHUFFLE>) {
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const response: WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_SHUFFLE,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_SHUFFLE>) {
    toggleShuffle();
    respond(websocketClient, websocketMessage);
}

export const ToggleShuffleAction: WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_SHUFFLE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}
