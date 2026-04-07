const { React } = Spicetify;

export enum WebsocketConnectionStatus {
  CONNECTED = "connected",
  CONNECTION_ERROR = "connection_error",
  CONNECTING = "connecting",
  NOT_CONNECTED = "not_connected",
}

type Props = {
  status: WebsocketConnectionStatus;
  size?: number;
}

export const GetWebsocketStatusIcon = (props: Props) => {
  const { status } = props;
  let color: string;
  switch (status) {
    case WebsocketConnectionStatus.CONNECTED:
      color = "#10b981";
      break;
    case WebsocketConnectionStatus.CONNECTION_ERROR:
      color = "#f43f5e";
      break;
    case WebsocketConnectionStatus.CONNECTING:
      color = "#facc15";
      break;
    case WebsocketConnectionStatus.NOT_CONNECTED:
      color = "gray";
      break;
    default:
      color = "gray";
  }
  return getSvgWithColor(color);
}

export const getStatusText = (status: WebsocketConnectionStatus): string => {
  switch (status) {
    case WebsocketConnectionStatus.CONNECTED:
      return "Websocket connected";
    case WebsocketConnectionStatus.CONNECTION_ERROR:
      return "Websocket connection error";
    case WebsocketConnectionStatus.CONNECTING:
      return "Websocket connecting";
    case WebsocketConnectionStatus.NOT_CONNECTED:
      return "Websocket not connected";
    default:
      return "Websocket status unknown";
  }
};

export const ConnectionStatus = (props: Props) => {
  const { status, size = 16 } = props;

  let color: string;
  switch (status) {
    case WebsocketConnectionStatus.CONNECTED:
      color = "#10b981";
      break;
    case WebsocketConnectionStatus.CONNECTION_ERROR:
      color = "#f43f5e";
      break;
    case WebsocketConnectionStatus.CONNECTING:
      color = "#facc15";
      break;
    case WebsocketConnectionStatus.NOT_CONNECTED:
      color = "gray";
      break;
    default:
      color = "gray";
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 193"><path fill={color} d="M192.44 144.645h31.78V68.339l-35.805-35.804l-22.472 22.472l26.497 26.497v63.14Zm31.864 15.931H113.452L86.954 134.08l11.237-11.236l21.885 21.885h45.028l-44.357-44.441l11.32-11.32l44.357 44.358v-45.03l-21.801-21.801l11.152-11.153L110.685 0H0l31.696 31.696v.084h65.74l23.227 23.227l-33.96 33.96L63.476 65.74V47.712h-31.78v31.193l55.007 55.007L64.314 156.3l35.805 35.805H256l-31.696-31.529Z" /></svg>
  );
}

const getSvgWithColor = (color: string) => {
  const WebsocketSvgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 193"><path fill="${color}" d="M192.44 144.645h31.78V68.339l-35.805-35.804l-22.472 22.472l26.497 26.497v63.14Zm31.864 15.931H113.452L86.954 134.08l11.237-11.236l21.885 21.885h45.028l-44.357-44.441l11.32-11.32l44.357 44.358v-45.03l-21.801-21.801l11.152-11.153L110.685 0H0l31.696 31.696v.084h65.74l23.227 23.227l-33.96 33.96L63.476 65.74V47.712h-31.78v31.193l55.007 55.007L64.314 156.3l35.805 35.805H256l-31.696-31.529Z"/></svg>`;
  return WebsocketSvgStr;
}