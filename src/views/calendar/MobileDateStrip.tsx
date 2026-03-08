import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  format,
  startOfMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
} from 'date-fns';

interface MobileDateStripProps {
  selectedDate: Date;
  weekDays: Date[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (month: Date) => void;
}

export const MobileDateStrip = memo(function MobileDateStrip({
  selectedDate,
  weekDays,
  onDateSelect,
  onMonthChange,
}: MobileDateStripProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          const prev = subWeeks(selectedDate, 1);
          onDateSelect(prev);
          onMonthChange(startOfMonth(prev));
        }}
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
              onClick={() => { onDateSelect(day); onMonthChange(startOfMonth(day)); }}
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
        onClick={() => {
          const next = addWeeks(selectedDate, 1);
          onDateSelect(next);
          onMonthChange(startOfMonth(next));
        }}
        className="p-1 rounded-lg hover:bg-slate-100 shrink-0"
      >
        <ChevronRight size={16} className="text-slate-400" />
      </button>
    </div>
  );
});
