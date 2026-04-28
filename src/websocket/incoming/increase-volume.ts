import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function increaseVolume() {
    Spicetify.Player.increaseVolume();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.INCREASE_VOLUME>) {
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if(callback == undefined || callback === true) {
        const response: WebsocketResponse<null> = {
            eventName: "Response", 
            status: "ok", 
            requestName: WEBSOCKET_EVENT_TYPES.INCREASE_VOLUME,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.INCREASE_VOLUME>) {
    increaseVolume();
    respond(websocketClient, websocketMessage);
}

export const IncreaseVolumeAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.INCREASE_VOLUME,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}