import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";
import { PlayerTrack } from "./types";
import { toPlayerTrack } from "../incoming/util";
import { Player } from "../../platform";

const handleSongChange = (websocketClient: WebsocketClient) => {

  const currentItem = Player.data?.item ?? undefined;
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
  Player.addEventListener("songchange", () => handleSongChange(websocketClient));
}