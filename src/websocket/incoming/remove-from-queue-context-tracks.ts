import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";
import { ContextTrack } from "./types";
import { toSpicetifyContextTracks } from "./util";

function removeFromQueueContextTracks(contextTracks : ContextTrack[]) {
    const spicetifyContextTracks = toSpicetifyContextTracks(contextTracks);
    Spicetify.removeFromQueue(spicetifyContextTracks);
}

export const RemoveFromQueueContextTracksAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_CONTEXT_TRACKS,
    execute: (message) => removeFromQueueContextTracks(message.payload.contextTracks)
}