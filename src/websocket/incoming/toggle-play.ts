import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function togglePlay() {
    Spicetify.Player.togglePlay();
}

export const TogglePlayAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY,
    execute: togglePlay
};