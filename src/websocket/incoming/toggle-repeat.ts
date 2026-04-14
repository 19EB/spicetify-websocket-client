import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function toggleRepeat() {
    Spicetify.Player.toggleRepeat();
}

export const ToggleRepeatAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.TOGGLE_REPEAT,
    execute: toggleRepeat
}