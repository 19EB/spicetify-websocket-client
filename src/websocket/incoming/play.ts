import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function play() {
    Spicetify.Player.play();
}

export const PlayAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.PLAY,
    execute: play
}