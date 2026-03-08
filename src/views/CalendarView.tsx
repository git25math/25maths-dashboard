import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { TimetableEntry, ClassProfile, TeachingUnit, LessonRecord } from '../types';
import { PointerSensor, useSensors, useSensor, DragEndEvent } from '@dnd-kit/core';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { getEntriesForDate, timeDiffMinutes, addMinutesToTime } from './calendar/calendarUtils';
import { MonthGrid } from './calendar/MonthGrid';
import { DaySchedule } from './calendar/DaySchedule';
import { QuickAddForm } from './calendar/QuickAddForm';
import { MobileDateStrip } from './calendar/MobileDateStrip';

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (!isToday(selectedDate)) return;
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    }, 60_000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  useEffect(() => {
    if (initialDate) {
      const d = new Date(initialDate + 'T12:00:00');
      setSelectedDate(d);
      setCurrentMonth(startOfMonth(d));
    }
  }, [initialDate]);

  const dayEntries = useMemo(() => getEntriesForDate(selectedDate, timetable), [selectedDate, timetable]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [selectedDate]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !onUpdateEntry) return;

    const entry = (active.data.current as { entry: TimetableEntry }).entry;
    const droppableId = over.id as string;

    const match = droppableId.match(/^slot-(.+)$/);
    if (!match) return;

    const newStartTime = match[1];
    if (newStartTime === entry.start_time) return;

    const duration = timeDiffMinutes(entry.start_time, entry.end_time);
    const newEndTime = addMinutesToTime(newStartTime, duration);

    onUpdateEntry({
      ...entry,
      start_time: newStartTime,
      end_time: newEndTime,
    });
  }, [onUpdateEntry]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
        <div className="flex gap-2">
          <button disabled className="btn-secondary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Download PDF</button>
          <button disabled className="btn-primary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Edit Schedule</button>
        </div>
      </div>

      <QuickAddForm
        selectedDate={selectedDate}
        classes={classes}
        onAddEntry={onAddEntry}
        onEditEntry={onEditEntry}
      />

      <div className="md:hidden space-y-4">
        <MobileDateStrip
          selectedDate={selectedDate}
          weekDays={weekDays}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />
        <DaySchedule
          selectedDate={selectedDate}
          dayEntries={dayEntries}
          currentTime={currentTime}
          sensors={sensors}
          lessonRecords={lessonRecords}
          onEditEntry={onEditEntry}
          onDragEnd={handleDragEnd}
        />
      </div>

      <div className="hidden md:grid md:grid-cols-10 gap-6">
        <div className="md:col-span-7">
          <DaySchedule
            selectedDate={selectedDate}
            dayEntries={dayEntries}
            currentTime={currentTime}
            sensors={sensors}
            lessonRecords={lessonRecords}
            onEditEntry={onEditEntry}
            onDragEnd={handleDragEnd}
          />
        </div>
        <div className="md:col-span-3">
          <MonthGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            calendarDays={calendarDays}
            timetable={timetable}
            onMonthChange={setCurrentMonth}
            onDateSelect={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
};
