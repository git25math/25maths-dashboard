import type { Task, TaskPriority, PayhipStatus } from '../types';

// ─── Task status colors (used in MeetingsView, EmailDigestView) ───
export const TASK_STATUS_COLORS: Record<Task['status'], string> = {
  inbox: 'bg-slate-100 text-slate-600',
  next: 'bg-blue-50 text-blue-600',
  waiting: 'bg-amber-50 text-amber-600',
  someday: 'bg-purple-50 text-purple-600',
  done: 'bg-emerald-50 text-emerald-600',
};

export const TASK_STATUS_CYCLE: Task['status'][] = ['inbox', 'next', 'waiting', 'someday', 'done'];

// ─── Payhip status styles (used in PayhipCard, PayhipDetailSheet) ───
export const PAYHIP_STATUS_STYLES: Record<PayhipStatus, string> = {
  planned: 'bg-slate-100 text-slate-500',
  presale: 'bg-amber-50 text-amber-700',
  live: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-200 text-slate-600',
  free_sample_live: 'bg-sky-50 text-sky-700',
};

export const PAYHIP_STATUS_STYLES_HOVER: Record<PayhipStatus, string> = {
  planned: 'bg-slate-100 text-slate-500 hover:bg-slate-200',
  presale: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  live: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  archived: 'bg-slate-200 text-slate-600 hover:bg-slate-300',
  free_sample_live: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
};

// ─── Priority pill colors (used in IdeaForm, ConsolidatePreviewModal, SmartExtractModal) ───
export function getPriorityPillColor(priority: TaskPriority): string {
  switch (priority) {
    case 'high': return 'bg-red-50 border-red-200 text-red-600';
    case 'medium': return 'bg-amber-50 border-amber-200 text-amber-600';
    case 'low': return 'bg-blue-50 border-blue-200 text-blue-600';
  }
}
