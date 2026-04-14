import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function skipBack(amount : number) {
    Spicetify.Player.skipBack(amount);
}

export const SkipBackAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SKIP_BACK,
    execute: (message) => skipBack(message.payload.amount)
}