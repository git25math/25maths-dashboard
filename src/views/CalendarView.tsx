import React, { useState, useMemo, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { TimetableEntry, ClassProfile, TeachingUnit, LessonRecord } from '../types';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensors, useSensor, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { detectConflicts } from '../lib/timetableUtils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  getISODay,
  addWeeks,
  subWeeks,
} from 'date-fns';

const TIME_SLOTS = [
  '05:20', '06:20', '07:35', '07:45', '08:20', '09:10', '09:55', '10:25',
  '11:15', '12:05', '12:50', '13:35', '13:50', '14:40', '15:25', '15:30', '16:20', '16:30', '17:20'
];

const ENTRY_TYPES: TimetableEntry['type'][] = ['lesson', 'tutor', 'duty', 'meeting', 'break'];

interface CalendarViewProps {
  timetable: TimetableEntry[];
  onEditEntry: (entry: TimetableEntry, contextDate: string) => void;
  onAddEntry: (entry: TimetableEntry) => void;
  onUpdateEntry?: (entry: TimetableEntry) => void;
  classes: ClassProfile[];
  teachingUnits: TeachingUnit[];
  lessonRecords?: LessonRecord[];
  initialDate?: string;
}

function getEntryColorClasses(type: string) {
  switch (type) {
    case 'lesson': return "bg-indigo-50 border-indigo-100 text-indigo-700";
    case 'tutor': return "bg-emerald-50 border-emerald-100 text-emerald-700";
    case 'duty': return "bg-amber-50 border-amber-100 text-amber-700";
    case 'meeting': return "bg-purple-50 border-purple-100 text-purple-700";
    default: return "bg-slate-50 border-slate-200 text-slate-600";
  }
}

function timeDiffMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

// --- DnD Wrappers ---
function DraggableEntry({ entry, children }: { entry: TimetableEntry; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
    data: { entry },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

function DroppableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-t border-slate-100 py-1 transition-colors",
        isOver && "bg-indigo-50/50"
      )}
    >
      {children}
    </div>
  );
}

// --- Helper: get entries for a given date ---
function getEntriesForDate(date: Date, timetable: TimetableEntry[]): TimetableEntry[] {
  const isoWeekday = getISODay(date); // 1=Mon..7=Sun
  const dateStr = format(date, 'yyyy-MM-dd');

  const recurring = timetable.filter(e => !e.date && e.day === isoWeekday);
  const dateSpecific = timetable.filter(e => e.date === dateStr);

  // Date-specific entries override recurring at the same start_time
  const overriddenTimes = new Set(dateSpecific.map(e => e.start_time));
  // Also hide recurring entries that have been overridden by recurring_id
  const overriddenIds = new Set(dateSpecific.filter(e => e.recurring_id).map(e => e.recurring_id!));
  const merged = [
    ...dateSpecific,
    ...recurring.filter(e => !overriddenTimes.has(e.start_time) && !overriddenIds.has(e.id)),
  ];

  return merged.sort((a, b) => a.start_time.localeCompare(b.start_time));
}

// --- Helper: count entries for a date (for month grid dots) ---
function countEntriesForDate(date: Date, timetable: TimetableEntry[]): { total: number; hasDateSpecific: boolean } {
  const isoWeekday = getISODay(date);
  const dateStr = format(date, 'yyyy-MM-dd');
  const recurring = timetable.filter(e => !e.date && e.day === isoWeekday);
  const dateSpecific = timetable.filter(e => e.date === dateStr);
  const overriddenTimes = new Set(dateSpecific.map(e => e.start_time));
  const overriddenIds = new Set(dateSpecific.filter(e => e.recurring_id).map(e => e.recurring_id!));
  const total = dateSpecific.length + recurring.filter(e => !overriddenTimes.has(e.start_time) && !overriddenIds.has(e.id)).length;
  return { total, hasDateSpecific: dateSpecific.length > 0 };
}

