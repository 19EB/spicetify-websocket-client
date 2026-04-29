import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

type GetHeartPayload = {
    status : boolean;
}

function handleRequest(websocketClient : WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.GET_HEART>) {

    const response : WebsocketResponse<GetHeartPayload> = {
        eventName: "Response",
        status: "ok",
        requestName: WEBSOCKET_EVENT_TYPES.GET_HEART,
        requestId: websocketMessage.requestId,
        payload: {
            status : Spicetify.Player.getHeart()
        }
    }

    websocketClient.sendWebsocketMessage(response);
}

export const GetHeartAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.GET_HEART,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
}