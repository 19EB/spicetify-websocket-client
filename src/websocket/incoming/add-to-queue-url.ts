import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";
import { spotifyUrlToUri } from "./util";

function addToQueueUrl(url : string) {
    const uri = spotifyUrlToUri(url);

    if(uri == null) {
        return;
    } else {
        Spicetify.addToQueue([{uri : uri}]);
    }
}

export const AddToQueueUrlAction : WebsocketAction = {
    eventName : WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URL,
    execute : (message) => addToQueueUrl(message.payload.url)
}