import { TeachingUnit, LearningObjective } from '../types';

const genId = () => Math.random().toString(36).substr(2, 9);

/**
 * Normalize a TeachingUnit to ensure sub_units use the new
 * learning_objectives: LearningObjective[] format.
 * Converts old `objectives: string[]` data if detected.
 */
export function normalizeTeachingUnit(raw: TeachingUnit): TeachingUnit {
  if (!raw.sub_units || raw.sub_units.length === 0) return raw;

  const normalizedSubUnits = raw.sub_units.map(su => {
    // Already in new format
    if (Array.isArray(su.learning_objectives)) return su;

    // Old format: objectives is string[]
    const oldObjectives: string[] = (su as unknown as { objectives?: string[] }).objectives || [];
    const learning_objectives: LearningObjective[] = oldObjectives.map(text => ({
      id: genId(),
      objective: text,
      status: 'not_started' as const,
      periods: 1,
    }));

    // Remove old field, add new
    const { objectives: _, ...rest } = su as unknown as Record<string, unknown>;
    return { ...rest, learning_objectives } as typeof su;
  });

  return { ...raw, sub_units: normalizedSubUnits };
}
