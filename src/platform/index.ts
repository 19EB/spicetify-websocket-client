// Everything the extension needs from Spotify, with no dependency on Spicetify.
// Call bootstrapPlatform() once during startup, before any handler runs; after it
// resolves, Player and Platform are usable synchronously.

import { getRegistry, listServices } from "./registry";

export { Player, Platform } from "./player";
export { URI, SpotifyUri, URI_TYPES } from "./uri";
export type { UriType } from "./uri";
export {
  findRegistry,
  getRegistry,
  getService,
  getServiceNoThrow,
  listServices,
  peekRegistry,
} from "./registry";
export type { ServiceRegistry } from "./registry";
export type * from "./types";

// Returns the names of every registered service, for diagnostics.
export const bootstrapPlatform = async (timeoutMs?: number): Promise<string[]> => {
  await getRegistry(timeoutMs);
  return listServices();
};
