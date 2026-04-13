export enum WEBSOCKET_EVENT_TYPES {
    NEXT_SONG = "NextSong",
    PREVIOUS_SONG = "PreviousSong",
    SET_VOLUME = "SetVolume",
}

type CommonWebsocketMessage = {
    requestId?: string; // Optional requestId for correlating requests and responses
}

type WebsocketMessageMap = {
    [WEBSOCKET_EVENT_TYPES.NEXT_SONG]: {}; // No payload expected for this event
    [WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG]: {}; // No payload expected for this event
    [WEBSOCKET_EVENT_TYPES.SET_VOLUME]: { volume: number };
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