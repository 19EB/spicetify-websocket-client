import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";
import { observeValue } from "../../observe-value";

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
    emitInitial: true,
    onChange: (level) => sendVolume(websocketClient, level),
  });
};