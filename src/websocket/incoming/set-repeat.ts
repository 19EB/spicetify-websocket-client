import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function setRepeat(mode : number) {
    Spicetify.Player.setRepeat(mode);
}

export const SetRepeatAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SET_REPEAT,
    execute: (message) => setRepeat(message.payload.mode)
}