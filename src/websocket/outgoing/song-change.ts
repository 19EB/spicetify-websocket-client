import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";

export type SongChangePayload = {
  title: string;
  artist: string;
  song: string;
}

const handleSongChange = (websocketClient: WebsocketClient) => {

  const currentItem = Spicetify.Player.data?.item ?? null;

  if (!currentItem) {
    console.warn('No current track data available');
    return;
  }

  const currentTrack = currentItem.name;
  const artistList = currentItem.artists ?? [];
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

const sendInitialSongChange = (websocketClient: WebsocketClient) => {
  return new Promise(async (resolve, reject) => {
    const maxTriesMs = 3000; // Maximum time to keep trying (3 seconds)
    const intervalMs = 100; // Interval between tries (100 ms)
    const startTime = Date.now();
    while (!Spicetify.Player.data?.item) {
      if (Date.now() - startTime > maxTriesMs) {
        console.warn('Could not get current track data after 3 seconds, giving up');
        reject(new Error('Could not get current track data after 3 seconds'));
        return;
      } else {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    // Send initial song change event on registration so that the current song is sent to the server immediately
    handleSongChange(websocketClient);
    resolve(true);
  });
}


export const registerSongChangeListener = (websocketClient: WebsocketClient) => {
  Spicetify.Player.addEventListener("songchange", () => handleSongChange(websocketClient));
  sendInitialSongChange(websocketClient);
}