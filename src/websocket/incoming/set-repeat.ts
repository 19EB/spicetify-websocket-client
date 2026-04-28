import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";

type SetRepeatPayload = {
    mode?: 0 | 1 | 2;
}

function setRepeat(mode: number) {
    Spicetify.Player.setRepeat(mode);
}

function validateAndRespond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_REPEAT>) {
    const mode = websocketMessage.payload.mode;
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;
    const isValidPayload = (mode === 0 || mode === 1 || mode === 2);

    if(callback == undefined || callback === true) {
        const response: WebsocketResponse<SetRepeatPayload> = {
            eventName: "Response",
            status: isValidPayload ? "ok" : "error",
            requestName: WEBSOCKET_EVENT_TYPES.SET_REPEAT,
            requestId: requestId,
            message: isValidPayload ? undefined : `The given value ${mode} is invalid. Falling back to default mode 0.`,
            payload: {
                mode
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_REPEAT>) {
    setRepeat(websocketMessage.payload.mode);
    validateAndRespond(websocketClient, websocketMessage);
}

export const SetRepeatAction: WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SET_REPEAT,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}