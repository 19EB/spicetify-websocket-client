import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function playUri(uri : string) {
    Spicetify.Player.playUri(uri);
}

export const PlayUriAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.PLAY_URI,
    execute: (message) => playUri(message.payload.uri)
}