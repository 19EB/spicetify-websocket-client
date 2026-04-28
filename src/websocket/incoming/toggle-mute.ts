import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function toggleMute() {
    Spicetify.Player.toggleMute();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_MUTE>) {
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const response: WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_MUTE,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_MUTE>) {
    toggleMute();
    respond(websocketClient, websocketMessage);
}

export const ToggleMuteAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_MUTE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}