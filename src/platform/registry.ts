// Spotify wires its platform services through a small dependency-injection registry
// whose tokens are plain global symbols (Symbol.for("PlayerAPI") and friends).
// The registry instance is not exported from any module and is not on window, but it
// is passed down through React as a prop close to the root, so we duck-type it out of
// the fiber tree. Nothing here touches Spicetify, __webpack_modules__ or rspackChunk.
// See docs/standalone-platform.md.

export interface ServiceRegistry {
  resolve<T = unknown>(token: symbol): T;
  resolveNoThrow<T = unknown>(token: symbol): T | null;
  _map: Map<symbol, unknown>;
}

interface Fiber {
  return?: Fiber | null;
  child?: Fiber | null;
  sibling?: Fiber | null;
  memoizedProps?: unknown;
  memoizedState?: unknown;
}

const MAX_FIBER_NODES = 80_000;
const MAX_KEYS_PER_NODE = 40;
const DEFAULT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 250;

const isRegistry = (value: unknown): value is ServiceRegistry => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ServiceRegistry>;
  return (
    typeof candidate.resolve === "function" &&
    typeof candidate.resolveNoThrow === "function" &&
    candidate._map instanceof Map
  );
};

const findFiberRoot = (): Fiber | null => {
  const nodes = document.querySelectorAll("div, main, body");
  for (let i = 0; i < nodes.length && i < 500; i++) {
    for (const key of Object.keys(nodes[i])) {
      if (key.startsWith("__reactFiber$") || key.startsWith("__reactContainer$")) {
        let fiber = (nodes[i] as unknown as Record<string, Fiber>)[key];
        while (fiber?.return) fiber = fiber.return;
        return fiber ?? null;
      }
    }
  }
  return null;
};

// The registry is normally passed as a `registry` prop rather than being the props
// object itself, so check one level down too.
const registryOnFiber = (fiber: Fiber): ServiceRegistry | null => {
  for (const bucket of [fiber.memoizedProps, fiber.memoizedState]) {
    if (!bucket || typeof bucket !== "object") continue;
    if (isRegistry(bucket)) return bucket;

    let keys: string[];
    try {
      keys = Object.keys(bucket);
    } catch {
      continue;
    }
    for (let i = 0; i < keys.length && i < MAX_KEYS_PER_NODE; i++) {
      let value: unknown;
      try {
        value = (bucket as Record<string, unknown>)[keys[i]];
      } catch {
        continue; // getters on foreign objects may throw
      }
      if (isRegistry(value)) return value;
    }
  }
  return null;
};

// Returns null when React has not mounted yet.
export const findRegistry = (): ServiceRegistry | null => {
  const root = findFiberRoot();
  if (!root) return null;

  const stack: Fiber[] = [root];
  let visited = 0;
  while (stack.length > 0 && visited < MAX_FIBER_NODES) {
    const fiber = stack.pop() as Fiber;
    visited++;

    const found = registryOnFiber(fiber);
    if (found) return found;

    if (fiber.child) stack.push(fiber.child);
    if (fiber.sibling) stack.push(fiber.sibling);
  }
  return null;
};

let cached: ServiceRegistry | null = null;

// Polls until Spotify's React tree has mounted. The registry is a singleton for the
// lifetime of the page, so the result is memoised.
export const getRegistry = async (timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ServiceRegistry> => {
  if (cached) return cached;

  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const registry = findRegistry();
    if (registry) {
      cached = registry;
      return registry;
    }
    if (Date.now() >= deadline) {
      throw new Error(
        `Spotify service registry not found within ${timeoutMs}ms. ` +
          "The player UI may not have finished loading.",
      );
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
};

export const peekRegistry = (): ServiceRegistry | null => cached;

export const getService = <T>(name: string): T => {
  if (!cached) {
    throw new Error(`getService("${name}") called before the registry was bootstrapped.`);
  }
  const service = cached.resolveNoThrow<T>(Symbol.for(name));
  if (!service) throw new Error(`Spotify service "${name}" is not registered.`);
  return service;
};

export const getServiceNoThrow = <T>(name: string): T | null => {
  if (!cached) return null;
  try {
    return cached.resolveNoThrow<T>(Symbol.for(name));
  } catch {
    return null;
  }
};

// String(symbol) rather than symbol.description, so the build target can stay at ES2017.
const describeToken = (token: unknown): string => {
  const text = String(token);
  return text.startsWith("Symbol(") && text.endsWith(")") ? text.slice(7, -1) : text;
};

export const listServices = (): string[] => {
  if (!cached) return [];
  const names: string[] = [];
  for (const token of cached._map.keys()) {
    names.push(describeToken(token));
  }
  return names.sort();
};
