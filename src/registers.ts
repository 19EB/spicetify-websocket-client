import { WebsocketClient } from "./ws-api";
import { NextSongAction } from "./ws-events/next-song";
import { PreviousSongAction } from "./ws-events/previous-song";
import { WebsocketMessage } from "./ws-events/types";
import { registerSongChangeListener } from "./ws-listeners/song-change"

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