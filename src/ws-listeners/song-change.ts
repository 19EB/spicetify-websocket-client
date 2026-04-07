import { WebsocketClient } from "../ws-api";
import { WebsocketEvent } from "./types";

export type SongChangePayload = {
  title: string;
  artist: string;
  song: string;
}

const WS_EVENT_NAME = "UpdateSong";

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
    eventName: WS_EVENT_NAME,
    payload: payload,
  };
  websocketClient.sendWebsocketMessage(objectToSend);
}

export const registerSongChangeListener = (websocketClient: WebsocketClient) => {
  Spicetify.Player.addEventListener("songchange", () => handleSongChange(websocketClient));

  // Send initial song change event on registration so that the current song is sent to the server immediately
  handleSongChange(websocketClient);

}