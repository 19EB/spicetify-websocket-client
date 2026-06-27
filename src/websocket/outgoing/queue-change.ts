import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";
import { PlayerTrack } from "./types";
import { toPlayerTrack } from "../util";

const handleQueueChange = (websocketClient: WebsocketClient) => {

    const nextItems = Spicetify.Player.data?.nextItems ?? undefined;
    const nextTracks: PlayerTrack[] = [];

    if (nextItems != undefined) {
        for (let i = 0; i < nextItems.length; i++) {
            nextTracks[i] = toPlayerTrack(nextItems[i]);
        }

        const objectToSend: WebsocketEvent<PlayerTrack[]> = {
            eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.QUEUE_CHANGED,
            payload: nextTracks,
        };

        websocketClient.sendWebsocketMessage(objectToSend);
    } else {
        console.warn('No next tracks data available')
    }
}

export const registerQueueChangeListener = (websocketClient: WebsocketClient) => {
    Spicetify.Platform.PlayerAPI._events.addListener("queue_update", () => handleQueueChange(websocketClient));
  //  sendInitialQueue(websocketClient);
}
