import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { PlayerTrack } from "../outgoing/types";
import { toPlayerTrack } from "./util";

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_CURRENT_TRACK>) {
    const currentTrack = toPlayerTrack(Spicetify.Player.data.item);

    const response : WebsocketResponse<PlayerTrack> = {
        eventName: "Response",
        status: currentTrack ? "ok" : "error",
        requestName: WEBSOCKET_EVENT_TYPES.GET_CURRENT_TRACK,
        payload: currentTrack ? currentTrack : undefined,
        message: currentTrack ? undefined : `No current track data available`
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetCurrentTrackAction : WebsocketAction = {
    requestName : WEBSOCKET_EVENT_TYPES.GET_CURRENT_TRACK,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}