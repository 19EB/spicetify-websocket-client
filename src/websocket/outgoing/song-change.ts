import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";

export type SongChangePayload = {
  title: string;
  artist: string;
  song: string;
}

const handleSongChange = (websocketClient: WebsocketClient) => {
  const currentTrack = Spicetify.Player.data.item.name;
  const artistList = Spicetify.Player.data.item.artists ?? [];
  const currentArtist = artistList.map(artist => artist.name).join(', ');
  const payload: SongChangePayload = {
    title: `${currentTrack} by ${currentArtist}`,
    artist: currentArtist,
    song: currentTrack,
  };
  const objectToSend: WebsocketEvent<SongChangePayload> = {
    eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.SONG_CHANGED,
    payload: payload,
  };
  websocketClient.sendWebsocketMessage(objectToSend);
}

export const registerSongChangeListener = (websocketClient: WebsocketClient) => {
  Spicetify.Player.addEventListener("songchange", () => handleSongChange(websocketClient));

  // Send initial song change event on registration so that the current song is sent to the server immediately
  handleSongChange(websocketClient);

}