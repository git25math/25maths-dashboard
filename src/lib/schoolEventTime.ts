import { SchoolEvent, EventTimeMode } from '../types';

function normalizeTime(time?: string, fallback = '00:00:00') {
  if (!time) return fallback;
  return time.length === 5 ? `${time}:00` : time;
}

function parseLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${normalizeTime(time)}`);
}

export function getSchoolEventTimeRange(event: SchoolEvent) {
  const mode: EventTimeMode = event.time_mode || 'all-day';
  const startDate = event.date;
  const endDate = event.end_date || event.date;

  switch (mode) {
    case 'multi-day':
      return {
        start: parseLocalDateTime(startDate, '00:00:00'),
        end: parseLocalDateTime(endDate, '23:59:59'),
      };
    case 'timed':
      return {
        start: parseLocalDateTime(startDate, event.start_time || '00:00:00'),
        end: parseLocalDateTime(startDate, event.end_time || event.start_time || '23:59:59'),
      };
    case 'multi-day-timed':
      return {
        start: parseLocalDateTime(startDate, event.start_time || '00:00:00'),
        end: parseLocalDateTime(endDate, event.end_time || '23:59:59'),
      };
    case 'all-day':
    default:
      return {
        start: parseLocalDateTime(startDate, '00:00:00'),
        end: parseLocalDateTime(startDate, '23:59:59'),
      };
  }
}

export function isSchoolEventPast(event: SchoolEvent, now = new Date()) {
  return getSchoolEventTimeRange(event).end.getTime() < now.getTime();
}

export function compareSchoolEventsUpcoming(a: SchoolEvent, b: SchoolEvent) {
  const aRange = getSchoolEventTimeRange(a);
  const bRange = getSchoolEventTimeRange(b);
  return aRange.start.getTime() - bRange.start.getTime();
}

export function compareSchoolEventsPast(a: SchoolEvent, b: SchoolEvent) {
  const aRange = getSchoolEventTimeRange(a);
  const bRange = getSchoolEventTimeRange(b);
  return bRange.end.getTime() - aRange.end.getTime();
}
