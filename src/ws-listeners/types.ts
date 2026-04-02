export type WebsocketEvent<T> = {
    eventName: string;
    payload: T;
}