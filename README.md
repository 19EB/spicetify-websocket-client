# spicetify-websocket-client

`spicetify-websocket-client` is a [Spicetify](https://github.com/spicetify/cli) extension that enables websocket communication between Spotify desktop client and a websocket server.

It does two things:

- Sends outgoing events to the websocket server such as song change
- Receives incoming websocket events that control playback actions such as next song, previous song, and volume changes

The extension adds a small control button inside Spotify and exposes settings for the websocket address, port, endpoint, and auto-connect behavior.

## Prerequisites

Before building this extension, make sure you have:

- [Node.js](https://nodejs.org/) and `npm`
- the Spotify desktop client
- [Spicetify CLI](https://github.com/spicetify/cli) installed and working
- a valid Spicetify setup that has already been applied to Spotify at least once

## Build

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

or build and apply immediately:

```bash
npm start
```

this is the same as

```bash
npm run build
spicetify apply
```

## Add to Spicetify Config

After building, enable the extension in Spicetify:

```bash
spicetify config extensions spicetify-websocket-client.js
spicetify apply
```

If the extension was installed successfully, a websocket icon should appear at the bottom right

![Image of spotify play bar with websocket button](image-2.png)

## Websocket behavior

### Websocket settings

The extension adds its websocket configuration to Spotify settings under `Websocket integration`.

Available settings:

- `Address` default: `127.0.0.1`
- `Port` default: `9090`
- `Endpoint` default: `/`
- `Start on launch` default: `false`


### Websocket events

Outgoing event:

- `UpdateSong`

Incoming events:

- `NextSong`
- `PreviousSong`
- `SetVolume`

## Event payloads

_TODO_ Examples of every outgoing and incoming event payload

## Integrating with Streamer.bot

This project was initially created to be used with a custom websocket server in [Streamer.bot](https://streamer.bot/)

_TODO_ Collection of streamerbot C# scripts that can be used, along with handling the handshake

## Developer notes

If you want to extend the websocket event system, see the dedicated guides:

- Incoming events: [src/websocket/incoming/README.md](src/websocket/incoming/README.md)
- Outgoing events: [src/websocket/outgoing/README.md](src/websocket/outgoing/README.md)
