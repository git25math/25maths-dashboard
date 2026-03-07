import { SYLLABUS } from '../constants';
import { TeachingUnit } from '../types';
import { TEACHING_YEAR_GROUPS } from '../shared/constants';

function normalizeTopic(text: string): string {
  return text
    .toLowerCase()
    .replace(/^(?:unit\s*\d+\s*:\s*|pure\s*\d+\s*-\s*\d+\.\s*)/, '')
    .replace(/[()]/g, ' ')
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isTeachingUnitSyllabusMatch(entry: string, unit: Pick<TeachingUnit, 'title'>): boolean {
  const topicPart = normalizeTopic(entry);
  const unitTitle = normalizeTopic(unit.title);

  return (
    unitTitle === topicPart ||
    unitTitle.includes(topicPart) ||
    topicPart.includes(unitTitle)
  );
}

function getYearOrder(yearGroup: string): number {
  const yearIndex = TEACHING_YEAR_GROUPS.indexOf(yearGroup as typeof TEACHING_YEAR_GROUPS[number]);
  return yearIndex === -1 ? Number.MAX_SAFE_INTEGER : yearIndex;
}

function getSyllabusOrder(unit: TeachingUnit): number {
  const entries = SYLLABUS[unit.year_group] || [];
  const syllabusIndex = entries.findIndex(entry => isTeachingUnitSyllabusMatch(entry, unit));
  if (syllabusIndex !== -1) return syllabusIndex;

  const numericParts = unit.id.match(/\d+/g);
  if (numericParts && numericParts.length > 0) {
    return Number(numericParts[numericParts.length - 1]);
  }

  const titleMatch = unit.title.match(/(?:unit\s*)(\d+)/i);
  if (titleMatch) return Number(titleMatch[1]) - 1;

  return Number.MAX_SAFE_INTEGER;
}

export function compareTeachingUnits(a: TeachingUnit, b: TeachingUnit): number {
  const yearOrder = getYearOrder(a.year_group) - getYearOrder(b.year_group);
  if (yearOrder !== 0) return yearOrder;

  const syllabusOrder = getSyllabusOrder(a) - getSyllabusOrder(b);
  if (syllabusOrder !== 0) return syllabusOrder;

  return a.title.localeCompare(b.title);
}

export function sortTeachingUnits<T extends TeachingUnit>(units: T[]): T[] {
  return [...units].sort(compareTeachingUnits);
}
