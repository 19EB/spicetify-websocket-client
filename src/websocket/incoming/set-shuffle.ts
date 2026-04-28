import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";

type SetShufflePayload = {
    state?: boolean;
}

function setShuffle(state : boolean) {
    Spicetify.Player.setShuffle(state);
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_SHUFFLE>) {
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const state = websocketMessage.payload.state;
        const requestId = websocketMessage.requestId;
        const isValidPayload = typeof state === "boolean";

        const response: WebsocketResponse<SetShufflePayload> = {
            eventName: "Response",
            status: isValidPayload ? "ok" :  "error",
            requestName: WEBSOCKET_EVENT_TYPES.SET_SHUFFLE,
            requestId: requestId,
            message: isValidPayload ? undefined : `The given value ${state} is invalid. Falling back to default state 'true'.`,
            payload: {
                state: state
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_SHUFFLE>) {
   setShuffle(websocketMessage.payload.state);
   respond(websocketClient, websocketMessage);
}


export const SetShuffleAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SET_SHUFFLE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}