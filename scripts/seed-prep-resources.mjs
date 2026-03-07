#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, 'output', 'teaching-units-all.json');

function hasPrepResourceContent(resource) {
  return !!((resource.title || '').trim() || (resource.url || '').trim() || (resource.note || '').trim());
}

function buildSharedPrepResources(subUnit) {
  const linkedResources = [
    {
      title: 'Worksheet',
      url: subUnit.worksheet_url || '',
      kind: 'worksheet',
      note: 'Use as the shared fluency or consolidation worksheet after teacher modelling.',
    },
    {
      title: 'Online Practice',
      url: subUnit.online_practice_url || '',
      kind: 'practice',
      note: 'Use for paced independent practice once the worked example is secure.',
    },
    {
      title: 'Kahoot',
      url: subUnit.kahoot_url || '',
      kind: 'kahoot',
      note: 'Use as a retrieval or hinge-check activity at the start or end of the lesson.',
    },
    {
      title: 'Homework',
      url: subUnit.homework_url || '',
      kind: 'homework',
      note: 'Set as independent follow-up practice after the objective has been introduced.',
    },
    {
      title: 'Vocabulary Practice',
      url: subUnit.vocab_practice_url || '',
      kind: 'vocab',
      note: 'Use to rehearse the bilingual vocabulary before or after the main explanation.',
    },
  ].filter(resource => (resource.url || '').trim());

  const noteResources = [];
  const vocabularyTerms = (subUnit.vocabulary || [])
    .map(item => (item.english || '').trim())
    .filter(Boolean)
    .slice(0, 4);

  if (String(subUnit.classroom_exercises || '').trim()) {
    noteResources.push({
      title: 'Guided Practice Bank',
      url: '',
      kind: 'other',
      note: 'Reuse the sub-unit classroom exercises as the shared guided-practice bank for this objective.',
    });
  }

  if (String(subUnit.homework_content || '').trim() && !(subUnit.homework_url || '').trim()) {
    noteResources.push({
      title: 'Homework Follow-up',
      url: '',
      kind: 'homework',
      note: 'Use the existing sub-unit homework content for independent practice or next-lesson retrieval.',
    });
  }

  if (vocabularyTerms.length > 0 && !(subUnit.vocab_practice_url || '').trim()) {
    noteResources.push({
      title: 'Vocabulary Retrieval',
      url: '',
      kind: 'vocab',
      note: `Revisit ${vocabularyTerms.join(', ')} before direct instruction and again during plenary review.`,
    });
  }

  if (String(subUnit.ai_summary || '').trim()) {
    noteResources.push({
      title: 'Teacher Explanation Notes',
      url: '',
      kind: 'other',
      note: 'Use the sub-unit AI summary as a concise explanation scaffold and misconception check.',
    });
  }

  return [...linkedResources, ...noteResources].filter(hasPrepResourceContent);
}

function main() {
  const payload = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  const units = Array.isArray(payload.teachingUnits) ? payload.teachingUnits : [];

  let updatedSubUnits = 0;
  let updatedObjectives = 0;

  for (const unit of units) {
    for (const subUnit of unit.sub_units || []) {
      const sharedResources = buildSharedPrepResources(subUnit);
      const existingShared = Array.isArray(subUnit.shared_resources)
        ? subUnit.shared_resources.filter(hasPrepResourceContent)
        : [];
      if (existingShared.length === 0 && sharedResources.length > 0) {
        subUnit.shared_resources = sharedResources.map(resource => ({ ...resource }));
        updatedSubUnits++;
      }

      for (const objective of subUnit.learning_objectives || []) {
        const existingObjectiveResources = Array.isArray(objective.prep_resources)
          ? objective.prep_resources.filter(hasPrepResourceContent)
          : [];
        if (existingObjectiveResources.length === 0 && sharedResources.length > 0) {
          objective.prep_resources = sharedResources.map(resource => ({ ...resource }));
          updatedObjectives++;
        }
      }
    }
  }

  writeFileSync(DATA_PATH, `${JSON.stringify({ teachingUnits: units }, null, 2)}\n`);
  console.log(`Updated ${updatedSubUnits} sub-units and ${updatedObjectives} objectives with prep resources.`);
}

main();
