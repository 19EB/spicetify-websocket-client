import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function seek(position : number) {
    Spicetify.Player.seek(position);
}

export const SeekAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SEEK,
    execute: (message) => seek(message.payload.position)
}