import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";

type PlayPauseChangedPayload = {
    isPlaying: boolean;
};

const handlePlayPauseChange = (websocketClient: WebsocketClient) => {
    const payload: PlayPauseChangedPayload = {
        isPlaying: Spicetify.Player.isPlaying(),
    };

    const message: WebsocketEvent<PlayPauseChangedPayload> = {
        eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.PLAY_PAUSE_CHANGED,
        payload
    };

    websocketClient.sendWebsocketMessage(message);
};

export const registerPlayPauseChangeListener = (websocketClient: WebsocketClient) => {
    Spicetify.Player.addEventListener("onplaypause", () => handlePlayPauseChange(websocketClient));
};