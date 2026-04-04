import { addSettings, defaultWebsocketAddress, defaultWebsocketPort, settings } from "./config/settings";
import { GetWebsocketStatusIcon, WebsocketConnectionStatus } from "./svg/WebsocketSvg";
import { WebsocketClient } from "./ws-api";
import PubSub from "pubsub-js";

const getStatusText = (status: WebsocketConnectionStatus): string => {
  switch (status) {
    case WebsocketConnectionStatus.CONNECTED:
      return "Websocket connected";
    case WebsocketConnectionStatus.DISCONNECTED:
      return "Websocket disconnected";
    case WebsocketConnectionStatus.CONNECTING:
      return "Websocket connecting";
    case WebsocketConnectionStatus.NOT_CONNECTED:
      return "Websocket not connected";
    default:
      return "Websocket status unknown";
  }
};

async function main() {
  // Wait for Spicetify to be ready
  while (!Spicetify?.showNotification) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  let status: WebsocketConnectionStatus = WebsocketConnectionStatus.NOT_CONNECTED;

  const btn = new Spicetify.ContextMenuV2.Item({
    children: getStatusText(status),
    leadingIcon: null,
    trailingIcon: GetWebsocketStatusIcon({ status }),
    onClick: () => {
      if (status === WebsocketConnectionStatus.DISCONNECTED || status === WebsocketConnectionStatus.NOT_CONNECTED) {
        reconnect();
      }
    },
    divider: false,
  });

  btn.register();

  PubSub.subscribe("websocket:status-change", () => {
    status = websocketClient.getStatus();
    btn.trailingIcon = GetWebsocketStatusIcon({ status });
    btn.children = getStatusText(status);
  });

  await addSettings();

  const websocketClient = new WebsocketClient();

  const reconnect = () => {
    websocketClient.reconnect();
  }
}

export default main;
