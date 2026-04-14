import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function toggleMute() {
    Spicetify.Player.toggleMute();
}

export const ToggleMuteAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.TOGGLE_MUTE,
    execute: toggleMute
}