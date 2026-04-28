import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessage, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { safeParseUri } from "./util";

type AddToQueueUriPayload = {
    uri?: string;
}

function addToQueueUri(uri : string) {
    Spicetify.addToQueue([{uri : uri}]);
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URI>) {
    const uri = websocketMessage.payload.uri;
    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;
    const trackUri = safeParseUri(uri);
    let isTrackUri: boolean;

     if (trackUri == null) {
        isTrackUri = false;
    } else if (trackUri.type !== "track") {
        isTrackUri = false;
    } else {
        addToQueueUri(uri);
        isTrackUri = true;
    }

    if (callback == undefined || callback === true) {
        const response: WebsocketResponse<AddToQueueUriPayload> = {
            eventName: "Response",
            status: isTrackUri ? "ok" : "error",
            message: isTrackUri ? undefined : `Failed to queue URI: ${uri}. Invalid Spotify track URI.`,
            requestName: WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URI,
            requestId: requestId,
            payload: {
                uri: uri
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

export const AddToQueueUriAction : WebsocketAction = {
    requestName : WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URI,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}