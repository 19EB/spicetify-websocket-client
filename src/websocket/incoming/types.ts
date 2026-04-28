import { WebsocketClient } from "../client";

export enum WEBSOCKET_EVENT_TYPES {
    PLAY = "Play",
    PLAY_URI = "PlayUri",
    PLAY_URL = "PlayUrl",
    PAUSE = "Pause",
    TOGGLE_PLAY = "TogglePlay",
    NEXT_SONG = "NextSong",
    BACK = "Back",
    PREVIOUS_SONG = "PreviousSong",
    SKIP_FORWARD = "SkipForward",
    SKIP_BACK = "SkipBack",
    SEEK = "Seek",
    SET_SHUFFLE = "SetShuffle",
    TOGGLE_SHUFFLE = "ToggleShuffle",
    SET_REPEAT = "SetRepeat",
    TOGGLE_REPEAT = "ToggleRepeat",
    SET_VOLUME = "SetVolume",
    DECREASE_VOLUME = "DecreaseVolume",
    INCREASE_VOLUME = "IncreaseVolume",
    SET_MUTE = "SetMute",
    TOGGLE_MUTE = "ToggleMute",
    ADD_TO_QUEUE_URI = "AddToQueueUri",
    ADD_TO_QUEUE_URL = "AddToQueueUrl",
    REMOVE_FROM_QUEUE_URI = "RemoveFromQueueUri",
    REMOVE_FROM_QUEUE_URL = "RemoveFromQueueUrl",
    CLEAR_QUEUE = "ClearQueue",
    SET_HEART = "SetHeart",
    TOGGLE_HEART = "ToggleHeart"
}

type CommonWebsocketMessage = {
    requestId?: string; // Optional requestId for correlating requests and responses
    callback?: boolean; // Whether a response should be sent
}

type WebsocketMessageMap = {
    [WEBSOCKET_EVENT_TYPES.PLAY]: {}; //done
    [WEBSOCKET_EVENT_TYPES.PLAY_URI]: { uri: string }; //done
    [WEBSOCKET_EVENT_TYPES.PLAY_URL]: { url: string }; //done
    [WEBSOCKET_EVENT_TYPES.PAUSE]: {}; //done
    [WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY]: {}; //done
    [WEBSOCKET_EVENT_TYPES.NEXT_SONG]: {}; //done
    [WEBSOCKET_EVENT_TYPES.BACK]: {}; //done
    [WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG]: {}; //done
    [WEBSOCKET_EVENT_TYPES.SKIP_FORWARD]: { amount: number }; //done
    [WEBSOCKET_EVENT_TYPES.SKIP_BACK]: { amount: number }; //done
    [WEBSOCKET_EVENT_TYPES.SEEK]: { position: number }; //done
    [WEBSOCKET_EVENT_TYPES.SET_SHUFFLE]: { state: boolean }; //done
    [WEBSOCKET_EVENT_TYPES.TOGGLE_SHUFFLE]: {}; //done
    [WEBSOCKET_EVENT_TYPES.SET_REPEAT]: { mode: 0 | 1 | 2 };
    [WEBSOCKET_EVENT_TYPES.TOGGLE_REPEAT]: {};
    [WEBSOCKET_EVENT_TYPES.SET_VOLUME]: { level: number }; //done
    [WEBSOCKET_EVENT_TYPES.DECREASE_VOLUME]: {}; //done
    [WEBSOCKET_EVENT_TYPES.INCREASE_VOLUME]: {}; //done
    [WEBSOCKET_EVENT_TYPES.SET_MUTE]: { state: boolean }; //done
    [WEBSOCKET_EVENT_TYPES.TOGGLE_MUTE]: {}; //done
    [WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URI]: { uri: string };
    [WEBSOCKET_EVENT_TYPES.ADD_TO_QUEUE_URL]: { url: string };
    [WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_URI]: { uri: string };
    [WEBSOCKET_EVENT_TYPES.REMOVE_FROM_QUEUE_URL]: { url: string };
    [WEBSOCKET_EVENT_TYPES.CLEAR_QUEUE]: {};
    [WEBSOCKET_EVENT_TYPES.SET_HEART]: { status: boolean };
    [WEBSOCKET_EVENT_TYPES.TOGGLE_HEART]: {};
}

export type WebsocketMessageGuard<K extends WEBSOCKET_EVENT_TYPES> = {
    requestName: K;
    payload: WebsocketMessageMap[K];
} & CommonWebsocketMessage;

export type WebsocketAction = {
    [K in WEBSOCKET_EVENT_TYPES]: {
        requestName: K;
        execute: (message: WebsocketMessageGuard<K>, websocketClient: WebsocketClient) => void;
    }
}[WEBSOCKET_EVENT_TYPES];

export type WebsocketMessage = {
    [K in WEBSOCKET_EVENT_TYPES]: {
        requestId?: string; // Optional requestId for correlating requests and responses
        callback?: boolean; // Whether a response should be sent
        requestName: K;
        payload: WebsocketMessageMap[K];
    } & CommonWebsocketMessage;
}[WEBSOCKET_EVENT_TYPES];

export type ContextTrack = {
    uri: string;
    uid?: string | null;
    metadata?: Spicetify.Metadata;
}


