import React, { memo, useState, useEffect } from 'react';
import { X, AlertTriangle, Calendar, CalendarRange, Clock, CalendarClock } from 'lucide-react';
import { cn } from '../lib/utils';
import { SchoolEvent, EventTimeMode } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { ToggleSwitch } from './ToggleSwitch';

interface SchoolEventFormProps {
  event?: SchoolEvent | null;
  onSave: (data: Omit<SchoolEvent, 'id'>) => void;
  onCancel: () => void;
}

const TIME_MODES: { value: EventTimeMode; label: string; icon: typeof Calendar; color: string }[] = [
  { value: 'all-day', label: '整日活动', icon: Calendar, color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
  { value: 'multi-day', label: '连续数天', icon: CalendarRange, color: 'bg-purple-50 border-purple-200 text-purple-600' },
  { value: 'timed', label: '定时活动', icon: Clock, color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  { value: 'multi-day-timed', label: '跨天定时', icon: CalendarClock, color: 'bg-amber-50 border-amber-200 text-amber-600' },
];

const CATEGORIES: { value: SchoolEvent['category']; label: string; color: string }[] = [
  { value: 'school-wide', label: 'School-wide', color: 'bg-red-50 border-red-200 text-red-600' },
  { value: 'personal', label: 'Personal', color: 'bg-blue-50 border-blue-200 text-blue-600' },
  { value: 'house', label: 'House', color: 'bg-green-50 border-green-200 text-green-600' },
  { value: 'event', label: 'Event', color: 'bg-amber-50 border-amber-200 text-amber-600' },
];

export const SchoolEventForm = memo(function SchoolEventForm({ event, onSave, onCancel }: SchoolEventFormProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState(event?.date || '');
  const [endDate, setEndDate] = useState(event?.end_date || '');
  const [startTime, setStartTime] = useState(event?.start_time || '');
  const [endTime, setEndTime] = useState(event?.end_time || '');
  const [timeMode, setTimeMode] = useState<EventTimeMode>(event?.time_mode || 'all-day');
  const [category, setCategory] = useState<SchoolEvent['category']>(event?.category || 'school-wide');
  const [description, setDescription] = useState(event?.description || '');
  const [isActionRequired, setIsActionRequired] = useState(event?.is_action_required ?? false);

  const showEndDate = timeMode === 'multi-day' || timeMode === 'multi-day-timed';
  const showTime = timeMode === 'timed' || timeMode === 'multi-day-timed';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave({
      title, date, category, description, is_action_required: isActionRequired,
      time_mode: timeMode,
      end_date: showEndDate ? endDate || undefined : undefined,
      start_time: showTime ? startTime || undefined : undefined,
      end_time: showTime ? endTime || undefined : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">{event ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Time Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Time Mode</label>
            <div className="flex flex-wrap gap-2">
              {TIME_MODES.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setTimeMode(mode.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5",
                      timeMode === mode.value ? mode.color : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <Icon size={14} />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date / Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {showEndDate ? 'Start Date' : 'Date'}
              </label>
              <input
                required
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {showEndDate && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End Date</label>
                <input
                  required
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}
            {showTime && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start Time</label>
                  <input
                    required
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End Time</label>
                  <input
                    required
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                    category === cat.value ? cat.color : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <AlertTriangle size={16} className={isActionRequired ? "text-red-500" : "text-slate-400"} />
              Action Required
            </div>
            <ToggleSwitch checked={isActionRequired} onChange={setIsActionRequired} activeColor="bg-red-500" />
          </div>

          <RichTextEditor
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Describe the event..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              {event ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
