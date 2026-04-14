import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function toggleShuffle() {
    Spicetify.Player.toggleShuffle();
}

export const ToggleShuffleAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.TOGGLE_SHUFFLE,
    execute: toggleShuffle
}
