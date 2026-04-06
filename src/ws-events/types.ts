export enum WEBSOCKET_EVENT_TYPES {
    NEXT_SONG = "NextSong",
    PREVIOUS_SONG = "PreviousSong",
    SET_VOLUME = "SetVolume",
}

type WebsocketMessageMap = {
    [WEBSOCKET_EVENT_TYPES.NEXT_SONG]: {}; // No payload expected for this event
    [WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG]: {}; // No payload expected for this event
    [WEBSOCKET_EVENT_TYPES.SET_VOLUME]: {volume: number};
}

export type WebsocketAction<K extends WEBSOCKET_EVENT_TYPES> = {
    eventName: K;
    execute: (payload: WebsocketMessageMap[K]) => void;
}

export type WebsocketMessage<K extends WEBSOCKET_EVENT_TYPES> = {
    eventName: K;
    payload: WebsocketMessageMap[K];
}