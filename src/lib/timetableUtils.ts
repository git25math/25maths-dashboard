import { TimetableEntry } from '../types';

export interface TimetableConflict {
  entryA: TimetableEntry;
  entryB: TimetableEntry;
  message: string;
}

const DEFAULT_DURATION_MINUTES = 45;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getEffectiveEnd(entry: TimetableEntry): string {
  if (entry.end_time && entry.end_time !== entry.start_time) {
    return entry.end_time;
  }
  // Quick-add entries have end_time === start_time; default to 45 min
  const startMin = timeToMinutes(entry.start_time);
  const endMin = startMin + DEFAULT_DURATION_MINUTES;
  const h = Math.floor(endMin / 60) % 24;
  const m = endMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function overlaps(a: TimetableEntry, b: TimetableEntry): boolean {
  const aStart = timeToMinutes(a.start_time);
  const aEnd = timeToMinutes(getEffectiveEnd(a));
  const bStart = timeToMinutes(b.start_time);
  const bEnd = timeToMinutes(getEffectiveEnd(b));
  return aStart < bEnd && bStart < aEnd;
}

function sharesDay(a: TimetableEntry, b: TimetableEntry): boolean {
  // Both date-specific on same date
  if (a.date && b.date) return a.date === b.date;
  // Both recurring on same day
  if (!a.date && !b.date) return a.day === b.day;
  // One recurring, one date-specific: match by day number
  if (a.date && !b.date) {
    const d = new Date(a.date + 'T12:00:00');
    const isoDay = d.getDay() === 0 ? 7 : d.getDay();
    return isoDay === b.day;
  }
  if (!a.date && b.date) {
    const d = new Date(b.date + 'T12:00:00');
    const isoDay = d.getDay() === 0 ? 7 : d.getDay();
    return isoDay === a.day;
  }
  return false;
}

export function detectConflicts(
  entry: TimetableEntry,
  allEntries: TimetableEntry[]
): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];

  for (const other of allEntries) {
    if (other.id === entry.id) continue;
    if (!sharesDay(entry, other)) continue;
    if (!overlaps(entry, other)) continue;

    conflicts.push({
      entryA: entry,
      entryB: other,
      message: `Overlaps with ${other.subject} (${other.class_name}) at ${other.start_time}–${getEffectiveEnd(other)}`,
    });
  }

  return conflicts;
}
