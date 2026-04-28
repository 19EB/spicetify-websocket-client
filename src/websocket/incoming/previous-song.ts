import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function playPreviousSong() {
    Spicetify.Player.skipBack(99999999);
    Spicetify.Player.back();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG>) {

    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback; 

    if (callback == undefined || callback === true) {
        const response : WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG>) {
    playPreviousSong();
    respond(websocketClient, websocketMessage);
}

export const PreviousSongAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}