import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";
import { PlayerState   } from "./types";
import { getPlayerState } from "../incoming/util";
import { Player } from "../../platform";

const sendMessage = (websocketClient: WebsocketClient) => {

    const currentState = getPlayerState();

    if (!currentState) {
        console.warn('No player state available');
        return;
    }

    const objectToSend: WebsocketEvent<PlayerState> = {
        eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.INITIAL_STATE,
        payload: currentState,
    };

    websocketClient.sendWebsocketMessage(objectToSend);
}

export const sendInitialPlayerState  = (websocketClient: WebsocketClient) => {
  return new Promise(async (resolve, reject) => {
    const maxTriesMs = 3000; // Maximum time to keep trying (3 seconds)
    const intervalMs = 100; // Interval between tries (100 ms)
    const startTime = Date.now();
    while (!Player.data?.item) {
      if (Date.now() - startTime > maxTriesMs) {
        console.warn('Could not get player state after 3 seconds, giving up');
        reject(new Error('Could not get player state after 3 seconds'));
        return;
      } else {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    sendMessage(websocketClient);
    resolve(true);
  });
}