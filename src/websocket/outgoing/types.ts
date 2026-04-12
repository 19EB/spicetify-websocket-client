export enum WEBSOCKET_OUTGOING_EVENT_TYPE {
    SONG_CHANGED = "SongChanged",
}


export type WebsocketEvent<T> = {
    eventName: string;
    payload: T;
}