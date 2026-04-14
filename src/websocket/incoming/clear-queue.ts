import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function clearQueue() {
    Spicetify.Platform.PlayerAPI.clearQueue();
}

export const ClearQueueAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.CLEAR_QUEUE,
    execute: clearQueue
}