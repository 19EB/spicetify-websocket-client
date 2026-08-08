// Structural types for the Spotify platform services we resolve from the registry.
// These describe only the members this extension uses.

// Carried by PlayerAPI._state and by every `update` event.
export interface PlayerState {
  timestamp: number;
  context: unknown;
  index: unknown;
  item: Spicetify.PlayerTrack | null;
  shuffle: boolean;
  smartShuffle: boolean;
  repeat: number;
  speed: number;
  positionAsOfTimestamp: number;
  duration: number;
  hasContext: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  restrictions: unknown;
  previousItems?: Spicetify.PlayerTrack[];
  nextItems?: Spicetify.PlayerTrack[];
  playbackQuality: unknown;
  playbackId: string;
  sessionId: string;
}

export interface PlayerEvent {
  type: string;
  data: PlayerState;
}

export type Unsubscribe = () => void;

export interface PlayerEvents {
  addListener(type: string, listener: (event: PlayerEvent) => void): Unsubscribe;
  removeListener(type: string, listener: (event: PlayerEvent) => void): void;
}

export interface QueueApi {
  addToQueue(items: Spicetify.ContextTrack[], options?: unknown): Promise<void>;
  removeFromQueue(items: Spicetify.ContextTrack[]): Promise<void>;
  clearQueue(): Promise<void>;
  getQueue(): unknown;
}

export interface PlayerApi {
  _state: PlayerState;
  _queue: QueueApi | undefined;
  getEvents(): PlayerEvents;
  getState(): Promise<PlayerState>;
  play(track: { uri: string }, context?: unknown, options?: unknown): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  skipToNext(): Promise<void>;
  skipToPrevious(): Promise<void>;
  seekTo(positionMs: number): Promise<void>;
  seekBackward(byMs: number): Promise<void>;
  seekForward(byMs: number): Promise<void>;
  setShuffle(enabled: boolean): Promise<void>;
  setRepeat(mode: number): Promise<void>;
  clearQueue(): Promise<void>;
  addToQueue(items: Spicetify.ContextTrack[]): Promise<void>;
  removeFromQueue(items: Spicetify.ContextTrack[]): Promise<void>;
}

// Remembers the level from before the mute and restores it on unmute.
export interface MuteHelper {
  isMuted(): boolean;
  mute(): Promise<void>;
  unmute(): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  toggleMute(): Promise<void>;
}

export interface PlaybackApi {
  getVolume(): Promise<number>;
  getVolumeInternal(): number; // synchronous read, 0..1
  setVolume(level: number): Promise<void>;
  raiseVolume(): Promise<void>;
  lowerVolume(): Promise<void>;
  getMuteHelper(): MuteHelper;
}

export interface LibraryApi {
  contains(...uris: string[]): Promise<boolean[]>;
  add(request: { uris: string[] }): Promise<unknown>;
  remove(request: { uris: string[] }): Promise<unknown>;
}

export interface HistoryApi {
  push(path: string | { pathname: string; search?: string; state?: unknown }): void;
  goBack(): void;
  goForward(): void;
}
