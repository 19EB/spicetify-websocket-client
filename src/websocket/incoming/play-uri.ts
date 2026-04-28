import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessage, WebsocketMessageGuard } from "./types";
import { WebsocketResponse } from "../outgoing/types";
import { WebsocketClient } from "../client";
import { safeParseUri } from "./util";

type PlayUriPayload = {
    uri?: string;
}

function playUri(uri: string) {
    Spicetify.Player.playUri(uri);
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.PLAY_URI>) {
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
        playUri(uri);
        isTrackUri = true;
    }

    if (callback == undefined || callback === true) {
        const response: WebsocketResponse<PlayUriPayload> = {
            eventName: "Response",
            status: isTrackUri ? "ok" : "error",
            message: isTrackUri ? undefined : `Failed to play URI: ${uri}. Invalid Spotify track URI.`,
            requestName: WEBSOCKET_EVENT_TYPES.PLAY_URI,
            requestId: requestId,
            payload: {
                uri: uri
            }
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

export const PlayUriAction: WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.PLAY_URI,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}