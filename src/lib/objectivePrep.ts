import { LearningObjective, PrepResource, SubUnit, VocabularyItem } from '../types';

export function getSharedPrepResources(subUnit: SubUnit): PrepResource[] {
  const resources: PrepResource[] = [
    { title: 'Worksheet', url: subUnit.worksheet_url || '', kind: 'worksheet' },
    { title: 'Online Practice', url: subUnit.online_practice_url || '', kind: 'practice' },
    { title: 'Kahoot', url: subUnit.kahoot_url || '', kind: 'kahoot' },
    { title: 'Homework', url: subUnit.homework_url || '', kind: 'homework' },
    { title: 'Vocabulary Practice', url: subUnit.vocab_practice_url || '', kind: 'vocab' },
  ];

  return resources.filter(resource => resource.url);
}

export function getObjectiveVocabulary(objective: LearningObjective, subUnit: SubUnit): VocabularyItem[] {
  return (objective.core_vocabulary && objective.core_vocabulary.length > 0)
    ? objective.core_vocabulary
    : subUnit.vocabulary;
}

export function getObjectiveResources(objective: LearningObjective, subUnit: SubUnit): PrepResource[] {
  return (objective.prep_resources && objective.prep_resources.length > 0)
    ? objective.prep_resources
    : getSharedPrepResources(subUnit);
}

export function getObjectiveConcept(objective: LearningObjective, subUnit: SubUnit): string {
  return objective.concept_explanation?.trim() || subUnit.ai_summary?.trim() || '';
}

export function getObjectivePrepMetrics(objective: LearningObjective, subUnit: SubUnit) {
  const vocabulary = getObjectiveVocabulary(objective, subUnit);
  const resources = getObjectiveResources(objective, subUnit);
  const concept = getObjectiveConcept(objective, subUnit);
  const examples = objective.typical_examples || [];
  const hasSharedExercises = !!subUnit.classroom_exercises?.trim();
  const usesSharedVocabulary = (!objective.core_vocabulary || objective.core_vocabulary.length === 0) && vocabulary.length > 0;
  const usesSharedResources = (!objective.prep_resources || objective.prep_resources.length === 0) && resources.length > 0;
  const usesSharedConcept = !objective.concept_explanation?.trim() && !!subUnit.ai_summary?.trim();
  const examplesReady = examples.length > 0 || hasSharedExercises;
  const readySections =
    (vocabulary.length > 0 ? 1 : 0) +
    (concept ? 1 : 0) +
    (examplesReady ? 1 : 0) +
    (resources.length > 0 ? 1 : 0);

  return {
    vocabulary,
    resources,
    concept,
    examples,
    hasSharedExercises,
    usesSharedVocabulary,
    usesSharedResources,
    usesSharedConcept,
    examplesReady,
    readySections,
    totalSections: 4,
  };
}
