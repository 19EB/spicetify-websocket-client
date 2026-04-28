import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function togglePlay() {
    Spicetify.Player.togglePlay();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY>) {

    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const response : WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY>) {
    togglePlay();
    respond(websocketClient, websocketMessage);
}

export const TogglePlayAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
};