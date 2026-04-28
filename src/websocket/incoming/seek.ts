import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { isNumber } from "./util";

type SeekPayload = {
    position?: number;
}

function seek(position: number) {
    Spicetify.Player.seek(position);
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SEEK>) {
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const position = websocketMessage.payload.position;
        const requestId = websocketMessage.requestId;
        const validPayload = isNumber(position);

        const response: WebsocketResponse<SeekPayload> = {
            eventName: "Response",
            status: validPayload ? "ok" : "error",
            requestName: WEBSOCKET_EVENT_TYPES.SEEK,
            requestId: requestId,
            message: validPayload ? undefined : 'Failed to seek: Invalid position.',
            payload: {
                position: position
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SEEK>) {
    seek(websocketMessage.payload.position);
    respond(websocketClient, websocketMessage);
}

export const SeekAction: WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SEEK,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}