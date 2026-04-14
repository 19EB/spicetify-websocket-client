import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function increaseVolume() {
    Spicetify.Player.increaseVolume();
}

export const IncreaseVolumeAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.INCREASE_VOLUME,
    execute: increaseVolume
}