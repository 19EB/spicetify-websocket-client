import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { PlayerState } from "../outgoing/types";
import { getPlayerState } from "./util";


function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_PLAYER_STATE>) {
    const playerState = getPlayerState();
    
    const response : WebsocketResponse<PlayerState> = {
        eventName: "Response",
        status: playerState ? "ok" : "error",
        requestName: WEBSOCKET_EVENT_TYPES.GET_PLAYER_STATE,
        requestId: websocketMessage.requestId,
        payload: playerState ? playerState : undefined,
        message: playerState ? undefined : `No playerstate available`
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetPlayerStateAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_PLAYER_STATE,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}