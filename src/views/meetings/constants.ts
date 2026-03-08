import { MeetingRecord } from '../../types';

export const CATEGORIES: { value: MeetingRecord['category']; label: string }[] = [
  { value: 'flag-raising', label: 'Flag Raising' },
  { value: 'ws-staff', label: 'WS Staff Meeting' },
  { value: 'us-staff', label: 'US Staff Meeting' },
  { value: 'tutor', label: 'Tutor Meeting' },
  { value: 'department', label: 'Department Meeting' },
  { value: 'sptc', label: 'SPTC Meeting' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'parent', label: 'Parent Meeting' },
  { value: 'other', label: 'Others' },
];

export const STATUS_COLORS: Record<MeetingRecord['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  transcribing: 'bg-amber-50 text-amber-600',
  summarizing: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

export const CATEGORY_COLORS: Record<MeetingRecord['category'], string> = {
  'flag-raising': 'bg-red-50 text-red-600',
  'ws-staff': 'bg-purple-50 text-purple-600',
  'us-staff': 'bg-violet-50 text-violet-600',
  tutor: 'bg-emerald-50 text-emerald-600',
  department: 'bg-indigo-50 text-indigo-600',
  sptc: 'bg-cyan-50 text-cyan-600',
  assembly: 'bg-amber-50 text-amber-600',
  parent: 'bg-orange-50 text-orange-600',
  other: 'bg-slate-100 text-slate-500',
};

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
