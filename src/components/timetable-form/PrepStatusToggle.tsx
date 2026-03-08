import React, { memo } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { TimetableEntry, PrepStatus } from '../../types';
import { cn } from '../../lib/utils';

const PREP_STATUS_CONFIG: Record<PrepStatus, { label: string; color: string; next: PrepStatus }> = {
  not_prepared: { label: 'Not Prepared', color: 'bg-red-100 text-red-600 border-red-200', next: 'prepared' },
  prepared: { label: 'Prepared', color: 'bg-emerald-100 text-emerald-600 border-emerald-200', next: 'finished' },
  finished: { label: 'Finished', color: 'bg-blue-100 text-blue-600 border-blue-200', next: 'recorded' },
  recorded: { label: 'Recorded', color: 'bg-slate-100 text-slate-600 border-slate-200', next: 'not_prepared' },
};

interface PrepStatusToggleProps {
  formData: TimetableEntry;
  setFormData: React.Dispatch<React.SetStateAction<TimetableEntry>>;
}

export const PrepStatusToggle = memo(function PrepStatusToggle({
  formData,
  setFormData,
}: PrepStatusToggleProps) {
  const current: PrepStatus = formData.prep_status || (formData.is_prepared ? 'prepared' : 'not_prepared');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Preparation Status</label>
        <button
          type="button"
          onClick={() => {
            const next = PREP_STATUS_CONFIG[current].next;
            setFormData({ ...formData, prep_status: next, is_prepared: next === 'prepared' || next === 'finished' || next === 'recorded' });
          }}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
            PREP_STATUS_CONFIG[current].color
          )}
        >
          {(current === 'prepared' || current === 'finished' || current === 'recorded') ? <CheckCircle2 size={14} /> : <X size={14} />}
          {PREP_STATUS_CONFIG[current].label}
        </button>
      </div>
    </div>
  );
});
