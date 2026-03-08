import React, { useState, memo } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TimetableEntry, ClassProfile } from '../../types';
import { format, getISODay } from 'date-fns';
import { ENTRY_TYPES, DAY_LABELS } from './calendarUtils';

interface QuickAddFormProps {
  selectedDate: Date;
  classes: ClassProfile[];
  onAddEntry: (entry: TimetableEntry) => void;
  onEditEntry: (entry: TimetableEntry, contextDate: string) => void;
}

export const QuickAddForm = memo(function QuickAddForm({
  selectedDate,
  classes,
  onAddEntry,
  onEditEntry,
}: QuickAddFormProps) {
  const [quickSubject, setQuickSubject] = useState('');
  const [quickClass, setQuickClass] = useState('');
  const [quickRoom, setQuickRoom] = useState('');
  const [quickTime, setQuickTime] = useState('');
  const [quickEndTime, setQuickEndTime] = useState('');
  const [quickType, setQuickType] = useState<TimetableEntry['type']>('lesson');
  const [quickRecurring, setQuickRecurring] = useState(false);
  const [quickRecurringDays, setQuickRecurringDays] = useState<number[]>([]);

  const toggleRecurringDay = (day: number) => {
    setQuickRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleQuickAdd = () => {
    if (!quickSubject || !quickTime) return;
    const endTime = quickEndTime || quickTime;

    const matchedClass = classes.find(c => c.name === quickClass);

    if (quickRecurring && quickRecurringDays.length > 0) {
      for (const day of quickRecurringDays) {
        const newEntry: TimetableEntry = {
          id: `custom-${Date.now()}-${day}`,
          day,
          start_time: quickTime,
          end_time: endTime,
          subject: quickSubject,
          class_name: quickClass || '-',
          class_id: matchedClass?.id,
          room: quickRoom || '-',
          type: quickType,
        };
        onAddEntry(newEntry);
      }
    } else {
      const isoWeekday = getISODay(selectedDate);
      const newEntry: TimetableEntry = {
        id: `custom-${Date.now()}`,
        day: isoWeekday,
        start_time: quickTime,
        end_time: endTime,
        subject: quickSubject,
        class_name: quickClass || '-',
        class_id: matchedClass?.id,
        room: quickRoom || '-',
        type: quickType,
        ...(quickRecurring ? {} : { date: format(selectedDate, 'yyyy-MM-dd') }),
      };
      onAddEntry(newEntry);
    }

    setQuickSubject('');
    setQuickClass('');
    setQuickRoom('');
    setQuickTime('');
    setQuickEndTime('');
    setQuickRecurringDays([]);
  };

  return (
    <div className="glass-card p-4 bg-indigo-50/30 border-indigo-100">
      <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
        <Plus size={16} /> Quick Add / Customize Event
      </h3>

      <div className="flex gap-1 mb-3">
        {ENTRY_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setQuickType(t)}
            className={cn(
              "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
              quickType === t
                ? t === 'lesson' ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                  : t === 'tutor' ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : t === 'duty' ? "bg-amber-100 text-amber-700 border-amber-200"
                  : t === 'meeting' ? "bg-purple-100 text-purple-700 border-purple-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
                : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Subject"
          className="text-xs p-2 rounded-lg border border-indigo-100 bg-white"
          value={quickSubject}
          onChange={(e) => setQuickSubject(e.target.value)}
        />
        <select
          className="text-xs p-2 rounded-lg border border-indigo-100 bg-white"
          value={quickClass}
          onChange={(e) => setQuickClass(e.target.value)}
        >
          <option value="">Class...</option>
          {classes.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Room"
          className="text-xs p-2 rounded-lg border border-indigo-100 bg-white"
          value={quickRoom}
          onChange={(e) => setQuickRoom(e.target.value)}
        />
        <div className="flex gap-1 items-center">
          <input
            type="time"
            className="text-xs p-2 rounded-lg border border-indigo-100 bg-white flex-1"
            value={quickTime}
            onChange={(e) => setQuickTime(e.target.value)}
          />
          <span className="text-xs text-slate-400">-</span>
          <input
            type="time"
            className="text-xs p-2 rounded-lg border border-indigo-100 bg-white flex-1"
            value={quickEndTime}
            onChange={(e) => setQuickEndTime(e.target.value)}
            placeholder="End"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={quickRecurring}
            onChange={(e) => {
              setQuickRecurring(e.target.checked);
              if (!e.target.checked) setQuickRecurringDays([]);
            }}
            className="rounded border-slate-300"
          />
          Recurring
        </label>
        <button onClick={handleQuickAdd} className="btn-primary text-xs py-2 bg-indigo-600 border-none">Add</button>
      </div>

      {quickRecurring && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-500">Repeat on:</span>
          <div className="flex gap-1">
            {DAY_LABELS.map((label, i) => {
              const day = i + 1;
              const selected = quickRecurringDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleRecurringDay(day)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-[10px] font-bold border transition-all",
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              // Placeholder for full editor - just trigger onEditEntry
            }}
            className="ml-auto text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            Full editor <ArrowRight size={12} />
          </button>
        </div>
      )}

      {!quickRecurring && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => {
              if (quickSubject || quickTime) {
                const isoWeekday = getISODay(selectedDate);
                const matchedClass = classes.find(c => c.name === quickClass);
                const prefilled: TimetableEntry = {
                  id: `custom-${Date.now()}`,
                  day: isoWeekday,
                  start_time: quickTime || '08:00',
                  end_time: quickEndTime || quickTime || '09:00',
                  subject: quickSubject || '',
                  class_name: quickClass || '-',
                  class_id: matchedClass?.id,
                  room: quickRoom || '-',
                  type: quickType,
                  date: format(selectedDate, 'yyyy-MM-dd'),
                };
                onEditEntry(prefilled, format(selectedDate, 'yyyy-MM-dd'));
              }
            }}
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            Full editor <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
});
