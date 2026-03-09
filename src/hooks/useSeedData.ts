import { useState, useEffect, useMemo } from 'react';
import type { KahootItem, PayhipItem } from '../types';

export interface SeedData {
  kahootSeed: KahootItem[];
  payhipSeed: PayhipItem[];
  loaded: boolean;
}

const EMPTY: SeedData = { kahootSeed: [], payhipSeed: [], loaded: false };

/** Cache so re-renders don't re-import */
let cached: SeedData | null = null;

/**
 * Lazily loads the large seed constants (1.8 MB) via dynamic import.
 * This keeps them out of the main bundle and loads them on demand.
 */
export function useSeedData(): SeedData {
  const [data, setData] = useState<SeedData>(cached ?? EMPTY);

  useEffect(() => {
    if (cached) return; // already loaded

    let cancelled = false;

    Promise.all([
      import('../constants-kahoot').then(m => m.KAHOOT_SEED_ITEMS),
      import('../constants-payhip').then(m => m.MOCK_PAYHIP_ITEMS),
    ]).then(([kahootSeed, payhipSeed]) => {
      if (cancelled) return;
      const result: SeedData = { kahootSeed, payhipSeed, loaded: true };
      cached = result;
      setData(result);
    });

    return () => { cancelled = true; };
  }, []);

  return data;
}
