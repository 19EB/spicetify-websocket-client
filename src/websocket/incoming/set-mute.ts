import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";

type SetMutePayload = {
    state?: boolean;
}

function setMute(state : boolean) {
    Spicetify.Player.setMute(state);
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_MUTE>) {
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const state = websocketMessage.payload.state;
        const requestId = websocketMessage.requestId;
        const isValidPayload = typeof state === "boolean";

        const response: WebsocketResponse<SetMutePayload> = {
            eventName: "Response",
            status: isValidPayload ? "ok" :  "error",
            requestName: WEBSOCKET_EVENT_TYPES.SET_MUTE,
            requestId: requestId,
            message: isValidPayload ? undefined : `The given value ${state} is invalid. Falling back to default state 'true'.`,
            payload: {
                state: state
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_MUTE>) {
   setMute(websocketMessage.payload.state);
   respond(websocketClient, websocketMessage);
}

export const SetMuteAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SET_MUTE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}