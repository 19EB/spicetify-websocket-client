import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function addToQueueUri(uri : string) {
    Spicetify.addToQueue([{uri : uri}]);
}

export const AddToQueueUriAction : WebsocketAction = {
    eventName : WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URI,
    execute : (message) => addToQueueUri(message.payload.uri)
}