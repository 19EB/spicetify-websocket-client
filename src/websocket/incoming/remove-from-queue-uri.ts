import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessage, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { safeParseUri } from "./util";

type RemoveFromQueueUriPayload = {
    uri?: string;
}

function removeFromQueueUri(uri : string) {
    Spicetify.removeFromQueue([{uri : uri }]);
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_URI>) {
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
        removeFromQueueUri(uri);
        isTrackUri = true;
    }

    if (callback == undefined || callback === true) {
        const response: WebsocketResponse<RemoveFromQueueUriPayload> = {
            eventName: "Response",
            status: isTrackUri ? "ok" : "error",
            message: isTrackUri ? undefined : `Failed to remove URI: ${uri}. Invalid Spotify track URI.`,
            requestName: WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_URI,
            requestId: requestId,
            payload: {
                uri: uri
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

export const RemoveFromQueueUriAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_URI,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
} 