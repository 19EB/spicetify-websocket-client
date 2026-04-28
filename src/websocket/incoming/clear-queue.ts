import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { WebsocketMessageGuard } from "./types";

function clearQueue() {
    Spicetify.Platform.PlayerAPI.clearQueue();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.CLEAR_QUEUE>) {
const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const response : WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.CLEAR_QUEUE,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.CLEAR_QUEUE>) {
    clearQueue();
    respond(websocketClient, websocketMessage);
}

export const ClearQueueAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.CLEAR_QUEUE,
    execute: (message, websocketClient) =>  handleRequest(websocketClient, message)
}