import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function setVolume(level: number) {
    const asFloat = level / 100;
    const clamped = Math.max(0, Math.min(asFloat, 1));
    Spicetify.Player.setVolume(clamped);
}

export const SetVolumeAction: WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SET_VOLUME,
    execute: (message) => setVolume(message.payload.level)
}