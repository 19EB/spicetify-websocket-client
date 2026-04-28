import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function decreaseVolume() {
    Spicetify.Player.decreaseVolume();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.DECREASE_VOLUME>) {
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if(callback == undefined || callback === true) {
        const response: WebsocketResponse<null> = {
            eventName: "Response", 
            status: "ok", 
            requestName: WEBSOCKET_EVENT_TYPES.DECREASE_VOLUME,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.DECREASE_VOLUME>) {
    decreaseVolume();
    respond(websocketClient, websocketMessage);
}

export const DecreaseVolumeAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.DECREASE_VOLUME,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}