import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function pause() {
    Spicetify.Player.pause();
}

export const PauseAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.PAUSE,
    execute: pause
}