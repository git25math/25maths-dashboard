import {
  format,
  getISODay,
} from 'date-fns';
import { TimetableEntry } from '../../types';

export const TIME_SLOTS = [
  '05:20', '06:20', '07:35', '07:45', '08:20', '09:10', '09:55', '10:25',
  '11:15', '12:05', '12:50', '13:35', '13:50', '14:40', '15:25', '15:30', '16:20', '16:30', '17:20'
];

export const ENTRY_TYPES: TimetableEntry['type'][] = ['lesson', 'tutor', 'duty', 'meeting', 'break'];

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function getEntryColorClasses(type: string) {
  switch (type) {
    case 'lesson': return "bg-indigo-50 border-indigo-100 text-indigo-700";
    case 'tutor': return "bg-emerald-50 border-emerald-100 text-emerald-700";
    case 'duty': return "bg-amber-50 border-amber-100 text-amber-700";
    case 'meeting': return "bg-purple-50 border-purple-100 text-purple-700";
    default: return "bg-slate-50 border-slate-200 text-slate-600";
  }
}

export function timeDiffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function getEffectiveEndTime(entry: TimetableEntry): string {
  if (entry.end_time && entry.end_time !== entry.start_time) return entry.end_time;
  return addMinutesToTime(entry.start_time, 45);
}

export function compareEntriesByStartTime(a: TimetableEntry, b: TimetableEntry): number {
  return a.start_time.localeCompare(b.start_time)
    || getEffectiveEndTime(a).localeCompare(getEffectiveEndTime(b))
    || a.subject.localeCompare(b.subject)
    || a.id.localeCompare(b.id);
}

export function classifyEntries(
  entries: TimetableEntry[], now: string
): { past: TimetableEntry[]; current: TimetableEntry | null; upcoming: TimetableEntry[] } {
  const past: TimetableEntry[] = [];
  let current: TimetableEntry | null = null;
  const upcoming: TimetableEntry[] = [];

  for (const entry of entries) {
    const end = getEffectiveEndTime(entry);
    if (end <= now) {
      past.push(entry);
    } else if (entry.start_time <= now && now < end) {
      if (current && entry.start_time > current.start_time) {
        past.push(current);
        current = entry;
      } else if (current) {
        past.push(entry);
      } else {
        current = entry;
      }
    } else {
      upcoming.push(entry);
    }
  }
  return { past, current, upcoming };
}

export function getEntriesForDate(date: Date, timetable: TimetableEntry[]): TimetableEntry[] {
  const isoWeekday = getISODay(date);
  const dateStr = format(date, 'yyyy-MM-dd');

  const recurring = timetable.filter(e => !e.date && e.day === isoWeekday);
  const dateSpecific = timetable.filter(e => e.date === dateStr);

  const overriddenTimes = new Set(dateSpecific.map(e => e.start_time));
  const overriddenIds = new Set(dateSpecific.filter(e => e.recurring_id).map(e => e.recurring_id!));
  const merged = [
    ...dateSpecific,
    ...recurring.filter(e => !overriddenTimes.has(e.start_time) && !overriddenIds.has(e.id)),
  ];

  return merged.sort(compareEntriesByStartTime);
}

export function countEntriesForDate(date: Date, timetable: TimetableEntry[]): { total: number; hasDateSpecific: boolean } {
  const isoWeekday = getISODay(date);
  const dateStr = format(date, 'yyyy-MM-dd');
  const recurring = timetable.filter(e => !e.date && e.day === isoWeekday);
  const dateSpecific = timetable.filter(e => e.date === dateStr);
  const overriddenTimes = new Set(dateSpecific.map(e => e.start_time));
  const overriddenIds = new Set(dateSpecific.filter(e => e.recurring_id).map(e => e.recurring_id!));
  const total = dateSpecific.length + recurring.filter(e => !overriddenTimes.has(e.start_time) && !overriddenIds.has(e.id)).length;
  return { total, hasDateSpecific: dateSpecific.length > 0 };
}
