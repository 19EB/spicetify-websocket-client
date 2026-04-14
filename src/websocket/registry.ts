import { WebsocketAction, WebsocketMessage } from "./incoming/types";
import { registerSongChangeListener } from "./outgoing/song-change";
import { PlayAction } from "./incoming/play";
import { PlayUriAction } from "./incoming/play-uri";
import { PlayUrlAction } from "./incoming/play-url";
import { PauseAction } from "./incoming/pause";
import { TogglePlayAction } from "./incoming/toggle-play";
import { NextSongAction } from "./incoming/next-song";
import { BackAction } from "./incoming/back";
import { PreviousSongAction } from "./incoming/previous-song";
import { SkipForwardAction } from "./incoming/skip-forward";
import { SkipBackAction } from "./incoming/skip-back";
import { SeekAction } from "./incoming/seek";
import { SetShuffleAction } from "./incoming/set-shuffle";
import { ToggleShuffleAction } from "./incoming/toggle-shuffle";
import { SetRepeatAction } from "./incoming/set-repeat";
import { ToggleRepeatAction } from "./incoming/toggle-repeat";
import { SetVolumeAction } from "./incoming/set-volume";
import { DecreaseVolumeAction } from "./incoming/decrease-volume";
import { IncreaseVolumeAction } from "./incoming/increase-volume";
import { SetMuteAction } from "./incoming/set-mute";
import { ToggleMuteAction } from "./incoming/toggle-mute";

import { AddToQueueUriAction } from "./incoming/add-to-queue-uri";
import { AddToQueueUrlAction } from "./incoming/add-to-queue-url";
import { AddToQueueContextTracksAction } from "./incoming/add-to-queue-context-tracks";
import { RemoveFromQueueUriAction } from "./incoming/remove-from-queue-uri";
import { RemoveFromQueueUrlAction } from "./incoming/remove-from-queue-url";
import { RemoveFromQueueContextTracksAction } from "./incoming/remove-from-queue-context-tracks";
import { ClearQueueAction, clearQueueAction } from "./incoming/clear-queue";

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
    TogglePlayAction,
    NextSongAction,
    BackAction,
    PreviousSongAction,
    SkipForwardAction,
    SkipBackAction,
    SeekAction,
    SetShuffleAction,
    ToggleShuffleAction,
    SetRepeatAction,
    ToggleRepeatAction,
    SetVolumeAction,
    DecreaseVolumeAction,
    IncreaseVolumeAction,
    SetMuteAction,
    ToggleMuteAction,

    AddToQueueUriAction,
    AddToQueueUrlAction,
    AddToQueueContextTracksAction,
    RemoveFromQueueUriAction,
    RemoveFromQueueUrlAction,
    RemoveFromQueueContextTracksAction,
    ClearQueueAction
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