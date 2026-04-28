import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { isNumber } from "./util";

type SetVolumePayload = {
    level?: number;
}

function setVolume(level: number) {
    const asFloat = level / 100;
    const clamped = Math.max(0, Math.min(asFloat, 1));
    Spicetify.Player.setVolume(clamped);
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_VOLUME>) {
    const callback = websocketMessage.callback;

    if (callback == undefined || callback == true) {
        const level = websocketMessage.payload.level;
        const requestId = websocketMessage.requestId;
        const validPayload = isNumber(websocketMessage.payload);

        const response: WebsocketResponse<SetVolumePayload> = {
            eventName: "Response",
            status: validPayload ? "ok" : "error",
            requestName: WEBSOCKET_EVENT_TYPES.SET_VOLUME,
            requestId: requestId,
            message: validPayload ? undefined : `The given value ${level} is invalid. Falling back to volume level 0`,
            payload: {
                level: level
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.SET_VOLUME>) {
    setVolume(websocketMessage.payload.level);
    respond(websocketClient, websocketMessage);
}

export const SetVolumeAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.SET_VOLUME,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}