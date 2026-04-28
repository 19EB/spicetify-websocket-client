export enum WEBSOCKET_OUTGOING_EVENT_TYPE {
    SONG_CHANGED = "SongChanged",
    RESPONSE = "Response",
}

export type WebsocketEvent<T> = {
    eventName: string;
    payload?: T;
}

export interface WebsocketResponse<T> extends WebsocketEvent<T> {
    status: "ok" | "error";
    message?: string;
    requestName: string
    requestId?: string;
}

export type PlayerTrack = {
    type: string;
    uri: string;
    name: string;
    mediaType: string;
    duration: number;
    album: {
        uri: string;
        name: string;
        images?: {
            url: string;
            label: string;
        }[];
    };
    artists?: {
        uri: string;
        name: string;
    }[];
    images?: {
        url: string;
        label: string;
    } [];
}
