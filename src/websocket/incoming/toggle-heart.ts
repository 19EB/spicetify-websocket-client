import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function toggleHeart() {
    Spicetify.Player.toggleHeart();
}

export const ToggleHeartAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.TOGGLE_HEART,
    execute: toggleHeart
}