import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";
import { spotifyUrlToUri } from "./util";

function playUrl(url : string) {
    const uri = spotifyUrlToUri(url);
    if(uri == null) {
        return;
    } else {
        Spicetify.Player.playUri(uri);
    }
}

export const PlayUrlAction :  WebsocketAction = {
eventName: WEBSOCKET_EVENT_TYPES.PLAY_URL,
execute: (message) => playUrl(message.payload.url)
}