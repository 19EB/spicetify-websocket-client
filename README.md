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

#### Outgoing events
The extension currently emits the following outgoing event to the server.

- `SongChanged`
Whenever the song is changed or upon initial connection, a `SongChanged` event is sent with information about the newly playing track:
```json5
{
    "eventName": "SongChanged",
    "payload": {
        "title": "SongName by ArtistName",
        "artist": "ArtistName",
        "song": "SongName"
    }
}
```

#### Incoming events
The extension listens to the following incoming events (requests) from the server. These requests are to be sent as JSON strings that are generally structured as follows:

```json5
{
   "eventName": "<request>",
   "payload": {              // Omitted unless required
      "<arg>": <value>
   }
}
```

##### `Play`
Resumes playback.
```json5
{ "eventName": "Play" }
```

##### `Pause`
Pauses playback.
```json5
{ "eventName": "Pause" }
```

##### `TogglePlay`
Toggles between play and pause.
```json5
{ "eventName": "TogglePlay" }
```

##### `NextSong`
Skips to the next song.
```json5
{ "eventName": "NextSong" }
```

##### `PreviousSong`
Plays the previous song.
```json5
{ "eventName": "PreviousSong" }
```

##### `Back`
Skips back to the beginning of the track or the previous song.
```json5
{ "eventName": "Back" }
```

##### `ToggleShuffle`
Toggles the shuffle state.
```json5
{ "eventName": "ToggleShuffle" }
```

##### `ToggleRepeat`
Toggles the repeat state.
```json5
{ "eventName": "ToggleRepeat" }
```

##### `DecreaseVolume`
Decreases the volume.
```json5
{ "eventName": "DecreaseVolume" }
```

##### `IncreaseVolume`
Increases the volume.
```json5
{ "eventName": "IncreaseVolume" }
```

##### `ToggleMute`
Toggles between muted and unmuted.
```json5
{ "eventName": "ToggleMute" }
```

##### `ToggleHeart`
Toggles the like/heart status of the current track.
```json5
{ "eventName": "ToggleHeart" }
```

##### `ClearQueue`
Clears the user's queue.
```json5
{ "eventName": "ClearQueue" }
```

##### `PlayUri`
Plays a track based on its Spotify URI.
```json5
{
    "eventName": "PlayUri",
    "payload": {
        "uri": "spotify:track:5cP52DlDN9yryuZVQDg3iq"
    }
}
```

##### `AddToQueueUri`
Adds a track to the queue based on its Spotify URI.
```json5
{
    "eventName": "AddToQueueUri",
    "payload": {
        "uri": "spotify:track:5cP52DlDN9yryuZVQDg3iq"
    }
}
```

##### `RemoveFromQueueUri`
Removes a track from the queue based on its Spotify URI.
```json5
{
    "eventName": "RemoveFromQueueUri",
    "payload": {
        "uri": "spotify:track:5cP52DlDN9yryuZVQDg3iq"
    }
}
```

##### `PlayUrl`
Plays a track based on its Spotify URL.
```json5
{
    "eventName": "PlayUrl",
    "payload": {
        "url": "https://open.spotify.com/track/3mRM4NM8iO7UBqrSigCQFH?si=eeaec6fba1a74821"
    }
}
```

##### `AddToQueueUrl`
Adds a track to the queue based on its Spotify URL.
```json5
{
    "eventName": "AddToQueueUrl",
    "payload": {
        "url": "https://open.spotify.com/track/3mRM4NM8iO7UBqrSigCQFH?si=eeaec6fba1a74821"
    }
}
```

##### `RemoveFromQueueUrl`
Removes a track from the queue based on its Spotify URL.
```json5
{
    "eventName": "RemoveFromQueueUrl",
    "payload": {
        "url": "https://open.spotify.com/track/3mRM4NM8iO7UBqrSigCQFH?si=eeaec6fba1a74821"
    }
}
```

##### `AddToQueueContextTracks`
Adds an array of context tracks to the queue.
```json5
{
    "eventName": "AddToQueueContextTracks",
    "payload": {
        "contextTracks": [
            { "uri": "spotify:track:5cP52DlDN9yryuZVQDg3iq" }
        ]
    }
}
```

##### `RemoveFromQueueContextTracks`
Removes an array of context tracks from the queue.
```json5
{
    "eventName": "RemoveFromQueueContextTracks",
    "payload": {
        "contextTracks": [
            { "uri": "spotify:track:5cP52DlDN9yryuZVQDg3iq" }
        ]
    }
}
```

##### `SetShuffle`
Sets the shuffle state (true or false).
```json5
{
    "eventName": "SetShuffle",
    "payload": {
        "state": true
    }
}
```

##### `SetMute`
Sets the mute state (true or false).
```json5
{
    "eventName": "SetMute",
    "payload": {
        "state": true
    }
}
```

##### `SetHeart`
Sets the like/heart status of a track (true or false).
```json5
{
    "eventName": "SetHeart",
    "payload": {
        "status": true
    }
}
```

##### `SetVolume`
Sets the volume level (number, 0 to 100).
```json5
{
    "eventName": "SetVolume",
    "payload": {
        "level": 50
    }
}
```

##### `SetRepeat`
Sets the repeat mode (number, e.g., 0, 1, 2).
```json5
{
    "eventName": "SetRepeat",
    "payload": {
        "mode": 1
    }
}
```

##### `Seek`
Seeks to a specific position (number of milliseconds from start).
```json5
{
    "eventName": "Seek",
    "payload": {
        "position": 60000
    }
}
```

##### `SkipForward`
Skips forward by the specified amount (number of milliseconds).
```json5
{
    "eventName": "SkipForward",
    "payload": {
        "amount": 15000
    }
}
```

##### `SkipBack`
Skips backward by the specified amount (number of milliseconds).
```json5
{
    "eventName": "SkipBack",
    "payload": {
        "amount": 15000
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
