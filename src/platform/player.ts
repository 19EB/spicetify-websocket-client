// Drop-in replacement for Spicetify.Player, built on services resolved from Spotify's
// own registry. Behaviour mirrors Spicetify's wrapper so existing handlers keep working,
// except that mute uses Spotify's MuteHelper service (Spicetify clicks a DOM node, which
// cannot work headless) and getVolume reads getVolumeInternal() (the _volume field
// Spicetify reads is legacy, and getVolume() is async on current clients).

import { getService } from "./registry";
import type {
  HistoryApi,
  LibraryApi,
  MuteHelper,
  PlaybackApi,
  PlayerApi,
  PlayerEvent,
  PlayerState,
  Unsubscribe,
} from "./types";

const playerApi = (): PlayerApi => getService<PlayerApi>("PlayerAPI");
const playbackApi = (): PlaybackApi => getService<PlaybackApi>("PlaybackAPI");
const libraryApi = (): LibraryApi => getService<LibraryApi>("LibraryAPI");

const DEFAULT_SKIP_MS = 15_000;
const REPEAT_MODES = 3;

// Events we synthesise by diffing consecutive `update` payloads. Any other name is
// forwarded to Spotify's native emitter, which is how queue_update keeps working.
const DERIVED_EVENTS = ["songchange", "onplaypause", "onprogress"] as const;
type DerivedEvent = (typeof DERIVED_EVENTS)[number];

const isDerived = (type: string): type is DerivedEvent =>
  (DERIVED_EVENTS as readonly string[]).includes(type);

type Listener = (event: PlayerEvent) => void;

const derivedListeners = new Map<DerivedEvent, Set<Listener>>();
const nativeHandles = new Map<string, Map<Listener, Unsubscribe>>();

let updateSubscription: Unsubscribe | null = null;
let lastState: PlayerState | null = null;

const emit = (type: DerivedEvent, data: PlayerState) => {
  const listeners = derivedListeners.get(type);
  if (!listeners) return;
  for (const listener of listeners) {
    try {
      listener({ type, data });
    } catch (error) {
      console.error(`Player event listener for "${type}" threw`, error);
    }
  }
};

const onUpdate = (event: PlayerEvent) => {
  const next = event?.data;
  if (!next) return;
  const previous = lastState;
  lastState = next;

  if (!previous) return; // first payload establishes the baseline only

  if (previous.item?.uri !== next.item?.uri) emit("songchange", next);
  if (previous.isPaused !== next.isPaused) emit("onplaypause", next);
  if (previous.positionAsOfTimestamp !== next.positionAsOfTimestamp) emit("onprogress", next);
};

const ensureUpdateSubscription = () => {
  if (updateSubscription) return;
  lastState = playerApi()._state ?? null;
  updateSubscription = playerApi().getEvents().addListener("update", onUpdate);
};

