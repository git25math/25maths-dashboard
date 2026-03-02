import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { TimetableEntry, ClassProfile, TeachingUnit } from '../types';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensors, useSensor, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const TIME_SLOTS = [
  '05:20', '06:20', '07:35', '07:45', '08:20', '09:10', '09:55', '10:25',
  '11:15', '12:05', '12:50', '13:35', '13:50', '14:40', '15:25', '15:30', '16:20', '16:30', '17:20'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface TimetableViewProps {
  timetable: TimetableEntry[];
  onEditEntry: (entry: TimetableEntry) => void;
  onAddEntry: (entry: TimetableEntry) => void;
  onUpdateEntry?: (entry: TimetableEntry) => void;
  classes: ClassProfile[];
  teachingUnits: TeachingUnit[];
}

function getEntryColorClasses(type: string) {
  switch (type) {
    case 'lesson': return "bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300";
    case 'tutor': return "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-800 dark:text-emerald-300";
    case 'duty': return "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-300";
    case 'meeting': return "bg-purple-50 border-purple-100 text-purple-700 dark:bg-purple-900/40 dark:border-purple-800 dark:text-purple-300";
    default: return "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300";
  }
}

// --- Time helpers ---
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
        "border-t border-slate-100 dark:border-slate-700 py-1 transition-colors",
        isOver && "bg-indigo-50/50 dark:bg-indigo-900/30"
      )}
    >
      {children}
    </div>
  );
}

