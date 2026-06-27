export interface ObserveValueOptions<T> {
  /** Read the current value. Called once on start and on every tick. */
  read: () => T;
  /**
   * Called when the value changes (per `equals`), and once on start if `emitInitial`.
   * When no prior value has been emitted yet, `previous === value`.
   */
  onChange: (value: T, previous: T) => void;
  /** Poll interval in milliseconds. Default: 200. */
  intervalMs?: number;
  /** Returns true when two values are considered equal (no change). Default: strict `===`. */
  equals?: (a: T, b: T) => boolean;
  /** When true, fire `onChange(initial, initial)` immediately on start. Default: false. */
  emitInitial?: boolean;
  /**
   * Trailing debounce in milliseconds. When > 0, `onChange` fires only after the
   * value has held steady for this long, collapsing a burst of changes (e.g. a
   * slider drag) into a single emit of the settled value. `emitInitial` is never
   * debounced. Default: 0 (emit on the next tick a change is detected).
   */
  debounceMs?: number;
}

const DEFAULT_INTERVAL_MS = 200;

/**
 * Polls `read()` on an interval and invokes `onChange` whenever the value changes
 * (per `equals`). Generic and free of side effects aside from the timers it owns.
 *
 * Behavior notes:
 * - Resilient: if `read()` or `onChange()` throws, the error is logged and polling
 *   continues, so a transient failure never silently kills the observer.
 * - If the very first `read()` fails, the first successful tick seeds the baseline
 *   silently (no emit) rather than reporting a spurious change.
 * - With `debounceMs > 0`, only the settled value is emitted after activity stops;
 *   a change that returns to the last-emitted value before the timer fires emits
 *   nothing. `emitInitial` still fires immediately, undebounced.
 *
 * @returns a `stop()` function that clears the poll interval and any pending debounce timer.
 */
export const observeValue = <T>(options: ObserveValueOptions<T>): (() => void) => {
  const {
    read,
    onChange,
    intervalMs = DEFAULT_INTERVAL_MS,
    equals = (a, b) => a === b,
    emitInitial = false,
    debounceMs = 0,
  } = options;

  const safeRead = (): { value: T } | null => {
    try {
      return { value: read() };
    } catch (error) {
      console.error("observeValue: read() threw, skipping tick", error);
      return null;
    }
  };

  const fire = (value: T, previous: T) => {
    try {
      onChange(value, previous);
    } catch (error) {
      console.error("observeValue: onChange() threw", error);
    }
  };

  // `seen` is the latest value observed (baseline for change detection); `emitted`
  // is the latest value delivered to `onChange`. They diverge while a debounce is
  // pending. Wrapping in objects keeps "no value yet" (null) distinct from a real
  // value without sentinel casts.
  let seen = safeRead();
  let emitted = seen;
  let debounceTimerId: number | undefined;

  /** Emit the settled value if it differs from what we last delivered. */
  const flush = () => {
    debounceTimerId = undefined;
    if (!seen) return;
    if (emitted && equals(seen.value, emitted.value)) return; // no net change
    const previous = emitted ? emitted.value : seen.value;
    emitted = seen;
    fire(seen.value, previous);
  };

  if (emitInitial && seen) {
    fire(seen.value, seen.value);
    emitted = seen;
  }

  const intervalId = window.setInterval(() => {
    const current = safeRead();
    if (!current) return;

    // Seed the baseline if the initial read had failed.
    if (!seen) {
      seen = current;
      emitted = current;
      return;
    }

    if (equals(current.value, seen.value)) return; // no movement this tick
    seen = current;

    if (debounceMs > 0) {
      // Value is moving: (re)arm the trailing timer so we emit once it settles.
      if (debounceTimerId !== undefined) window.clearTimeout(debounceTimerId);
      debounceTimerId = window.setTimeout(flush, debounceMs);
    } else {
      flush();
    }
  }, intervalMs);

  return () => {
    window.clearInterval(intervalId);
    if (debounceTimerId !== undefined) window.clearTimeout(debounceTimerId);
  };
};