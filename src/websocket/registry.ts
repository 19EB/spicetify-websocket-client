import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessage } from "./incoming/types";
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
import { RemoveFromQueueUriAction } from "./incoming/remove-from-queue-uri";
import { RemoveFromQueueUrlAction } from "./incoming/remove-from-queue-url";
import { ClearQueueAction } from "./incoming/clear-queue";
import { SetHeartAction } from "./incoming/set-heart";
import { ToggleHeartAction } from "./incoming/toggle-heart";

import { GetDurationAction } from "./incoming/get-duration";

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
    RemoveFromQueueUriAction,
    RemoveFromQueueUrlAction,
    ClearQueueAction,
    SetHeartAction,
    ToggleHeartAction,

    GetDurationAction,
]

export const isActionForMessage = <T extends WebsocketMessage>(
    action: WebsocketAction,
    message: T
): action is Extract<WebsocketAction, { requestName: T["requestName"] }> & { execute: (msg: T, websocketClient: WebsocketClient) => void } => {
    return action.requestName === message.requestName;
};


export const registerEvents = (websocketClient: WebsocketClient) => {
    const ws = websocketClient.getWebsocket();
    if (!ws) {
        console.error("Websocket is not initialized");
        return;
    }

    ws.onmessage = function (message) {
        try {
            const { data } = message;
            const parsed: WebsocketMessage = JSON.parse(data);

            const foundAction = eventHandlers.find(action => action.requestName === parsed.requestName);
            if (foundAction && isActionForMessage(foundAction, parsed)) {
                foundAction.execute(parsed, websocketClient);
            } else {
                console.log(`No handler found for event type: ${parsed.requestName}`);
                websocketClient.sendWebsocketMessage(
                    {
                        eventName: "Response",
                        status: "error",
                        message: `No handler found for event type: ${parsed.requestName}`,
                        requestName: parsed.requestName,
                        requestId: parsed.requestId ?? undefined
                    }
                )
            }
        } catch (error) {
            console.error("Error handling incoming message:", error);
            websocketClient.sendWebsocketMessage(
                {
                    eventName: "Response",
                    status: "error",
                    message: `Error handling message: ${error instanceof Error ? error.message : String(error)}`
                }
            );
        }
    };
}