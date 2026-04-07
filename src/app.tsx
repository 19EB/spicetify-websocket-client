import { WebsocketButton } from "./components/WebsocketButton";
import { addSettings } from "./config/settings";
import { WebsocketClient } from "./ws-api";


const { React, ReactDOM } = Spicetify;

async function main() {
  // Wait for Spicetify to be ready
  while (!Spicetify?.showNotification) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await addSettings();

  const websocketClient = new WebsocketClient();
  globalThis.websocketClient = websocketClient;

  const extraControls = document.querySelector(".main-nowPlayingBar-extraControls");
  while (!extraControls) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (extraControls) {
    const newContainer = document.createElement("div");
    newContainer.style.pointerEvents = "all";
    extraControls.insertBefore(newContainer, extraControls.firstElementChild);
    ReactDOM.render(<WebsocketButton />, newContainer);
  }
}

export default main;
