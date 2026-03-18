import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const serialized = JSON.stringify(value);
      if (localStorage.getItem(key) !== serialized) {
        localStorage.setItem(key, serialized);
      }
    } catch (err) {
      console.error(`Failed to save ${key} to localStorage:`, err);
      // Attempt to free space by removing the key itself if quota exceeded
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        try {
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Storage is truly full — state is in memory but won't persist
        }
      }
    }
  }, [key, value]);

  return [value, setValue];
}
