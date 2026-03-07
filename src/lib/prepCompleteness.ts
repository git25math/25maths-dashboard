import { ClassProfile, SubUnit, TeachingUnit } from '../types';
import { getObjectivePrepMetrics } from './objectivePrep';

export interface PrepCompletenessSummary {
  objectivesReady: number;
  objectivesTotal: number;
  sectionsReady: number;
  sectionsTotal: number;
  vocabularyReady: number;
  conceptReady: number;
  examplesReady: number;
  resourcesReady: number;
  readinessPct: number;
  sectionPct: number;
}

export interface ClassPrepCompleteness {
  classProfile: ClassProfile;
  currentUnit?: TeachingUnit;
  summary: PrepCompletenessSummary;
}

export function emptyPrepCompletenessSummary(): PrepCompletenessSummary {
  return {
    objectivesReady: 0,
    objectivesTotal: 0,
    sectionsReady: 0,
    sectionsTotal: 0,
    vocabularyReady: 0,
    conceptReady: 0,
    examplesReady: 0,
    resourcesReady: 0,
    readinessPct: 0,
    sectionPct: 0,
  };
}

function finalizeSummary(summary: Omit<PrepCompletenessSummary, 'readinessPct' | 'sectionPct'>): PrepCompletenessSummary {
  return {
    ...summary,
    readinessPct: summary.objectivesTotal > 0 ? Math.round((summary.objectivesReady / summary.objectivesTotal) * 100) : 0,
    sectionPct: summary.sectionsTotal > 0 ? Math.round((summary.sectionsReady / summary.sectionsTotal) * 100) : 0,
  };
}

export function mergePrepCompletenessSummaries(summaries: PrepCompletenessSummary[]): PrepCompletenessSummary {
  const totals = summaries.reduce((acc, summary) => ({
    objectivesReady: acc.objectivesReady + summary.objectivesReady,
    objectivesTotal: acc.objectivesTotal + summary.objectivesTotal,
    sectionsReady: acc.sectionsReady + summary.sectionsReady,
    sectionsTotal: acc.sectionsTotal + summary.sectionsTotal,
    vocabularyReady: acc.vocabularyReady + summary.vocabularyReady,
    conceptReady: acc.conceptReady + summary.conceptReady,
    examplesReady: acc.examplesReady + summary.examplesReady,
    resourcesReady: acc.resourcesReady + summary.resourcesReady,
  }), {
    objectivesReady: 0,
    objectivesTotal: 0,
    sectionsReady: 0,
    sectionsTotal: 0,
    vocabularyReady: 0,
    conceptReady: 0,
    examplesReady: 0,
    resourcesReady: 0,
  });

  return finalizeSummary(totals);
}

export function summarizeSubUnitPrep(subUnit: SubUnit): PrepCompletenessSummary {
  const summary = (subUnit.learning_objectives || []).reduce((acc, objective) => {
    const metrics = getObjectivePrepMetrics(objective, subUnit);
    return {
      objectivesReady: acc.objectivesReady + (metrics.readySections === metrics.totalSections ? 1 : 0),
      objectivesTotal: acc.objectivesTotal + 1,
      sectionsReady: acc.sectionsReady + metrics.readySections,
      sectionsTotal: acc.sectionsTotal + metrics.totalSections,
      vocabularyReady: acc.vocabularyReady + (metrics.vocabulary.length > 0 ? 1 : 0),
      conceptReady: acc.conceptReady + (metrics.concept ? 1 : 0),
      examplesReady: acc.examplesReady + (metrics.examplesReady ? 1 : 0),
      resourcesReady: acc.resourcesReady + (metrics.resources.length > 0 ? 1 : 0),
    };
  }, {
    objectivesReady: 0,
    objectivesTotal: 0,
    sectionsReady: 0,
    sectionsTotal: 0,
    vocabularyReady: 0,
    conceptReady: 0,
    examplesReady: 0,
    resourcesReady: 0,
  });

  return finalizeSummary(summary);
}

export function summarizeUnitPrep(unit: TeachingUnit): PrepCompletenessSummary {
  return mergePrepCompletenessSummaries((unit.sub_units || []).map(summarizeSubUnitPrep));
}

export function summarizeYearPrep(year: string, units: TeachingUnit[]): PrepCompletenessSummary {
  return mergePrepCompletenessSummaries(
    units
      .filter(unit => unit.year_group === year)
      .map(summarizeUnitPrep)
  );
}

export function summarizeClassPrep(classProfile: ClassProfile, units: TeachingUnit[]): ClassPrepCompleteness {
  const currentUnit = units.find(unit => unit.id === classProfile.current_unit_id);
  return {
    classProfile,
    currentUnit,
    summary: currentUnit ? summarizeUnitPrep(currentUnit) : emptyPrepCompletenessSummary(),
  };
}

export function getPrepCoverageLevel(percent: number): 'low' | 'medium' | 'high' {
  if (percent >= 80) return 'high';
  if (percent >= 50) return 'medium';
  return 'low';
}
