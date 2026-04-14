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
}

type CommonWebsocketMessage = {
    requestId?: string; // Optional requestId for correlating requests and responses
}

type WebsocketMessageMap = {
    [WEBSOCKET_EVENT_TYPES.PLAY]: {}; //done
    [WEBSOCKET_EVENT_TYPES.PLAY_URI]: { uri: string }; //done
    [WEBSOCKET_EVENT_TYPES.PLAY_URL]: { url: string}; //done
    [WEBSOCKET_EVENT_TYPES.PAUSE]: {}; //done
    [WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY]: {}; //done
    [WEBSOCKET_EVENT_TYPES.NEXT_SONG]: {}; //done
    [WEBSOCKET_EVENT_TYPES.BACK]: {}; //done
    [WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG]: {}; //done
    [WEBSOCKET_EVENT_TYPES.SKIP_FORWARD]: { amount : number }; //done
    [WEBSOCKET_EVENT_TYPES.SKIP_BACK]: { amount : number }; //done
    [WEBSOCKET_EVENT_TYPES.SEEK] : { position : number }; //done
    [WEBSOCKET_EVENT_TYPES.SET_SHUFFLE]: {state: boolean }; //done
    [WEBSOCKET_EVENT_TYPES.TOGGLE_SHUFFLE]: {}; //done
    [WEBSOCKET_EVENT_TYPES.SET_REPEAT]: { mode : number };
    [WEBSOCKET_EVENT_TYPES.TOGGLE_REPEAT]: {};
    [WEBSOCKET_EVENT_TYPES.SET_VOLUME]: { level: number }; //done
    [WEBSOCKET_EVENT_TYPES.DECREASE_VOLUME]: {}; //done
    [WEBSOCKET_EVENT_TYPES.INCREASE_VOLUME]: {}; //done
    [WEBSOCKET_EVENT_TYPES.SET_MUTE]: { state: boolean }; 
    [WEBSOCKET_EVENT_TYPES.TOGGLE_MUTE]: {};
}

export type WebsocketMessageGuard<K extends WEBSOCKET_EVENT_TYPES> = {
    eventName: K;
    payload: WebsocketMessageMap[K];
} & CommonWebsocketMessage;

export type WebsocketAction = {
    [K in WEBSOCKET_EVENT_TYPES]: {
        eventName: K;
        execute: (message: WebsocketMessageGuard<K>) => void;
    }
}[WEBSOCKET_EVENT_TYPES];

export type WebsocketMessage = {
    [K in WEBSOCKET_EVENT_TYPES]: {
        requestId?: string; // Optional requestId for correlating requests and responses
        eventName: K;
        payload: WebsocketMessageMap[K];
    } & CommonWebsocketMessage;
}[WEBSOCKET_EVENT_TYPES];