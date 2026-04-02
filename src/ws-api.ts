import { WebsocketEvent } from "./ws-listeners/types";

export abstract class WebsocketClient {

    private static ws: WebSocket | null = null;

    public static getWebsocket() {
        if(!this.ws) {
            this.ws = new WebSocket('ws://127.0.0.1:9090/sb-test');
        }
        return this.ws;
    }

    public static sendWebsocketMessage = <T extends WebsocketEvent<any>>(payload: T) => {
        const ws = this.getWebsocket();
        if (ws.readyState === ws.OPEN) {
            console.log('Sending message to server');
            ws.send(JSON.stringify(payload));
        } else {
            console.log('WebSocket is not open. Ready state: ' + ws.readyState);
        }
    }
}