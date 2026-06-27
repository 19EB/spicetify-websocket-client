export interface ObserveValueOptions<T> {
  /** Read the current value. Called once on start and on every tick. */
  read: () => T;
  /** Called when the value changes (per `equals`), and once on start if `emitInitial`. */
  onChange: (value: T, previous: T) => void;
  /** Poll interval in milliseconds. Default: 200. */
  intervalMs?: number;
  /** Returns true when two values are considered equal (no change). Default: strict `===`. */
  equals?: (a: T, b: T) => boolean;
  /** When true, fire `onChange(initial, initial)` immediately on start. Default: false. */
  emitInitial?: boolean;
}

const DEFAULT_INTERVAL_MS = 200;

/**
 * Polls `read()` on an interval and invokes `onChange` whenever the value changes.
 * Generic and free of side effects aside from the timer it owns.
 *
 * The timer is resilient: if `read()` or `onChange()` throws, the error is logged
 * and polling continues, so a transient failure never silently kills the observer.
 *
 * @returns a `stop()` function that clears the timer.
 */
export const observeValue = <T>(options: ObserveValueOptions<T>): (() => void) => {
  const {
    read,
    onChange,
    intervalMs = DEFAULT_INTERVAL_MS,
    equals = (a, b) => a === b,
    emitInitial = false,
  } = options;

  const safeRead = (): { ok: true; value: T } | { ok: false } => {
    try {
      return { ok: true, value: read() };
    } catch (error) {
      console.error("observeValue: read() threw, skipping tick", error);
      return { ok: false };
    }
  };

  const fire = (value: T, previous: T) => {
    try {
      onChange(value, previous);
    } catch (error) {
      console.error("observeValue: onChange() threw", error);
    }
  };

  const initial = safeRead();
  let previous: T | undefined = initial.ok ? initial.value : undefined;
  let hasValue = initial.ok;

  if (emitInitial && initial.ok) {
    fire(initial.value, initial.value);
  }

  const intervalId = window.setInterval(() => {
    const current = safeRead();
    if (!current.ok) return;

    // Seed the baseline if the initial read had failed.
    if (!hasValue) {
      previous = current.value;
      hasValue = true;
      return;
    }

    if (!equals(current.value, previous as T)) {
      const prev = previous as T;
      previous = current.value;
      fire(current.value, prev);
    }
  }, intervalMs);

  return () => window.clearInterval(intervalId);
};
