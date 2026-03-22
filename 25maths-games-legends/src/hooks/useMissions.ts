import { MISSIONS as LOCAL_MISSIONS } from '../data/missions';
import type { Mission } from '../types';

/**
 * Use local mission data directly.
 *
 * Previously loaded from Supabase gl_missions table, but the DB data is stale
 * (missing generatorType, parameterized stories, skillName, etc.).
 * All mission data is now maintained in src/data/missions.ts.
 * DB sync can be re-enabled in Phase 3 when gl_missions is updated.
 */
export function useMissions() {
  const missions: Mission[] = LOCAL_MISSIONS;
  const loading = false;
  return { missions, loading };
}
