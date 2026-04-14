import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function decreaseVolume() {
    Spicetify.Player.decreaseVolume();
}

export const DecreaseVolumeAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.DECREASE_VOLUME,
    execute: decreaseVolume
}