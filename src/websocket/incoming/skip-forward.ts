import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function skipForward(amount : number) {
    Spicetify.Player.skipForward(amount);
}

export const SkipForwardAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SKIP_FORWARD,
    execute: (message) => skipForward(message.payload.amount)
}