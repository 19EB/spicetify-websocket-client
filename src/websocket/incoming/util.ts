import { ContextTrack } from "./types";

export function spotifyUrlToUri(input : string) {
    const match = input.match(
    /open\.spotify\.com\/(track)\/([a-zA-Z0-9]+)/
  );

  if (!match) return null;

  const [, type, id] = match;
  return `spotify:${type}:${id}`;
}

export function toSpicetifyContextTracks(contextTracks: ContextTrack[]) {
    const tracks: Spicetify.ContextTrack[] = contextTracks.map((track) => {
        const spicetifyTrack: Spicetify.ContextTrack = {
            uri: track.uri,
            uid: track.uid ?? undefined,
            metadata: track.metadata,
        }
        return spicetifyTrack;
    });
    return tracks;
}
