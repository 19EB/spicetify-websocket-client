import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { PlayerTrack } from "../outgoing/types";
import { toPlayerTrack } from "./util";


function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_PREVIOUS_TRACK>) {
    const previousItems = Spicetify.Player.data.previousItems;

    const previousTrack = previousItems ? toPlayerTrack(previousItems[0]) : undefined;

    const response : WebsocketResponse<PlayerTrack> = {
        eventName: "Response",
        status: previousTrack ? "ok" : "error",
        requestName: WEBSOCKET_EVENT_TYPES.GET_PREVIOUS_TRACK,
        payload: previousTrack ? previousTrack : undefined,
        message: previousTrack ? undefined : `No previous track data available`
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetPreviousTracksAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_PREVIOUS_TRACK,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}