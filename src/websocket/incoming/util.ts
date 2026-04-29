import { PlayerTrack } from "../outgoing/types";
import { ContextTrack } from "./types";

export function spotifyUrlToUri(input: string) {
    const match = input.match(
        /open\.spotify\.com\/(track)\/([a-zA-Z0-9]+)/
    );

    if (!match) return null;

    const [, type, id] = match;
    return `spotify:${type}:${id}`;
}

export function spotifyUritoId(uri: string) {
    const match = uri.match(
        /spotify:(track:[a-zA-Z0-9]+)/
    );
    if (!match) return null;

    const [, id] = match;
    return id;
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

function convertSpicetifyImagesEntities(
    spicetifyImages?: Spicetify.ImagesEntity[]
) {
    if (!spicetifyImages) return undefined;

    const images: {
        url: string;
        label: string;
    }[] = spicetifyImages.map((image) => ({
        url: image.url,
        label: image.label,
    }));
    return images;
}


export function toPlayerTrack(spicetifyPlayerTrack: Spicetify.PlayerTrack) {
  
    const playerTrack: PlayerTrack = {
        type: spicetifyPlayerTrack.type,
        uri: spicetifyPlayerTrack.uri,
        name: spicetifyPlayerTrack.name,
        mediaType: spicetifyPlayerTrack.mediaType,
        duration: spicetifyPlayerTrack.duration.milliseconds,
        album: {
            uri: spicetifyPlayerTrack.album.uri,
            name: spicetifyPlayerTrack.album.name,
            images: convertSpicetifyImagesEntities(spicetifyPlayerTrack.album.images),
        },
        
        artists: spicetifyPlayerTrack.artists,
        images: spicetifyPlayerTrack.images,
    };

    return playerTrack;
}

export function safeParseUri(uri: string | null): Spicetify.URI | null {
    if (uri == null) return null;
    
    try {
        return Spicetify.URI.fromString(uri);
    } catch {
        return null;
    }
}

export function isNumber(value: unknown): boolean {
    if (typeof value === "number") {
        return Number.isFinite(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (!/^[-+]?(?:\d+|\d*\.\d+)$/.test(trimmed)) {
            return false;
        }

        const parsed = Number(trimmed);
        return Number.isFinite(parsed);
    }

    return false;
}
