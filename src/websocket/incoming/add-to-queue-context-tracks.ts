import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";
import { ContextTrack } from "./types";
import { toSpicetifyContextTracks } from "./util";

function addToQueueContextTracks(contextTracks : ContextTrack[]) {
    const spicetifyContextTracks = toSpicetifyContextTracks(contextTracks);
    Spicetify.addToQueue(spicetifyContextTracks);
}

export const AddToQueueContextTracksAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_CONTEXT_TRACKS,
    execute: (message) => addToQueueContextTracks(message.payload.contextTracks)
}