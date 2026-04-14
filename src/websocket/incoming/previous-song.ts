import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function playPreviousSong() {
    Spicetify.Player.skipBack(99999999);
    Spicetify.Player.back();
}

export const PreviousSongAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG,
    execute: playPreviousSong
}