import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TimetableEntry } from '../../types';
import {
  format,
  startOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { countEntriesForDate } from './calendarUtils';

interface MonthGridProps {
  currentMonth: Date;
  selectedDate: Date;
  calendarDays: Date[];
  timetable: TimetableEntry[];
  onMonthChange: (month: Date) => void;
  onDateSelect: (date: Date) => void;
}

export const MonthGrid = memo(function MonthGrid({
  currentMonth,
  selectedDate,
  calendarDays,
  timetable,
  onMonthChange,
  onDateSelect,
}: MonthGridProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft size={18} className="text-slate-500" />
          </button>
          <h3 className="text-lg font-bold text-slate-900 min-w-[160px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronRight size={18} className="text-slate-500" />
          </button>
        </div>
        <button
          onClick={() => { onMonthChange(startOfMonth(new Date())); onDateSelect(new Date()); }}
          className="text-xs font-bold text-indigo-600 hover:underline px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Today
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 py-2">
            {d}
          </div>
        ))}
        {calendarDays.map(day => {
          const selected = isSameDay(day, selectedDate);
          const todayCell = isToday(day);
          const inMonth = isSameMonth(day, currentMonth);
          const { total, hasDateSpecific } = countEntriesForDate(day, timetable);

          return (
            <button
              key={day.toISOString()}
              onClick={() => { onDateSelect(day); if (!isSameMonth(day, currentMonth)) onMonthChange(startOfMonth(day)); }}
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
});
