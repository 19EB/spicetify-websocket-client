import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function playNextSong() {
    Spicetify.Player.next();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.NEXT_SONG>) {

    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const response : WebsocketResponse<null>= {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.NEXT_SONG,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.NEXT_SONG>) {
    playNextSong();
    respond(websocketClient, websocketMessage);
}

export const NextSongAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.NEXT_SONG,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}