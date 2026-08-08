import { WebsocketButton } from "./ui/components/WebsocketButton";
import { addSettings } from "./config/settings";
import { WebsocketClient } from "./websocket/client";
import { asyncElement } from "./dom/await-element";
import { bootstrapPlatform } from "./platform";
import { setNotifier } from "./log/notify";

const { React, ReactDOM } = Spicetify;

async function main() {
  // Wait for Spicetify to be ready
  while (!Spicetify?.showNotification || !Spicetify?.Player) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  setNotifier((message, isError) => Spicetify.showNotification(message, isError));

  // Resolve Spotify's service registry before any handler runs. Every handler depends
  // on it, so if it cannot be found we skip the websocket client but still load the
  // settings and the button, rather than failing the whole extension.
  let platformReady = false;
  try {
    await bootstrapPlatform();
    platformReady = true;
  } catch (error) {
    console.error("Websocket client: could not reach Spotify's platform APIs.", error);
    Spicetify.showNotification("Websocket client could not start, see the console", true);
  }

  await addSettings();

  if (platformReady) {
    const websocketClient = new WebsocketClient();
    globalThis.websocketClient = websocketClient;
  }

  const extraControls = await asyncElement<HTMLElement>(".main-nowPlayingBar-extraControls");
  if (extraControls) {
    const newContainer = document.createElement("div");
    newContainer.style.pointerEvents = "all";
    extraControls.insertBefore(newContainer, extraControls.firstElementChild);
    ReactDOM.render(<WebsocketButton />, newContainer);
  } else {
    console.error("Could not find extra controls element");
  }
}

export default main;
