import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { isNumber } from "./util";

type SkipForwardPayload = {
    amount?: number;
}

function skipForward(amount: number) {
    Spicetify.Player.skipForward(amount);
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SKIP_FORWARD>) {
        const callback = websocketMessage.callback;


    if (callback == undefined || callback === true) {
        const amount = websocketMessage.payload.amount;
        const requestId = websocketMessage.requestId;
        const validPayload = isNumber(amount);


        const response: WebsocketResponse<SkipForwardPayload> = {
            eventName: "Response",
            status: validPayload ? "ok" : "error",
            requestName: WEBSOCKET_EVENT_TYPES.SKIP_FORWARD,
            requestId: requestId,
            message: validPayload ? undefined : `Failed to skip forward: Invalid amount.`,
            payload: {
                amount: amount
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SKIP_FORWARD>) {
    skipForward(websocketMessage.payload.amount);
   
    const validPayload = isNumber(websocketMessage.payload.amount);
    respond(websocketClient, websocketMessage);
}

export const SkipForwardAction: WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SKIP_FORWARD,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}