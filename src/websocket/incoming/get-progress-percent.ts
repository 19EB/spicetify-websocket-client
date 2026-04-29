import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetProgressPercentPayload = {
    progressPercent : number;
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_PROGRESS_PERCENT>) {

    const response : WebsocketResponse<GetProgressPercentPayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_PROGRESS_PERCENT,
        requestId: websocketMessage.requestId,
        payload: {
            progressPercent : Spicetify.Player.getProgressPercent()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetProgressPercentAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_PROGRESS_PERCENT,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}