import { PlayerTrack } from "../outgoing/types";
import { ContextTrack } from "./types";
import { PlayerState } from "../outgoing/types";
import { Player, SpotifyUri } from "../../platform";


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

export function toPlayerTrack(spicetifyPlayerTrack: Spicetify.PlayerTrack | null | undefined) : PlayerTrack | null {
    if (!spicetifyPlayerTrack) return null;

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

export function toPlayerTrackArray(spicetifyPlayerTracks: Spicetify.PlayerTrack[] | undefined) : PlayerTrack[] {
    const playerTracks : PlayerTrack[] = [];

    if(spicetifyPlayerTracks) {
        for(let i = 0; i < spicetifyPlayerTracks.length ; i++) {
            const track = toPlayerTrack(spicetifyPlayerTracks[i]);
            if (track) playerTracks.push(track);
        }
    }

    return playerTracks;
}

export function getPlayerState(): PlayerState | null {

    const currentTrack = toPlayerTrack(Player.data.item);
    if (!currentTrack) return null;

    const previousTrack = Player.data.previousItems?.[0] ?? null;
    const nextTracks = Player.data.nextItems ?? null;

    const playerState: PlayerState = {
        isPlaying: Player.isPlaying(),
        progress: Player.getProgress(),
        duration: Player.getDuration(),
        isMuted: Player.getMute(),
        volume: Player.getVolume(),
        isShuffling: Player.getShuffle(),
        repeatMode: Player.getRepeat(),
        currentTrack: currentTrack,
        previousTrack: previousTrack ? toPlayerTrack(previousTrack) ?? undefined : undefined,
        nextTracks: nextTracks ? toPlayerTrackArray(nextTracks) : undefined,
    };

    return playerState;
}


export function safeParseUri(uri: string | null): SpotifyUri | null {
    if (uri == null) return null;
    
    try {
        return SpotifyUri.fromString(uri);
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
