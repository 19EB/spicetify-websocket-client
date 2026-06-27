export enum WEBSOCKET_OUTGOING_EVENT_TYPE {
    INITIAL_STATE = "InitialState",
    SONG_CHANGED = "SongChanged",
    QUEUE_CHANGED = "QueueChanged",
    PLAY_PAUSE_CHANGED = "PlayPauseChanged",
    VOLUME_CHANGED = "VolumeChanged",
    RESPONSE = "Response"
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

export type PlayerState = {
    isPlaying: boolean;
    progress: number;
    duration: number;
    isMuted: boolean;
    volume: number;
    isShuffling: boolean;
    repeatMode: number;
    currentTrack: PlayerTrack;
    previousTrack?: PlayerTrack;
    nextTracks?: PlayerTrack[];
}
