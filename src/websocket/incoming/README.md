# Incoming Request Handlers

This folder contains websocket event handlers for messages received from the server.

Each file in this folder translates one incoming websocket message into a Spicetify action.

Current handlers:

- `next-song.ts`
- `previous-song.ts`
- `set-volume.ts`

## How Incoming Requests Work

The shared event names and payload types live in `types.ts`.

Each handler file exports a `WebsocketAction` with two pieces:

- `eventName`: the incoming websocket event name
- `execute(payload)`: the function that runs when that event is received

At runtime, `src/websocket/registry.ts` parses the websocket message, finds the matching action by `eventName`, and calls `execute(payload)`.

## Adding A New Incoming Handler

Suppose you want to add an incoming event named `TogglePlay`.

### 1. Add the event type

Update `types.ts`.

```ts
export enum WEBSOCKET_EVENT_TYPES {
    NEXT_SONG = "NextSong",
    PREVIOUS_SONG = "PreviousSong",
    SET_VOLUME = "SetVolume",
    TOGGLE_PLAY = "TogglePlay",
}

type WebsocketMessageMap = {
    [WEBSOCKET_EVENT_TYPES.NEXT_SONG]: {};
    [WEBSOCKET_EVENT_TYPES.PREVIOUS_SONG]: {};
    [WEBSOCKET_EVENT_TYPES.SET_VOLUME]: { volume: number };
    [WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY]: {};
}
```

If your event needs data, add the payload shape to `WebsocketMessageMap`.

Example:

```ts
[WEBSOCKET_EVENT_TYPES.SEEK]: { position: number };
```

### 2. Create a handler file

Create a new file in this folder.

Example: `toggle-play.ts`

```ts
import { WebsocketClient } from "../client";
import { WebsocketResponse } from "../outgoing/types";
import { WEBSOCKET_EVENT_TYPES, WebsocketAction, WebsocketMessageGuard } from "./types";

function togglePlay() {
    Spicetify.Player.togglePlay();
}

function respond(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY>) {

    const requestId = websocketMessage.requestId;
    const callback = websocketMessage.callback;

    if (callback == undefined || callback === true) {
        const response : WebsocketResponse<null> = {
            eventName: "Response",
            status: "ok",
            requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY,
            requestId: requestId
        };

        websocketClient.sendWebsocketMessage(response);
    }
}

function handleRequest(websocketClient: WebsocketClient, websocketMessage: WebsocketMessageGuard<WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY>) {
    togglePlay();
    respond(websocketClient, websocketMessage);
}

export const TogglePlayAction : WebsocketAction = {
    requestName: WEBSOCKET_EVENT_TYPES.TOGGLE_PLAY,
    execute: (message, websocketClient) => handleRequest(websocketClient, message)
};
```

### 3. Register the new handler

Import the action in `../registry.ts` and add it to the `eventHandlers` array.

```ts
import { TogglePlayAction } from "./incoming/toggle-play";

const eventHandlers = [
    NextSongAction,
    PreviousSongAction,
    SetVolumeAction,
    TogglePlayAction,
];
```

If you do not register it, the websocket message will be parsed but never executed.

### 4. Send the matching message from the server

Incoming messages must match the shape defined in `types.ts`.

Example without payload:

```json
{
  "eventName": "TogglePlay",
  "payload": {}
}
```

Example with payload:

```json
{
  "eventName": "SetVolume",
  "payload": {
    "level": 50
  }
}
```

## Guidelines

- Keep one incoming event per file.
- Keep handler files small and focused.
- Put shared event names and payload types in `types.ts`.
- Validate or clamp payload values when needed.
- Always register the new action in `../registry.ts`.

## Checklist

- Add the event name to `WEBSOCKET_EVENT_TYPES`
- Add the payload shape to `WebsocketMessageMap`
- Create a new handler file in this folder
- Export a `WebsocketAction`
- Register the action in `../registry.ts`
- Send the matching `eventName` and `payload` from the websocket server