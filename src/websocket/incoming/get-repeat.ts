import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetRepeatPayload = {
    mode : number;
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_REPEAT>) {

    const response : WebsocketResponse<GetRepeatPayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_REPEAT,
        requestId: websocketMessage.requestId,
        payload: {
            mode : Spicetify.Player.getRepeat()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetRepeatAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_REPEAT,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}