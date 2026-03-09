import React, { useState, useMemo, memo } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TimetableEntry, LessonRecord } from '../../types';
import { DndContext, DragEndEvent, useSensors } from '@dnd-kit/core';
import { format, isToday } from 'date-fns';
import { detectConflicts } from '../../lib/timetableUtils';
import { DraggableEntry, DroppableCell } from './DndWrappers';
import { EntryCard, CurrentEntryCard } from './EntryCard';
import { classifyEntries, compareEntriesByStartTime, getEffectiveEndTime } from './calendarUtils';

interface DayScheduleProps {
  selectedDate: Date;
  dayEntries: TimetableEntry[];
  currentTime: string;
  sensors: ReturnType<typeof useSensors>;
  lessonRecords: LessonRecord[];
  onEditEntry: (entry: TimetableEntry, contextDate: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export const DaySchedule = memo(function DaySchedule({
  selectedDate,
  dayEntries,
  currentTime,
  sensors,
  lessonRecords,
  onEditEntry,
  onDragEnd,
}: DayScheduleProps) {
  const [pastExpanded, setPastExpanded] = useState(false);
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const conflictSet = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of dayEntries) {
      const c = detectConflicts(entry, dayEntries);
      if (c.length > 0) ids.add(entry.id);
    }
    return ids;
  }, [dayEntries]);

  const { past, current, upcoming } = useMemo(() => {
    if (!isToday(selectedDate)) return { past: [] as TimetableEntry[], current: null, upcoming: dayEntries };
    return classifyEntries(dayEntries, currentTime);
  }, [dayEntries, currentTime, selectedDate]);

  const isTodayView = isToday(selectedDate);

  const renderEntryList = (entries: TimetableEntry[], dimmed = false) => (
    <div className={cn("space-y-1", dimmed && "opacity-60")}>
      {[...entries].sort(compareEntriesByStartTime).map(entry => {
        const cellId = `slot-${entry.start_time}`;
        return (
          <DroppableCell key={entry.id} id={cellId}>
            <DraggableEntry entry={entry}>
              <EntryCard
                entry={entry}
                hasConflict={conflictSet.has(entry.id)}
                selectedDateStr={selectedDateStr}
                lessonRecords={lessonRecords}
                onEditEntry={onEditEntry}
              />
            </DraggableEntry>
          </DroppableCell>
        );
      })}
    </div>
  );

  const renderFlatList = () => renderEntryList(dayEntries);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900">
        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
      </h3>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {dayEntries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No entries for this day
          </div>
        ) : !isTodayView ? (
          renderFlatList()
        ) : (
          <div className="space-y-3">
            {past.length > 0 && (
              <div>
                <button
                  onClick={() => setPastExpanded(p => !p)}
                  className="w-full flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors py-1"
                >
                  <ChevronDown size={14} className={cn("transition-transform", !pastExpanded && "-rotate-90")} />
                  <span className="font-medium">
                    {past.length} completed {past.length === 1 ? 'entry' : 'entries'}
                  </span>
                  <span className="opacity-60">
                    · {past[0].start_time} – {getEffectiveEndTime(past[past.length - 1])}
                  </span>
                </button>
                {pastExpanded && renderEntryList(past, true)}
              </div>
            )}

            {current ? (
              <div>
                <DroppableCell id={`slot-${current.start_time}`}>
                  <DraggableEntry entry={current}>
                    <CurrentEntryCard
                      entry={current}
                      hasConflict={conflictSet.has(current.id)}
                      selectedDateStr={selectedDateStr}
                      lessonRecords={lessonRecords}
                      onEditEntry={onEditEntry}
                    />
                  </DraggableEntry>
                </DroppableCell>
              </div>
            ) : upcoming.length > 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-sm text-slate-400">
                No class in session · Next: {upcoming[0].subject} at {upcoming[0].start_time}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm font-medium">
                All done for today
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Upcoming</p>
                {renderEntryList(upcoming)}
              </div>
            )}
          </div>
        )}
      </DndContext>
    </div>
  );
});
