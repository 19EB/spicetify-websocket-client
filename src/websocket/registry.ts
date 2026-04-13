import { WebsocketAction, WebsocketMessage } from "./incoming/types";
import { registerSongChangeListener } from "./outgoing/song-change";
import { PlayAction } from "./incoming/play";
import { PlayUriAction } from "./incoming/play-uri";
import { PlayUrlAction } from "./incoming/play-url";
import { PauseAction } from "./incoming/pause";
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

const eventHandlers: WebsocketAction[] = [
    PlayAction,
    PlayUriAction,
    PlayUrlAction,
    PauseAction,
    NextSongAction,
    PreviousSongAction,
    SetVolumeAction,
]

export const isActionForMessage = <T extends WebsocketMessage>(
    action: WebsocketAction,
    message: T
): action is Extract<WebsocketAction, { eventName: T["eventName"] }> & { execute: (msg: T) => void } => {
    return action.eventName === message.eventName;
};

export const registerEvents = (websocketClient: WebsocketClient) => {
    const ws = websocketClient.getWebsocket();
    if (!ws) {
        console.error("Websocket is not initialized");
        return;
    }

    ws.onmessage = function (message) {
        const { data } = message;
        const parsed: WebsocketMessage = JSON.parse(data);
        const foundAction = eventHandlers.find(action => action.eventName === parsed.eventName);
        if (foundAction && isActionForMessage(foundAction, parsed)) {
            foundAction.execute(parsed);
        } else {
            console.log(`No handler found for event type: ${parsed.eventName}`);
        }
    };

}