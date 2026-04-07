import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function playNextSong() {
    Spicetify.Player.next();
}

export const NextSongAction: WebsocketAction<WEBSOCKET_EVENT_TYPES.NEXT_SONG> = {
    eventName: WEBSOCKET_EVENT_TYPES.NEXT_SONG,
    execute: playNextSong
}