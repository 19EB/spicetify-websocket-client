import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function setVolume(volume: number) {
    const asFloat = volume / 100;
    const clamped = Math.max(0, Math.min(asFloat, 1));
    Spicetify.Player.setVolume(clamped);
}

export const SetVolumeAction: WebsocketAction<WEBSOCKET_EVENT_TYPES.SET_VOLUME> = {
    eventName: WEBSOCKET_EVENT_TYPES.SET_VOLUME,
    execute: (payload) => setVolume(payload.volume)
}