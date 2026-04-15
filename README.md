# spicetify-websocket-client

Unlock access to Spotify's Player API functionality, without premium.

`spicetify-websocket-client` is a [Spicetify](https://github.com/spicetify/cli) extension that enables websocket communication between Spotify desktop client and a websocket server.
It does two things:

- Sends outgoing events to the websocket server such as song change
- Receives incoming websocket events that control playback actions such as next song, previous song, and volume changes

The extension adds a small control button inside Spotify and exposes settings for the websocket address, port, endpoint, and auto-connect behavior.

## Features

Let your websocket control the Spotify application:

- play, pause or toggle play
- mute/unmute
- volume control
- play specific track by URl or URL
- skip forward, skip back or seek within a track
- set or toggle repeat
- set or toggle shuffle
- add or remove a track to or from a queue

Furthermore, your websocket server will receive a song change notification whenever a new track is being played in the Spotify app.

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

- `SongChanged`

Incoming events:

- `NextSong`
- `PreviousSong`
- `SetVolume`

## Sending websocket requests

Once this extension is connected to your websocket server, your server can send requests to perform various actions in the Spotify client. These requests are to be sent as JSON strings that are generally structured as follows:

```json5
{
   "eventName":"<request>",
   "payload":{              // Omitted unless required
      "<arg>": <value>
   }
}
```

### Basic requests

The requests `Play`, `Pause`, `TogglePlay`, `NextSong`, `Back`, `PreviousSong`, `ToggleShuffle`, `ToggleRepeat`, `DecreaseVolume`, `IncreaseVolume`, `ToggleMute` and `ToggleHeart` can simply be sent with their name as the value of `eventName`. 

#### Example: a `Play` request

```json5
{
    "eventName" : "Play"
}

```

### Requests with arguments

#### Requests using URI
To play a specific track, add that track to the queue or remove that track from the queue, we have `PlayUri`, `AddToQueueUri` and `RemoveFromQueueUri`. These requests must include the unique URI of the specificied track as the string argument `uri` inside `payload`. Every track in Spotify has a unique URI, formatted as `spotify:track:<id>`. Click [here](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) to learn more about Spotify URIs. 



#### Example: a `PlayUri` request

```json5
{
    "eventName" : "PlayUri",
    "payload" : {
        "uri" : "spotify:track:5cP52DlDN9yryuZVQDg3iq"
    }
}
```

#### Requests using URL
The requests `PlayUrl`, `AddToQueueURL` and `RemoveFromQueueUrl` work similarly, but require the song link instead, which is sent as the string argument `uri`.

#### Example: a `PlayUrl` request

```json5
{
    "eventName" : "PlayUrl",
    "payload" : {
        "url" : "https://open.spotify.com/track/3mRM4NM8iO7UBqrSigCQFH?si=eeaec6fba1a74821"
    }
}
```




## Integrating with Streamer.bot

This project was initially created to be used with a custom websocket server in [Streamer.bot](https://streamer.bot/)

_TODO_ Collection of streamerbot C# scripts that can be used, along with handling the handshake

## Developer notes

If you want to extend the websocket event system, see the dedicated guides:

- Incoming events: [src/websocket/incoming/README.md](src/websocket/incoming/README.md)
- Outgoing events: [src/websocket/outgoing/README.md](src/websocket/outgoing/README.md)
