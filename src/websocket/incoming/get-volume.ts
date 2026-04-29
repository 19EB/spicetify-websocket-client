import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetVolumePayload = {
    level : number;
}

function handleRequest(websocketClient : WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_VOLUME>) {

    const response : WebsocketResponse<GetVolumePayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_VOLUME,
        requestId: websocketMessage.requestId,
        payload: {
            level : Spicetify.Player.getVolume()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetVolumeAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_VOLUME,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}