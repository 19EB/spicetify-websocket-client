import { registerEvents, registerListeners } from "./registers";
import { WebsocketClient } from "./ws-api";

async function main() {

  // Wait for Spicetify to be ready
  while (!Spicetify?.showNotification) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const client = WebsocketClient.getWebsocket();

  client.onerror = function () {
    console.log('Connection Error');
    Spicetify.showNotification("Websocket connection error");
  };

  client.onopen = function () {
    if (client.readyState === client.OPEN) {
      Spicetify.showNotification("Websocket connection established");
      // Register event listeners for outgoing events
      registerListeners();
      // Set up event handlers for incoming messages
      registerEvents();
    }
  };
  
  client.onclose = function () {
    console.log('WebSocket Client Closed');
  };
}

export default main;
