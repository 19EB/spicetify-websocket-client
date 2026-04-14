import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";
import { spotifyUrlToUri } from "./util";

function removeFromQueueUrl(url : string) {
    const uri = spotifyUrlToUri(url);

    if(uri == null) {
        return;
    } else {
        Spicetify.removeFromQueue([{uri : uri }]);
    }
}

export const RemoveFromQueueUrlAction : WebsocketAction = {
    eventName: WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_URL,
    execute: (message) => removeFromQueueUrl(message.payload.url)
}