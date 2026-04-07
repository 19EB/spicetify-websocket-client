export enum WEBSOCKET_OUTGOING_EVENT_TYPE {
    UPDATE_SONG = "UpdateSong",
}


export type WebsocketEvent<T> = {
    eventName: string;
    payload: T;
}