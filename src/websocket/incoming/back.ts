import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function back() {
    Spicetify.Player.back()
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.BACK>) {

    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if(callback == undefined || callback === true) {
        const response : WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.BACK,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.BACK>) {
    back();
    respond(websocketClient, websocketMessage);
}

export const BackAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.BACK,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}