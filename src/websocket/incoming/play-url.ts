import { WEBSOCKET_EVENT_TYPES, WebsocketAction } from "./types";

function spotifyUrlToUri(input : string) {
    const match = input.match(
    /open\.spotify\.com\/(track)\/([a-zA-Z0-9]+)/
  );

  if (!match) return null;

  const [, type, id] = match;
  return `spotify:${type}:${id}`;
}

function playUrl(url : string) {
    const uri = spotifyUrlToUri(url);
    if(uri == null) {
        return;
    } else {
        Spicetify.Player.playUri(uri);
    }
}

export const PlayUrlAction:  WebsocketAction = {
eventName: WEBSOCKET_EVENT_TYPES.PLAY_URL,
execute: (message) => playUrl(message.payload.url)
}