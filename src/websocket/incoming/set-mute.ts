import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function setMute(state : boolean) {
    Spicetify.Player.setMute(state);
}

export const SetMuteAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SET_MUTE,
    execute: (message) => setMute(message.payload.state)
}