export const TimetableView = ({ timetable, onEditEntry, onAddEntry, onUpdateEntry, classes, teachingUnits }: TimetableViewProps) => {
  const [quickSubject, setQuickSubject] = useState('');
  const [quickClass, setQuickClass] = useState('');
  const [quickRoom, setQuickRoom] = useState('');
  const [quickTime, setQuickTime] = useState('');

  // Mobile day selector
  const todayIdx = (() => { const d = new Date().getDay(); return d >= 1 && d <= 5 ? d - 1 : 0; })();
  const [mobileDay, setMobileDay] = useState(todayIdx);

  // DnD sensors — distance: 8 to prevent click→drag conflict
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleQuickAdd = () => {
    if (!quickSubject || !quickTime) return;
    const newEntry: TimetableEntry = {
      id: `custom-${Date.now()}`,
      day: new Date().getDay() || 1,
      start_time: quickTime,
      end_time: quickTime,
      subject: quickSubject,
      class_name: quickClass || '-',
      room: quickRoom || '-',
      type: 'lesson',
    };
    onAddEntry(newEntry);
    setQuickSubject('');
    setQuickClass('');
    setQuickRoom('');
    setQuickTime('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onUpdateEntry) return;

    const entry = (active.data.current as { entry: TimetableEntry }).entry;
    const droppableId = over.id as string;

    // Parse droppable ID: "{day}-slot-{time}"
    const match = droppableId.match(/^(\d)-slot-(.+)$/);
    if (!match) return;

    const newDay = parseInt(match[1]);
    const newStartTime = match[2];

    // Skip if no change
    if (newDay === entry.day && newStartTime === entry.start_time) return;

    // Preserve duration
    const duration = timeDiffMinutes(entry.start_time, entry.end_time);
    const newEndTime = addMinutesToTime(newStartTime, duration);

    onUpdateEntry({
      ...entry,
      day: newDay,
      start_time: newStartTime,
      end_time: newEndTime,
    });
  };

  const renderEntryCard = (entry: TimetableEntry, showTime = false) => (
    <div
      onClick={() => onEditEntry(entry)}
      className={cn(
        "p-2 rounded-lg text-[10px] border shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
        getEntryColorClasses(entry.type)
      )}
    >
      <div className="flex justify-between items-start">
        <p className="font-bold truncate">{showTime && <span className="opacity-60 mr-1">{entry.start_time}</span>}{entry.subject}</p>
        {entry.is_prepared !== undefined && (
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", entry.is_prepared ? "bg-emerald-500" : "bg-red-500")} />
        )}
      </div>
      <p className="opacity-80 truncate">{entry.class_name}</p>
      <p className="opacity-60 truncate">{entry.room}</p>
      {entry.topic && <p className="mt-1 font-medium text-[8px] italic truncate">Topic: {entry.topic}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Weekly Timetable</h2>
        <div className="flex gap-2">
          <button disabled className="btn-secondary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Download PDF</button>
          <button disabled className="btn-primary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Edit Schedule</button>
        </div>
      </div>

      <div className="glass-card p-4 bg-indigo-50/30 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
        <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
          <Plus size={16} /> Quick Add / Customize Event
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Subject (e.g. Flag Raising)"
            className="text-xs p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-700 dark:text-slate-100"
            value={quickSubject}
            onChange={(e) => setQuickSubject(e.target.value)}
          />
          <input
            type="text"
            placeholder="Class (e.g. Y11/Ma/B)"
            className="text-xs p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-700 dark:text-slate-100"
            value={quickClass}
            onChange={(e) => setQuickClass(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room (e.g. A327)"
            className="text-xs p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-700 dark:text-slate-100"
            value={quickRoom}
            onChange={(e) => setQuickRoom(e.target.value)}
          />
          <input
            type="time"
            className="text-xs p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-700 dark:text-slate-100"
            value={quickTime}
            onChange={(e) => setQuickTime(e.target.value)}
          />
          <button onClick={handleQuickAdd} className="btn-primary text-xs py-2 bg-indigo-600 border-none">Add to Schedule</button>
        </div>
      </div>

      {/* Mobile View: Day Tabs + Stacked Cards */}
      <div className="md:hidden space-y-4">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {DAYS.map((day, idx) => (
            <button
              key={day}
              onClick={() => setMobileDay(idx)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors",
                mobileDay === idx
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {TIME_SLOTS.map(time => {
            const entry = timetable.find(e => e.day === mobileDay + 1 && e.start_time === time);
            if (!entry) return null;
            return (
              <div key={time} className="flex gap-3 items-start">
                <div className="text-[10px] font-medium text-slate-400 pt-2 w-10 shrink-0 text-right">{time}</div>
                <div className="flex-1">{renderEntryCard(entry)}</div>
              </div>
            );
          })}
          {timetable.filter(e => e.day === mobileDay + 1).length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">No entries for {DAYS[mobileDay]}</div>
          )}
        </div>
      </div>

      {/* Desktop View: DnD Grid */}
      <div className="hidden md:block overflow-x-auto">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="min-w-[800px] grid grid-cols-6 gap-4">
            <div className="col-span-1"></div>
            {DAYS.map(day => (
              <div key={day} className="text-center font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-widest pb-2">
                {day}
              </div>
            ))}

            {TIME_SLOTS.map(time => (
              <React.Fragment key={time}>
                <div className="text-right pr-4 text-[10px] font-medium text-slate-400 py-4 border-t border-slate-100 dark:border-slate-700">
                  {time}
                </div>
                {[1, 2, 3, 4, 5].map(day => {
                  const entry = timetable.find(e => e.day === day && e.start_time === time);
                  const cellId = `${day}-slot-${time}`;
                  return (
                    <DroppableCell key={cellId} id={cellId}>
                      {entry ? (
                        <DraggableEntry entry={entry}>
                          {renderEntryCard(entry)}
                        </DraggableEntry>
                      ) : (
                        <div className="h-full min-h-[40px] rounded-lg border border-dashed border-slate-100 dark:border-slate-700 bg-slate-50/10 dark:bg-slate-800/30 flex items-center justify-center">
                          <span className="text-[8px] text-slate-300 dark:text-slate-600 font-medium uppercase tracking-tighter">Free / Cover</span>
                        </div>
                      )}
                    </DroppableCell>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};
