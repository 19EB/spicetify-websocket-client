import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";
import { spotifyUrlToUri } from "./util";
import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { safeParseUri } from "./util";

type AddToQueueUrlPayload = {
    url: string;
}

function addToQueueUri(uri: string) {
    Spicetify.addToQueue([{ uri: uri }]);
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URL>) {
    const url = websocketMessage.payload.url;
    const uri = spotifyUrlToUri(url);

    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;
    const trackUri = safeParseUri(uri);
    let isTrackUri: boolean;

    if (trackUri == null || uri == null) {
        isTrackUri = false;
    } else if (trackUri.type !== "track") {
        isTrackUri = false;
    } else {
        addToQueueUri(uri);
        isTrackUri = true;
    }

    if (callback == undefined || callback === true) {
        const response: WebsocketResponse<AddToQueueUrlPayload> = {
            eventName: "Response",
            status: isTrackUri ? "ok" : "error",
            message: isTrackUri ? undefined : `Failed to queue URL: ${url}. Invalid Spotify track URL.`,
            requestName: WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URL,
            requestId: requestId,
            payload: {
                url: url
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

export const AddToQueueUrlAction: WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URL,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}