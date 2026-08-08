import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";
import { PlayerTrack } from "./types";
import { toPlayerTrack } from "../incoming/util";
import { Player } from "../../platform";

const handleQueueChange = (websocketClient: WebsocketClient) => {

    const nextItems = Player.data?.nextItems ?? undefined;
    const nextTracks: PlayerTrack[] = [];

    if (nextItems != undefined) {
        for (let i = 0; i < nextItems.length; i++) {
            const track = toPlayerTrack(nextItems[i]);
            if (track) nextTracks.push(track);
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
    Player.addEventListener("queue_update", () => handleQueueChange(websocketClient));
}
