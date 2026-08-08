# Reaching Spotify without Spicetify

How this extension talks to the Spotify desktop client with Spicetify absent, and the
evidence behind it. Verified against Spotify `1.2.95.453` (Chrome 146 / rspack).

## The mechanism

Spotify wires its platform services through a small dependency-injection registry.
Service tokens are **plain global symbols**, so once you hold the registry every API
is one call away:

```js
registry.resolve(Symbol.for("PlayerAPI"));   // === Spicetify.Platform.PlayerAPI
```

That the tokens are `Symbol.for` is not a guess. The token factory is a two-line module:

```js
17884(e,t,i){"use strict";
  function r(e){return Symbol.for(e)}          // <- makes a token
  function n(e){return e.description??e.toString()}
  i.d(t,{o:()=>n,u:()=>r})}
```

and every service module is a one-liner over it:

```js
70968(e,t,i){"use strict";i.d(t,{H:()=>r});let r=(0,i(17884).u)("PlayerAPI")}
```

## Getting the registry

The registry instance is **not** exported from any module, **not** on `window`, and
**not** resolvable from itself. It is passed down through React as a `registry` prop
very close to the root, so we duck-type it out of the fiber tree:

```js
v.resolve && v.resolveNoThrow && v._map instanceof Map
```

It is found ~23 fiber nodes from the root — effectively instant. See
`src/platform/registry.ts`.

## Why this approach

Routes that were tried and rejected, so they are not retried later:

| Route | Result |
|---|---|
| Push a fake chunk to capture the rspack `require` | Works (`req.m` available), but… |
| Scan `req.c` module cache for Platform | **`req.c` is not exposed** on this build |
| Instantiate modules and match exports against Platform | No module exports it — Spicetify *assembles* `Platform` itself |
| Find `Platform` in the React fiber tree | Not present (only the registry is) |
| `Platform.Registry.resolve(...)` | Works, but needs Spicetify to reach `Platform` |
| **Fiber-walk to the registry + `Symbol.for`** | **Works with zero Spicetify** |

## Verified on a vanilla client

With `spicetify restore` applied (`window.Spicetify === undefined`, only
`xpui-snapshot.js` loaded):

- registry found in 23 fiber nodes, **94 services** registered
- `PlayerAPI`, `PlaybackAPI`, `LibraryAPI`, `History`, `UserAPI`, `ConnectAPI`,
  `ProductStateAPI`, `RootlistAPI`, `PlaylistAPI` all resolve
- live read of real playback state succeeded

`window.__webpack_modules__` and `window.rspackChunkclient_web` are **native to
Spotify**, not Spicetify artifacts — both are present on a vanilla client. We do not
rely on either, but that is useful to know.

## Behaviour notes / gotchas

- **`Session` is not registry-registered.** Spicetify sources `Platform.Session`
  elsewhere. Resolve it differently if it is ever needed.
- **Volume:** `PlaybackAPI.getVolume()` is **async** on current clients, and the
  `_volume` field Spicetify reads is legacy. Use `getVolumeInternal()` for a
  synchronous read.
- **Mute:** `PlaybackAPI.getMuteHelper()` is a real service
  (`isMuted/mute/unmute/setMuted/toggleMute`) that remembers the pre-mute level.
  Spicetify instead *clicks the volume-bar DOM node*, which cannot work headless.
  We use the service.
- **Events:** there is exactly one bus —
  `PlayerAPI.getEvents().addListener("update", fn)`, which returns an unsubscribe
  function and delivers `{type, data}` where `data` is the complete player state.
  `songchange` / `onplaypause` / `onprogress` are *derived* by diffing consecutive
  payloads (this is what Spicetify does too). Native names such as `queue_update`
  are forwarded to the bus unchanged.
- Module IDs (`17884`, `70968`, …) are build-specific and **must not** be hardcoded.
  Nothing in `src/platform` depends on them; they appear here only as evidence.

## Reproducing the investigation

Spotify must be started with remote debugging, and it enforces single-instance — so
fully kill it first or the flag is silently ignored:

```powershell
Get-Process Spotify | Stop-Process -Force
Start-Process "$env:APPDATA\Spotify\Spotify.exe" -ArgumentList "--remote-debugging-port=9223"
```

Then attach to the `xpui` page over CDP (`http://127.0.0.1:9223/json/list`) and evaluate
the bootstrap from "Getting the registry" above. `npm run host` does exactly this and
logs the resolved service count, which is the quickest confirmation it still works:

```
[host] spotify restarted on debug port 9223
[ws-client] platform ready, 94 services resolved
```

If Spicetify is applied, it is the best available oracle for verifying a change to the
platform layer: `registry.resolve(Symbol.for("PlayerAPI"))` must be reference-equal to
`Spicetify.Platform.PlayerAPI`, and every `Player` getter must match its
`Spicetify.Player` counterpart.

Node-side code is `.mts` and runs directly on Node 22.18+/24 via native type
stripping — no build step.

`host/` and `scripts/` each carry their own `tsconfig.json` extending
`tsconfig.node.json`, because editors only auto-discover configs named exactly
`tsconfig.json` — the root one covers the browser code in `src/`. `npm run typecheck`
runs all three projects.
