import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetShufflePayload = {
    state : boolean;
}

function handleRequest(websocketClient : WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_SHUFFLE>) {

    const response : WebsocketResponse<GetShufflePayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_SHUFFLE,
        requestId: websocketMessage.requestId,
        payload: {
            state : Spicetify.Player.getShuffle()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetShuffleAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_SHUFFLE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}