export const CalendarView = ({
  timetable,
  onEditEntry,
  onAddEntry,
  onUpdateEntry,
  classes,
  teachingUnits,
  lessonRecords = [],
  initialDate,
}: CalendarViewProps) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(today);

  // Quick add state
  const [quickSubject, setQuickSubject] = useState('');
  const [quickClass, setQuickClass] = useState('');
  const [quickRoom, setQuickRoom] = useState('');
  const [quickTime, setQuickTime] = useState('');
  const [quickEndTime, setQuickEndTime] = useState('');
  const [quickType, setQuickType] = useState<TimetableEntry['type']>('lesson');
  const [quickRecurring, setQuickRecurring] = useState(false);
  const [quickRecurringDays, setQuickRecurringDays] = useState<number[]>([]);
  const [showFullQuickAdd, setShowFullQuickAdd] = useState(false);

  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Handle initialDate prop
  useEffect(() => {
    if (initialDate) {
      const d = new Date(initialDate + 'T12:00:00');
      setSelectedDate(d);
      setCurrentMonth(startOfMonth(d));
    }
  }, [initialDate]);

  // Entries for selected date
  const dayEntries = useMemo(() => getEntriesForDate(selectedDate, timetable), [selectedDate, timetable]);

  // Month grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Mobile week strip days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [selectedDate]);

  const handleQuickAdd = () => {
    if (!quickSubject || !quickTime) return;
    const endTime = quickEndTime || quickTime;

    // Find class_id from selected class name
    const matchedClass = classes.find(c => c.name === quickClass);

    if (quickRecurring && quickRecurringDays.length > 0) {
      // Create one entry per selected day
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

  const toggleRecurringDay = (day: number) => {
    setQuickRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onUpdateEntry) return;

    const entry = (active.data.current as { entry: TimetableEntry }).entry;
    const droppableId = over.id as string;

    // Parse droppable ID: "slot-{time}"
    const match = droppableId.match(/^slot-(.+)$/);
    if (!match) return;

    const newStartTime = match[1];

    // Skip if no change
    if (newStartTime === entry.start_time) return;

    // Preserve duration
    const duration = timeDiffMinutes(entry.start_time, entry.end_time);
    const newEndTime = addMinutesToTime(newStartTime, duration);

    onUpdateEntry({
      ...entry,
      start_time: newStartTime,
      end_time: newEndTime,
    });
  };

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const renderEntryCard = (entry: TimetableEntry, hasConflict = false) => {
    // Check if this entry has a matching lesson record
    const hasLessonRecord = entry.type === 'lesson' && lessonRecords.some(
      r => r.timetable_entry_id === entry.id || (r.date === selectedDateStr && r.class_name === entry.class_name)
    );

    return (
      <div
        onClick={() => onEditEntry(entry, selectedDateStr)}
        className={cn(
          "p-2 rounded-lg text-[10px] border shadow-sm transition-all hover:scale-[1.02] cursor-pointer relative",
          getEntryColorClasses(entry.type)
        )}
      >
        {hasConflict && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" title="Schedule conflict" />
        )}
        <div className="flex justify-between items-start">
          <p className="font-bold truncate">
            <span className="opacity-60 mr-1">{entry.start_time}</span>
            {entry.subject}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {hasLessonRecord && (
              <span title="Has lesson record"><FileText size={10} className="text-teal-500" /></span>
            )}
            {entry.recurring_id && (
              <span className="text-[8px] font-bold px-1 rounded bg-amber-200 text-amber-700" title="Single-day override">OVR</span>
            )}
            {!entry.recurring_id && entry.date && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Date-specific" />
            )}
            {(entry.prep_status || entry.is_prepared !== undefined) && (
              <div className={cn("w-1.5 h-1.5 rounded-full",
                (entry.prep_status === 'recorded') ? "bg-slate-400" :
                (entry.prep_status === 'finished') ? "bg-blue-500" :
                (entry.prep_status === 'prepared' || (!entry.prep_status && entry.is_prepared)) ? "bg-emerald-500" :
                "bg-red-500"
              )} />
            )}
          </div>
        </div>
        <p className="opacity-80 truncate">{entry.class_name}</p>
        <p className="opacity-60 truncate">{entry.room}</p>
        {entry.topic && <p className="mt-1 font-medium text-[8px] italic truncate">Topic: {entry.topic}</p>}
      </div>
    );
  };

  // --- Sub-components ---

  const CalendarHeader = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={18} className="text-slate-500" />
        </button>
        <h3 className="text-lg font-bold text-slate-900 min-w-[160px] text-center">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight size={18} className="text-slate-500" />
        </button>
      </div>
      <button
        onClick={() => { setCurrentMonth(startOfMonth(new Date())); setSelectedDate(new Date()); }}
        className="text-xs font-bold text-indigo-600 hover:underline px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        Today
      </button>
    </div>
  );

  const MonthGrid = () => (
    <div className="space-y-2">
      <CalendarHeader />
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
        {/* Day headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 py-2">
            {d}
          </div>
        ))}
        {/* Day cells */}
        {calendarDays.map(day => {
          const selected = isSameDay(day, selectedDate);
          const todayCell = isToday(day);
          const inMonth = isSameMonth(day, currentMonth);
          const { total, hasDateSpecific } = countEntriesForDate(day, timetable);

          return (
            <button
              key={day.toISOString()}
              onClick={() => { setSelectedDate(day); if (!isSameMonth(day, currentMonth)) setCurrentMonth(startOfMonth(day)); }}
              className={cn(
                "relative flex flex-col items-center justify-center py-2.5 min-h-[48px] transition-all text-xs font-medium bg-white",
                !inMonth && "opacity-40",
                selected && "bg-indigo-600 text-white",
                !selected && todayCell && "ring-2 ring-inset ring-indigo-400",
                !selected && inMonth && "text-slate-700 hover:bg-slate-50",
              )}
            >
              <span>{format(day, 'd')}</span>
              {total > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {total <= 3 ? (
                    Array.from({ length: total }).map((_, i) => (
                      <span key={i} className={cn("w-1 h-1 rounded-full", selected ? "bg-white/70" : "bg-indigo-400")} />
                    ))
                  ) : (
                    <span className={cn("text-[8px] font-bold", selected ? "text-white/70" : "text-indigo-400")}>
                      {total}
                    </span>
                  )}
                  {hasDateSpecific && !selected && (
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const DaySchedule = () => {
    const conflictSet = useMemo(() => {
      const ids = new Set<string>();
      for (const entry of dayEntries) {
        const c = detectConflicts(entry, dayEntries);
        if (c.length > 0) ids.add(entry.id);
      }
      return ids;
    }, [dayEntries]);

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {dayEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No entries for this day
            </div>
          ) : (
            <div className="space-y-1">
              {TIME_SLOTS.map(time => {
                const entry = dayEntries.find(e => e.start_time === time);
                if (!entry) return null;
                const cellId = `slot-${time}`;
                return (
                  <DroppableCell key={cellId} id={cellId}>
                    <DraggableEntry entry={entry}>
                      {renderEntryCard(entry, conflictSet.has(entry.id))}
                    </DraggableEntry>
                  </DroppableCell>
                );
              })}
              {/* Entries at non-standard times */}
              {dayEntries
                .filter(e => !TIME_SLOTS.includes(e.start_time))
                .map(entry => {
                  const cellId = `slot-${entry.start_time}`;
                  return (
                    <DroppableCell key={cellId} id={cellId}>
                      <DraggableEntry entry={entry}>
                        {renderEntryCard(entry, conflictSet.has(entry.id))}
                      </DraggableEntry>
                    </DroppableCell>
                  );
                })}
            </div>
          )}
        </DndContext>
      </div>
    );
  };

  const MobileDateStrip = () => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setSelectedDate(prev => subWeeks(prev, 1))}
        className="p-1 rounded-lg hover:bg-slate-100 shrink-0"
      >
        <ChevronLeft size={16} className="text-slate-400" />
      </button>
      <div className="flex-1 flex gap-1 overflow-x-auto pb-1">
        {weekDays.map(day => {
          const selected = isSameDay(day, selectedDate);
          const todayCell = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => { setSelectedDate(day); setCurrentMonth(startOfMonth(day)); }}
              className={cn(
                "flex-1 min-w-[40px] flex flex-col items-center py-2 rounded-xl text-xs font-bold transition-colors",
                selected
                  ? "bg-indigo-600 text-white"
                  : todayCell
                    ? "ring-2 ring-indigo-400 text-slate-700"
                    : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <span className="text-[10px] uppercase">{format(day, 'EEE')}</span>
              <span>{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setSelectedDate(prev => addWeeks(prev, 1))}
        className="p-1 rounded-lg hover:bg-slate-100 shrink-0"
      >
        <ChevronRight size={16} className="text-slate-400" />
      </button>
    </div>
  );

  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
        <div className="flex gap-2">
          <button disabled className="btn-secondary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Download PDF</button>
          <button disabled className="btn-primary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Edit Schedule</button>
        </div>
      </div>

      {/* Quick Add */}
      <div className="glass-card p-4 bg-indigo-50/30 border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <Plus size={16} /> Quick Add / Customize Event
        </h3>

        {/* Entry type selector */}
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

        {/* Multi-day recurring selector */}
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
              onClick={() => setShowFullQuickAdd(true)}
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
                // Open the full form with pre-filled data from QuickAdd
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

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        <MobileDateStrip />
        <DaySchedule />
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <DaySchedule />
        </div>
        <div className="md:col-span-1">
          <MonthGrid />
        </div>
      </div>
    </div>
  );
};
