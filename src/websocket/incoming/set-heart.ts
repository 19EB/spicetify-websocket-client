import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function setHeart(status : boolean) {
    Spicetify.Player.setHeart(status);
}

export const SetHeartAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.SET_HEART,
    execute: (message) => setHeart(message.payload.status)
}