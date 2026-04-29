import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetMutePayload = {
    state : boolean;
}

function handleRequest(websocketClient : WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_MUTE>) {

    const response : WebsocketResponse<GetMutePayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_MUTE,
        requestId: websocketMessage.requestId,
        payload: {
            state : Spicetify.Player.getMute()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetMuteAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_MUTE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}