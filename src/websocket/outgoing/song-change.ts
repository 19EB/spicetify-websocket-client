import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";
import { PlayerTrack } from "./types";
import { toPlayerTrack } from "../incoming/util";

const handleSongChange = (websocketClient: WebsocketClient) => {

  const currentItem = Spicetify.Player.data?.item ?? undefined;
  const currentTrack = toPlayerTrack(currentItem);

  if (!currentTrack) {
    console.warn('No current track data available');
    return;
  }

  const objectToSend: WebsocketEvent<PlayerTrack> = {
    eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.SONG_CHANGED,
    payload: currentTrack,
  };
  
  websocketClient.sendWebsocketMessage(objectToSend);
}

export const registerSongChangeListener = (websocketClient: WebsocketClient) => {
  Spicetify.Player.addEventListener("songchange", () => handleSongChange(websocketClient));
}