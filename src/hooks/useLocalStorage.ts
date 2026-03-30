import { useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const lastWrittenRef = useRef<string | null>(null);
  const hydratedFromStorageRef = useRef(false);
  const didMountRef = useRef(false);
  const writeTimerRef = useRef<number | null>(null);
  const idleHandleRef = useRef<number | null>(null);

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;
      const parsed = JSON.parse(stored) as T;
      lastWrittenRef.current = stored;
      hydratedFromStorageRef.current = true;
      return parsed;
    } catch {
      hydratedFromStorageRef.current = false;
      lastWrittenRef.current = null;
      return initialValue;
    }
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  const keyRef = useRef(key);
  keyRef.current = key;

  const cancelScheduled = () => {
    if (writeTimerRef.current !== null) {
      clearTimeout(writeTimerRef.current);
      writeTimerRef.current = null;
    }
    const cancelIdle = (window as any).cancelIdleCallback;
    if (idleHandleRef.current !== null && typeof cancelIdle === 'function') {
      cancelIdle(idleHandleRef.current);
      idleHandleRef.current = null;
    }
  };

  const isQuotaExceeded = (err: unknown) => {
    return err instanceof DOMException && err.name === 'QuotaExceededError';
  };

  const writeNow = () => {
    const currentKey = keyRef.current;
    const currentValue = valueRef.current;
    try {
      const serialized = JSON.stringify(currentValue);
      if (serialized === lastWrittenRef.current) return;
      localStorage.setItem(currentKey, serialized);
      lastWrittenRef.current = serialized;
    } catch (err) {
      console.error(`Failed to save ${currentKey} to localStorage:`, err);
      if (isQuotaExceeded(err)) {
        try {
          localStorage.removeItem(currentKey);
          const serialized = JSON.stringify(currentValue);
          localStorage.setItem(currentKey, serialized);
          lastWrittenRef.current = serialized;
        } catch {
          // Storage is truly full — state is in memory but won't persist
        }
      }
    }
  };

  const scheduleWrite = () => {
    cancelScheduled();
    const DEBOUNCE_MS = 500;
    const IDLE_TIMEOUT_MS = 2000;

    writeTimerRef.current = window.setTimeout(() => {
      writeTimerRef.current = null;
      const requestIdle = (window as any).requestIdleCallback;
      if (typeof requestIdle === 'function') {
        idleHandleRef.current = requestIdle(() => {
          idleHandleRef.current = null;
          writeNow();
        }, { timeout: IDLE_TIMEOUT_MS });
        return;
      }
      writeNow();
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    // Skip the initial effect if we successfully hydrated from localStorage.
    // This avoids an immediate stringify of large data on first mount.
    if (!didMountRef.current) {
      didMountRef.current = true;
      if (hydratedFromStorageRef.current) return;
    }
    scheduleWrite();
    return () => cancelScheduled();
  }, [key, value]);

  useEffect(() => {
    const flush = () => {
      cancelScheduled();
      writeNow();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      flush();
    };
  }, []);

  return [value, setValue];
}
