import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";

type SetHeartPayload = {
    status?: boolean;
}

function setHeart(status : boolean) {
    Spicetify.Player.setHeart(status);
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_HEART>) {
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const status = websocketMessage.payload.status;
        const requestId = websocketMessage.requestId;
        const isValidPayload = typeof status === "boolean";

        const response: WebsocketResponse<SetHeartPayload> = {
            eventName: "Response",
            status: isValidPayload ? "ok" :  "error",
            requestName: WEBSOCKET_EVENT_TYPES.SET_HEART,
            requestId: requestId,
            message: isValidPayload ? undefined : `The given value ${status} is invalid. Falling back to default status 'true'.`,
            payload: {
                status: status
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_HEART>) {
   setHeart(websocketMessage.payload.status);
   respond(websocketClient, websocketMessage);
}

export const SetHeartAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SET_HEART,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}