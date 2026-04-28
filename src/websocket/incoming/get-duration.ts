import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetDurationPayload = {
    duration : number;
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_DURATION>) {

    const response : WebsocketResponse<GetDurationPayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_DURATION,
        requestId: websocketMessage.requestId,
        payload: {
            duration : Spicetify.Player.getDuration()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetDurationAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_DURATION,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}