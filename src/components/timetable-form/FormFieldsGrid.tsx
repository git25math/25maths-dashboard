import React, { memo } from 'react';
import { TimetableEntry, ClassProfile, TeachingUnit } from '../../types';
import { cn } from '../../lib/utils';
import { getISODay, format } from 'date-fns';

interface FormFieldsGridProps {
  formData: TimetableEntry;
  setFormData: React.Dispatch<React.SetStateAction<TimetableEntry>>;
  selectedClass: ClassProfile | null;
  sortedTeachingUnits: TeachingUnit[];
  isOverrideMode: boolean;
}

export const FormFieldsGrid = memo(function FormFieldsGrid({
  formData,
  setFormData,
  selectedClass,
  sortedTeachingUnits,
  isOverrideMode,
}: FormFieldsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Subject / Topic</label>
        <input
          type="text"
          value={formData.subject}
          onChange={e => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Topic</label>
        <input
          type="text"
          value={formData.topic || ''}
          onChange={e => setFormData({ ...formData, topic: e.target.value })}
          placeholder="e.g. Quadratic Equations"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Linked Teaching Unit</label>
        <select
          value={formData.unit_id || ''}
          onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        >
          <option value="">No Unit Linked</option>
          {sortedTeachingUnits
            .filter(u => !selectedClass || u.year_group === selectedClass.year_group)
            .map(u => (
              <option key={u.id} value={u.id}>{u.title} ({u.year_group})</option>
            ))
          }
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Room</label>
        <input
          type="text"
          value={formData.room}
          onChange={e => setFormData({ ...formData, room: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start Time</label>
        <input
          type="time"
          value={formData.start_time}
          onChange={e => setFormData({ ...formData, start_time: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End Time</label>
        <input
          type="time"
          value={formData.end_time}
          onChange={e => setFormData({ ...formData, end_time: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      {!isOverrideMode && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Schedule Type</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, date: undefined })}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                !formData.date
                  ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              )}
            >
              Recurring Weekly
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, date: formData.date || format(new Date(), 'yyyy-MM-dd') })}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                formData.date
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              )}
            >
              Specific Date
            </button>
          </div>
        </div>
      )}
      {formData.date && !isOverrideMode && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={e => {
              const newDate = e.target.value;
              const newDay = newDate ? getISODay(new Date(newDate + 'T12:00:00')) : formData.day;
              setFormData({ ...formData, date: newDate, day: newDay });
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      )}
    </div>
  );
});
