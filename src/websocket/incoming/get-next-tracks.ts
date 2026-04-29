import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { PlayerTrack } from "../outgoing/types";
import { toPlayerTrack } from "./util";

type GetNextTracksPayload = {
    tracks : PlayerTrack[];
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_NEXT_TRACKS>) {
    const nextTracks : PlayerTrack[] = [];

    const nextItems = Spicetify.Player.data.nextItems;

    if(nextItems) {
        for(let i = 0; i < nextItems.length ; i++) {
            nextTracks[i] = toPlayerTrack(nextItems[i])
        }
    }

    const response : WebsocketResponse<GetNextTracksPayload> = {
        eventName: "Response",
        status: nextItems ? "ok" : "error",
        requestName: WEBSOCKET_EVENT_TYPES.GET_NEXT_TRACKS,
        payload: {
            tracks :  nextTracks
        },

        message: nextItems ? undefined : `No next tracks data available`
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetNextTracksAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_NEXT_TRACKS,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}