import { WebsocketMessage } from "./incoming/types";
import { registerSongChangeListener } from "./outgoing/song-change";
import { NextSongAction } from "./incoming/next-song";
import { PreviousSongAction } from "./incoming/previous-song";
import { SetVolumeAction } from "./incoming/set-volume";
import { WebsocketClient } from "./client";

let listenersRegistered = false;

export const registerListeners = (websocketClient: WebsocketClient) => {
    if (listenersRegistered) {
        return;
    }

    registerSongChangeListener(websocketClient);
    listenersRegistered = true;
}

const eventHandlers = [
    NextSongAction,
    PreviousSongAction,
    SetVolumeAction,
]

export const registerEvents = (websocketClient: WebsocketClient) => {
    const ws = websocketClient.getWebsocket();
    if (!ws) {
        console.error("Websocket is not initialized");
        return;
    }

    ws.onmessage = function (message) {
        const { data } = message;
        const parsed: WebsocketMessage<any> = JSON.parse(data);
        const foundAction = eventHandlers.find(action => action.eventName === parsed.eventName);
        if (foundAction) {
            foundAction.execute(parsed.payload);
        } else {
            console.log(`No handler found for event type: ${parsed.eventName}`);
        }
    };

}