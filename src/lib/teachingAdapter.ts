import { TeachingUnit, LearningObjective } from '../types';

const genId = () => Math.random().toString(36).substr(2, 9);

/**
 * Normalize a TeachingUnit:
 * 1. Strip deprecated fields (learning_objectives, lessons, core_vocabulary)
 * 2. Ensure sub_units defaults to []
 * 3. Convert old `objectives: string[]` sub-unit format to LearningObjective[]
 */
export function normalizeTeachingUnit(raw: any): TeachingUnit {
  // Strip deprecated top-level fields
  const { learning_objectives, lessons, core_vocabulary, ...rest } = raw;

  const rawSubUnits = rest.sub_units || [];

  const normalizedSubUnits = rawSubUnits.map((su: any) => {
    if (Array.isArray(su.learning_objectives)) {
      // Ensure covered_lesson_dates exists on each LO
      return {
        ...su,
        shared_resources: su.shared_resources || [],
        learning_objectives: su.learning_objectives.map((lo: any) => ({
          ...lo,
          covered_lesson_dates: lo.covered_lesson_dates || [],
          core_vocabulary: lo.core_vocabulary || [],
          concept_explanation: lo.concept_explanation || '',
          typical_examples: lo.typical_examples || [],
          prep_resources: lo.prep_resources || [],
        })),
      };
    }

    // Old format: objectives is string[]
    const oldObjectives: string[] = su.objectives || [];
    const newLOs: LearningObjective[] = oldObjectives.map((text: string) => ({
      id: genId(),
      objective: text,
      status: 'not_started' as const,
      periods: 1,
      covered_lesson_dates: [],
      core_vocabulary: [],
      concept_explanation: '',
      typical_examples: [],
      prep_resources: [],
    }));

    const { objectives: _, ...suRest } = su;
    return { ...suRest, shared_resources: su.shared_resources || [], learning_objectives: newLOs };
  });

  return { ...rest, shared_resources: rest.shared_resources || [], sub_units: normalizedSubUnits };
}
