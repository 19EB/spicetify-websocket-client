# Outgoing Event Handlers

This folder contains websocket event handlers for messages sent from Spotify to the server.

Each file in this folder listens to a Spotify event, builds a websocket payload, and sends it through the websocket client.

Current handlers:

- `song-change.ts`

## How Outgoing Events Work

The shared outgoing event names and message shape live in `types.ts`.

Each outgoing handler file usually does three things:

- listen to a Spotify event
- build the outgoing payload
- call `websocketClient.sendWebsocketMessage(...)`

At runtime, `src/websocket/registry.ts` calls `registerListeners(...)`, which registers the outgoing listeners when the websocket connection opens.

## Adding A New Outgoing Handler

Suppose you want to send an outgoing event named `PlayPauseChanged` whenever Spotify play state changes.

### 1. Add the outgoing event type

Update `types.ts`.

```ts
export enum WEBSOCKET_OUTGOING_EVENT_TYPE {
    UPDATE_SONG = "UpdateSong",
    PLAY_PAUSE_CHANGED = "PlayPauseChanged",
}
```

If you want stronger typing later, this file is also the right place to expand the shared outgoing event model.

### 2. Create a new handler file

Create a new file in this folder.

Example: `play-pause-change.ts`

```ts
import { WebsocketClient } from "../client";
import { WEBSOCKET_OUTGOING_EVENT_TYPE, WebsocketEvent } from "./types";

type PlayPauseChangedPayload = {
    isPlaying: boolean;
};

const handlePlayPauseChange = (websocketClient: WebsocketClient) => {
    const payload: PlayPauseChangedPayload = {
        isPlaying: Spicetify.Player.isPlaying(),
    };

    const message: WebsocketEvent<PlayPauseChangedPayload> = {
        eventName: WEBSOCKET_OUTGOING_EVENT_TYPE.PLAY_PAUSE_CHANGED,
        payload,
    };

    websocketClient.sendWebsocketMessage(message);
};

export const registerPlayPauseChangeListener = (websocketClient: WebsocketClient) => {
    Spicetify.Player.addEventListener("onplaypause", () => handlePlayPauseChange(websocketClient));
};
```

### 3. Register the new listener

Import the registration function in `../registry.ts` and call it inside `registerListeners(...)`.

```ts
import { registerPlayPauseChangeListener } from "./outgoing/play-pause-change";

export const registerListeners = (websocketClient: WebsocketClient) => {
    if (listenersRegistered) {
        return;
    }

    registerSongChangeListener(websocketClient);
    registerPlayPauseChangeListener(websocketClient);
    listenersRegistered = true;
}
```

If you do not register it, the listener file exists but never runs.

### 4. Make sure the server expects the message

Your websocket server must handle the same `eventName` and payload shape that the client sends.

Example:

```json
{
  "eventName": "PlayPauseChanged",
  "payload": {
    "isPlaying": true
  }
}
```

## Existing Pattern In This Folder

The current `song-change.ts` handler is the reference implementation:

- it listens to `Spicetify.Player` song change events
- it builds a typed payload with song and artist data
- it wraps that payload in a `WebsocketEvent`
- it sends the message through `websocketClient.sendWebsocketMessage(...)`
- it emits one message immediately on registration so the server gets the current song without waiting for the next change

## Guidelines

- Keep one outgoing event per file.
- Keep payload-building logic close to the listener that uses it.
- Put shared outgoing event names in `types.ts`.
- Register every new listener in `../registry.ts`.
- Prefer explicit payload types for each outgoing event.
- If the server needs the current state immediately, send an initial message during registration.

## Checklist

- Add the event name to `WEBSOCKET_OUTGOING_EVENT_TYPE`
- Create a new handler file in this folder
- Define the payload type for that event
- Build a `WebsocketEvent<T>` message
- Send it with `websocketClient.sendWebsocketMessage(...)`
- Register the listener in `../registry.ts`
- Make sure the websocket server expects the same `eventName` and payload shape