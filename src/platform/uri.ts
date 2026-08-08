// Minimal Spotify URI parsing, replacing Spicetify.URI. Only what this extension
// needs: recognising a resource kind and moving between the spotify:<type>:<id> and
// https://open.spotify.com/<type>/<id> forms.

export const URI_TYPES = [
  "track",
  "album",
  "artist",
  "playlist",
  "episode",
  "show",
  "user",
  "local",
] as const;

export type UriType = (typeof URI_TYPES)[number];

const isUriType = (value: string): value is UriType =>
  (URI_TYPES as readonly string[]).includes(value);

export class SpotifyUri {
  constructor(
    readonly type: UriType,
    readonly id: string,
  ) {}

  toString(): string {
    return `spotify:${this.type}:${this.id}`;
  }

  toURL(): string {
    return `https://open.spotify.com/${this.type}/${this.id}`;
  }

  // Accepts either form. Unlike Spicetify's version this returns null rather than
  // throwing on malformed input.
  static fromString(input: string): SpotifyUri | null {
    if (typeof input !== "string") return null;
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("spotify:")) {
      // ["spotify", ...optional qualifiers such as playlist:v2..., type, id]
      const parts = trimmed.split(":").filter(Boolean);
      const id = parts[parts.length - 1];
      const type = parts[parts.length - 2];
      if (!id || !type || !isUriType(type)) return null;
      return new SpotifyUri(type, id);
    }

    const match = trimmed.match(
      /open\.spotify\.com\/(?:intl-[a-z-]+\/)?([a-z]+)\/([a-zA-Z0-9]+)/i,
    );
    if (!match) return null;
    const [, type, id] = match;
    const lowered = type.toLowerCase();
    if (!isUriType(lowered)) return null;
    return new SpotifyUri(lowered, id);
  }
}

export const URI = {
  fromString: SpotifyUri.fromString,
  Type: URI_TYPES,
};
