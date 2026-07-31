import { WebsocketClient } from "../client";
import { observeValue } from "../../observers/observe-value";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";

type VolumeChangedPayload = {
  level: number;
};

const sendVolume = (websocketClient: WebsocketClient, level: number) => {
  const message: WebsocketEvent<VolumeChangedPayload> = {
    eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.VOLUME_CHANGED,
    payload: { level },
  };
  websocketClient.sendWebsocketMessage(message);
};

export const registerVolumeChangeListener = (websocketClient: WebsocketClient) => {
  observeValue<number>({
    read: () => Spicetify.Player.getVolume(),
    emitInitial: false,
    debounceMs: 600,
    onChange: (level) => sendVolume(websocketClient, level),
  });
};
