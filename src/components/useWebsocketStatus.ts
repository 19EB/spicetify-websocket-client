import { useSyncExternalStore } from "react";
import PubSub from "pubsub-js";

import { WebsocketConnectionStatus } from "../svg/WebsocketSvg";

const getWebsocketStatusSnapshot = () => {
    return window.websocketClient?.getStatus() ?? WebsocketConnectionStatus.NOT_CONNECTED;
};

const subscribeToWebsocketStatus = (onStoreChange: () => void) => {
    const token = PubSub.subscribe("websocket:status-change", () => {
        onStoreChange();
    });

    return () => {
        PubSub.unsubscribe(token);
    };
};

export const useWebsocketStatus = () => {
    return useSyncExternalStore(
        subscribeToWebsocketStatus,
        getWebsocketStatusSnapshot,
        getWebsocketStatusSnapshot,
    );
};
