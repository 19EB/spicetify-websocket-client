import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetPlayPausePayload = {
    isPlaying : boolean;
}

function handleRequest(websocketClient : WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_PLAY_PAUSE>) {

    const response : WebsocketResponse<GetPlayPausePayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_PLAY_PAUSE,
        requestId: websocketMessage.requestId,
        payload: {
            isPlaying : Spicetify.Player.isPlaying()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetPlayPauseAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_PLAY_PAUSE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}