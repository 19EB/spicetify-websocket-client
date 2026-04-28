import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { WebsocketMessageGuard } from "./types";

function play() {
    Spicetify.Player.play();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.PLAY>) {
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const response : WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.PLAY,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.PLAY>) {
    play();
    respond(websocketClient, websocketMessage);
}

export const PlayAction: WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.PLAY,
    execute: (message, websocketClient) =>  handleRequest(websocketClient, message)
}