export const Player = {
  get data(): PlayerState {
    return playerApi()._state;
  },

  get origin(): PlayerApi {
    return playerApi();
  },

  play(): void {
    void playerApi().resume();
  },

  pause(): void {
    void playerApi().pause();
  },

  togglePlay(): void {
    if (Player.isPlaying()) Player.pause();
    else Player.play();
  },

  isPlaying(): boolean {
    return !playerApi()._state.isPaused;
  },

  next(): void {
    void playerApi().skipToNext();
  },

  back(): void {
    void playerApi().skipToPrevious();
  },

  skipForward(byMs: number = DEFAULT_SKIP_MS): void {
    void playerApi().seekForward(byMs);
  },

  skipBack(byMs: number = DEFAULT_SKIP_MS): void {
    void playerApi().seekBackward(byMs);
  },

  // A non-integer value in 0..1 is a fraction of the track, anything else is absolute
  // milliseconds, matching Spicetify.
  seek(position: number): void {
    const { duration } = playerApi()._state;
    const target =
      !Number.isInteger(position) && position >= 0 && position <= 1
        ? Math.round(position * duration)
        : position;
    void playerApi().seekTo(target);
  },

  async playUri(uri: string, context: unknown = {}, options: unknown = {}): Promise<void> {
    return playerApi().play({ uri }, context, options);
  },

  getProgress(): number {
    const state = playerApi()._state;
    const elapsed = state.isPaused ? 0 : Date.now() - state.timestamp;
    return elapsed + state.positionAsOfTimestamp;
  },

  getProgressPercent(): number {
    const { duration } = playerApi()._state;
    return duration ? Player.getProgress() / duration : 0;
  },

  getDuration(): number {
    return playerApi()._state.duration;
  },

  getVolume(): number {
    return playbackApi().getVolumeInternal();
  },

  setVolume(level: number): void {
    void playbackApi().setVolume(level);
  },

  increaseVolume(): void {
    void playbackApi().raiseVolume();
  },

  decreaseVolume(): void {
    void playbackApi().lowerVolume();
  },

  getMute(): boolean {
    try {
      return playbackApi().getMuteHelper().isMuted();
    } catch {
      return Player.getVolume() === 0; // pre-MuteHelper clients
    }
  },

  setMute(muted: boolean): void {
    void playbackApi().getMuteHelper().setMuted(muted);
  },

  toggleMute(): void {
    void playbackApi().getMuteHelper().toggleMute();
  },

  getMuteHelper(): MuteHelper {
    return playbackApi().getMuteHelper();
  },

  getShuffle(): boolean {
    return playerApi()._state.shuffle;
  },

  setShuffle(enabled: boolean): void {
    void playerApi().setShuffle(enabled);
  },

  toggleShuffle(): void {
    void playerApi().setShuffle(!playerApi()._state.shuffle);
  },

  getRepeat(): number {
    return playerApi()._state.repeat;
  },

  setRepeat(mode: number): void {
    void playerApi().setRepeat(mode);
  },

  toggleRepeat(): void {
    void playerApi().setRepeat((playerApi()._state.repeat + 1) % REPEAT_MODES);
  },

  // Read from track metadata so the call stays synchronous, matching Spicetify.
  // Use isHearted() for an authoritative check.
  getHeart(): boolean {
    const item = playerApi()._state.item;
    return item?.metadata?.["collection.in_collection"] === "true";
  },

  async isHearted(uri?: string): Promise<boolean> {
    const target = uri ?? playerApi()._state.item?.uri;
    if (!target) return false;
    const [contained] = await libraryApi().contains(target);
    return Boolean(contained);
  },

  setHeart(hearted: boolean): void {
    const uri = playerApi()._state.item?.uri;
    if (!uri) return;
    const request = { uris: [uri] };
    void (hearted ? libraryApi().add(request) : libraryApi().remove(request));
  },

  toggleHeart(): void {
    Player.setHeart(!Player.getHeart());
  },

  addEventListener(type: string, listener: Listener): void {
    if (isDerived(type)) {
      ensureUpdateSubscription();
      let listeners = derivedListeners.get(type);
      if (!listeners) {
        listeners = new Set();
        derivedListeners.set(type, listeners);
      }
      listeners.add(listener);
      return;
    }

    const unsubscribe = playerApi().getEvents().addListener(type, listener);
    let handles = nativeHandles.get(type);
    if (!handles) {
      handles = new Map();
      nativeHandles.set(type, handles);
    }
    handles.set(listener, unsubscribe);
  },

  removeEventListener(type: string, listener: Listener): void {
    if (isDerived(type)) {
      derivedListeners.get(type)?.delete(listener);
      return;
    }
    const handles = nativeHandles.get(type);
    const unsubscribe = handles?.get(listener);
    if (unsubscribe) {
      unsubscribe();
      handles?.delete(listener);
    }
  },

  addToQueue(tracks: Spicetify.ContextTrack[]): void {
    void playerApi()._queue?.addToQueue(tracks);
  },

  removeFromQueue(tracks: Spicetify.ContextTrack[]): void {
    void playerApi()._queue?.removeFromQueue(tracks);
  },

  clearQueue(): void {
    void playerApi().clearQueue();
  },

  formatTime(ms: number): string {
    let seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return `${minutes}:${seconds > 9 ? "" : "0"}${seconds}`;
  },
};

export const Platform = {
  get PlayerAPI(): PlayerApi {
    return playerApi();
  },
  get PlaybackAPI(): PlaybackApi {
    return playbackApi();
  },
  get LibraryAPI(): LibraryApi {
    return libraryApi();
  },
  get History(): HistoryApi {
    return getService<HistoryApi>("History");
  },
};
