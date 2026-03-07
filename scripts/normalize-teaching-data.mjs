#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, 'output', 'teaching-units-all.json');

function normalizeObjectiveId(subUnitId, objectiveIndex) {
  return `lo-${subUnitId.replace(/^su-/, '')}-${objectiveIndex + 1}`;
}

function normalizeLearningObjective(subUnitId, lo, objectiveIndex) {
  if (typeof lo === 'string') {
    return {
      id: normalizeObjectiveId(subUnitId, objectiveIndex),
      objective: lo,
      status: 'not_started',
      periods: 1,
      covered_lesson_dates: [],
      core_vocabulary: [],
      concept_explanation: '',
      typical_examples: [],
      prep_resources: [],
    };
  }

  return {
    id: lo?.id || normalizeObjectiveId(subUnitId, objectiveIndex),
    objective: lo?.objective || '',
    status: lo?.status || 'not_started',
    periods: typeof lo?.periods === 'number' ? lo.periods : 1,
    notes: lo?.notes,
    covered_lesson_dates: Array.isArray(lo?.covered_lesson_dates) ? lo.covered_lesson_dates : [],
    core_vocabulary: Array.isArray(lo?.core_vocabulary) ? lo.core_vocabulary : [],
    concept_explanation: lo?.concept_explanation || '',
    typical_examples: Array.isArray(lo?.typical_examples) ? lo.typical_examples : [],
    prep_resources: Array.isArray(lo?.prep_resources) ? lo.prep_resources : [],
  };
}

function normalizeSubUnit(subUnit) {
  const rawObjectives = Array.isArray(subUnit.learning_objectives) && subUnit.learning_objectives.length > 0
    ? subUnit.learning_objectives
    : Array.isArray(subUnit.objectives)
      ? subUnit.objectives
      : [];

  const learningObjectives = rawObjectives
    .map((lo, objectiveIndex) => normalizeLearningObjective(subUnit.id, lo, objectiveIndex))
    .filter(lo => lo.objective);

  const { objectives, ...rest } = subUnit;

  return {
    ...rest,
    periods: typeof subUnit.periods === 'number' ? subUnit.periods : 1,
    learning_objectives: learningObjectives,
    vocabulary: Array.isArray(subUnit.vocabulary) ? subUnit.vocabulary : [],
    classroom_exercises: subUnit.classroom_exercises || '',
    homework_content: subUnit.homework_content || '',
  };
}

function normalizeUnit(unit) {
  const normalizedSubUnits = Array.isArray(unit.sub_units)
    ? unit.sub_units.map(normalizeSubUnit)
    : [];

  return {
    ...unit,
    learning_objectives: normalizedSubUnits.flatMap(subUnit => subUnit.learning_objectives.map(lo => lo.objective)),
    lessons: Array.isArray(unit.lessons) ? unit.lessons : [],
    sub_units: normalizedSubUnits,
    typical_examples: Array.isArray(unit.typical_examples) ? unit.typical_examples : [],
    core_vocabulary: Array.isArray(unit.core_vocabulary) ? unit.core_vocabulary : [],
    prep_material_template: unit.prep_material_template || '',
    ai_prompt_template: unit.ai_prompt_template || '',
  };
}

const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
const units = Array.isArray(data.teachingUnits) ? data.teachingUnits : [];
const normalized = {
  ...data,
  teachingUnits: units.map(normalizeUnit),
};

writeFileSync(dataPath, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Normalized ${normalized.teachingUnits.length} teaching units in ${dataPath}`);
