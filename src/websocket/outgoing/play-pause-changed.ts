import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";
import { Player } from "../../platform";

type PlayPauseChangedPayload = {
    isPlaying: boolean;
};

const handlePlayPauseChange = (websocketClient: WebsocketClient) => {
    const payload: PlayPauseChangedPayload = {
        isPlaying: Player.isPlaying(),
    };

    const message: WebsocketEvent<PlayPauseChangedPayload> = {
        eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.PLAY_PAUSE_CHANGED,
        payload
    };

    websocketClient.sendWebsocketMessage(message);
};

export const registerPlayPauseChangeListener = (websocketClient: WebsocketClient) => {
    Player.addEventListener("onplaypause", () => handlePlayPauseChange(websocketClient));

};