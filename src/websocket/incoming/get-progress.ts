import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetProgressPayload = {
    progress : number;
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_PROGRESS>) {

    const response : WebsocketResponse<GetProgressPayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_PROGRESS,
        requestId: websocketMessage.requestId,
        payload: {
            progress : Spicetify.Player.getProgress()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetProgressAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_PROGRESS,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}