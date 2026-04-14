import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function back() {
    Spicetify.Player.back()
}

export const BackAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.BACK,
    execute: back
}