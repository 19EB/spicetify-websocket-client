import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";


function toggleRepeat() {
    Spicetify.Player.toggleRepeat();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_REPEAT>) {
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if(callback == undefined || callback === true) {
        const response : WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_REPEAT,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_REPEAT>) {
    toggleRepeat();
    respond(websocketClient, websocketMessage);
}

export const ToggleRepeatAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_REPEAT,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}