import React, { memo } from 'react';
import { FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TimetableEntry, LessonRecord } from '../../types';
import { getEntryColorClasses, getEffectiveEndTime } from './calendarUtils';

interface EntryCardProps {
  entry: TimetableEntry;
  hasConflict: boolean;
  selectedDateStr: string;
  lessonRecords: LessonRecord[];
  onEditEntry: (entry: TimetableEntry, contextDate: string) => void;
}

export const EntryCard = memo(function EntryCard({ entry, hasConflict, selectedDateStr, lessonRecords, onEditEntry }: EntryCardProps) {
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
});

interface CurrentEntryCardProps {
  entry: TimetableEntry;
  hasConflict: boolean;
  selectedDateStr: string;
  lessonRecords: LessonRecord[];
  onEditEntry: (entry: TimetableEntry, contextDate: string) => void;
}

export const CurrentEntryCard = memo(function CurrentEntryCard({ entry, hasConflict, selectedDateStr, lessonRecords, onEditEntry }: CurrentEntryCardProps) {
  const hasLessonRecord = entry.type === 'lesson' && lessonRecords.some(
    r => r.timetable_entry_id === entry.id || (r.date === selectedDateStr && r.class_name === entry.class_name)
  );
  const endTime = getEffectiveEndTime(entry);
  const isPrepared = entry.prep_status === 'prepared' || entry.prep_status === 'finished' || entry.prep_status === 'recorded' || (!entry.prep_status && entry.is_prepared);
  const showPrepWarning = entry.type === 'lesson' && !isPrepared && (entry.prep_status !== undefined || entry.is_prepared !== undefined);

  return (
    <div
      onClick={() => onEditEntry(entry, selectedDateStr)}
      className={cn(
        "p-4 rounded-xl border-2 shadow-md transition-all hover:scale-[1.01] cursor-pointer relative",
        "ring-2 ring-offset-2",
        entry.type === 'lesson' ? "bg-indigo-50 border-indigo-300 text-indigo-700 ring-indigo-300" :
        entry.type === 'tutor' ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-emerald-300" :
        entry.type === 'duty' ? "bg-amber-50 border-amber-300 text-amber-700 ring-amber-300" :
        entry.type === 'meeting' ? "bg-purple-50 border-purple-300 text-purple-700 ring-purple-300" :
        "bg-slate-50 border-slate-300 text-slate-700 ring-slate-300"
      )}
    >
      {hasConflict && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" title="Schedule conflict" />
      )}
      <span className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        Now
      </span>

      <div className="flex justify-between items-start mt-1">
        <div>
          <p className="text-sm font-bold">{entry.subject}</p>
          <p className="text-xs opacity-80">{entry.class_name} · {entry.room}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasLessonRecord && (
            <span title="Has lesson record"><FileText size={12} className="text-teal-500" /></span>
          )}
          {entry.recurring_id && (
            <span className="text-[8px] font-bold px-1 rounded bg-amber-200 text-amber-700" title="Single-day override">OVR</span>
          )}
          {!entry.recurring_id && entry.date && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Date-specific" />
          )}
        </div>
      </div>

      <p className="text-xs font-medium mt-2 opacity-70">{entry.start_time} – {endTime}</p>

      {entry.topic && (
        <div className="mt-2 p-2 rounded-lg bg-white/80 border border-current/10 text-xs font-medium">
          Topic: {entry.topic}
        </div>
      )}

      {entry.notes && (
        <div className="mt-2 p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
          {entry.notes}
        </div>
      )}

      {showPrepWarning && (
        <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          ⚠ Not prepared
        </div>
      )}
      {isPrepared && (entry.prep_status || entry.is_prepared !== undefined) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={cn("w-2 h-2 rounded-full",
            entry.prep_status === 'recorded' ? "bg-slate-400" :
            entry.prep_status === 'finished' ? "bg-blue-500" :
            "bg-emerald-500"
          )} />
          <span className="opacity-70">
            {entry.prep_status === 'recorded' ? 'Recorded' :
             entry.prep_status === 'finished' ? 'Finished' : 'Prepared'}
          </span>
        </div>
      )}
    </div>
  );
});
