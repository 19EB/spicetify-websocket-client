import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function removeFromQueueUri(uri : string) {
    Spicetify.removeFromQueue([{uri : uri }]);
}

export const RemoveFromQueueUriAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_URI,
    execute: (message) => removeFromQueueUri(message.payload.uri)
}