import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function setShuffle(state : boolean) {
    Spicetify.Player.setShuffle(state);
}

export const SetShuffleAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SET_SHUFFLE,
    execute: (message) => setShuffle(message.payload.state)
}