import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { isNumber } from "./util";

type SkipBackPayload = {
    amount?: number;
}

function skipBack(amount : number) {
    Spicetify.Player.skipBack(amount);
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SKIP_BACK>) {
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const amount = websocketMessage.payload.amount;
        const requestId = websocketMessage.requestId;

        const validPayload = isNumber(amount);

        const response: WebsocketResponse<SkipBackPayload> = {
            eventName: "Response",
            status: validPayload ? "ok" : "error",
            requestName: WEBSOCKET_EVENT_TYPES.SKIP_BACK,
            requestId: requestId,
            message: validPayload ? undefined : 'Failed to skip back: Invalid amount.',
            payload: {
                amount: amount
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SKIP_BACK>) {
    skipBack(websocketMessage.payload.amount);

    const validPayload = isNumber(websocketMessage.payload.amount);
    respond(websocketClient, websocketMessage);
}

export const SkipBackAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SKIP_BACK,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}