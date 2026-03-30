export interface DebouncedLocalStorageJsonWriterOptions<T> {
  debounceMs?: number;
  idleTimeoutMs?: number;
  pruneOnQuotaExceeded?: (value: T) => T;
  onPruned?: (value: T) => void;
  onError?: (err: unknown) => void;
  autoFlush?: boolean;
}

type IdleHandle = number;

type RequestIdleCallback = (cb: () => void, opts?: { timeout?: number }) => IdleHandle;
type CancelIdleCallback = (handle: IdleHandle) => void;

const globalFlushers = new Set<() => void>();
let globalListenersInstalled = false;

function ensureGlobalFlushListeners() {
  if (globalListenersInstalled) return;
  globalListenersInstalled = true;

  const flushAll = () => {
    for (const fn of globalFlushers) {
      try {
        fn();
      } catch {
        // Best-effort flush only
      }
    }
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') flushAll();
  };

  window.addEventListener('pagehide', flushAll);
  window.addEventListener('beforeunload', flushAll);
  document.addEventListener('visibilitychange', onVisibilityChange);
}

function isQuotaExceeded(err: unknown) {
  return err instanceof DOMException && err.name === 'QuotaExceededError';
}

export function createDebouncedLocalStorageJsonWriter<T>(
  storageKey: string,
  options: DebouncedLocalStorageJsonWriterOptions<T> = {},
) {
  const debounceMs = options.debounceMs ?? 400;
  const idleTimeoutMs = options.idleTimeoutMs ?? 2000;

  let lastWritten: string | null = null;
  let pending: T | null = null;
  let timer: number | null = null;
  let idleHandle: IdleHandle | null = null;

  const requestIdle = (window as any).requestIdleCallback as RequestIdleCallback | undefined;
  const cancelIdle = (window as any).cancelIdleCallback as CancelIdleCallback | undefined;

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (idleHandle !== null && typeof cancelIdle === 'function') {
      cancelIdle(idleHandle);
      idleHandle = null;
    }
  };

  const writeValue = (value: T) => {
    try {
      const serialized = JSON.stringify(value);
      if (serialized === lastWritten) return;
      localStorage.setItem(storageKey, serialized);
      lastWritten = serialized;
      return;
    } catch (err) {
      options.onError?.(err);

      if (!isQuotaExceeded(err) || !options.pruneOnQuotaExceeded) return;

      try {
        const pruned = options.pruneOnQuotaExceeded(value);
        options.onPruned?.(pruned);
        const serialized = JSON.stringify(pruned);
        localStorage.setItem(storageKey, serialized);
        lastWritten = serialized;
      } catch {
        // Give up: state stays in memory but won't persist
      }
    }
  };

  const flush = () => {
    cancel();
    if (pending === null) return;
    const value = pending;
    pending = null;
    writeValue(value);
  };

  const schedule = (value: T) => {
    pending = value;
    cancel();

    timer = window.setTimeout(() => {
      timer = null;
      if (typeof requestIdle === 'function') {
        idleHandle = requestIdle(() => {
          idleHandle = null;
          flush();
        }, { timeout: idleTimeoutMs });
        return;
      }
      flush();
    }, debounceMs);
  };

  const setLastWritten = (raw: string | null) => {
    lastWritten = raw;
  };

  const dispose = () => {
    cancel();
    globalFlushers.delete(flush);
  };

  if (options.autoFlush !== false) {
    ensureGlobalFlushListeners();
    globalFlushers.add(flush);
  }

  return { schedule, flush, cancel, setLastWritten, dispose };
}

