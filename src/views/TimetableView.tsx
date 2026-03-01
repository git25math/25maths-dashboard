import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { TimetableEntry, ClassProfile, TeachingUnit } from '../types';

interface TimetableViewProps {
  timetable: TimetableEntry[];
  onEditEntry: (entry: TimetableEntry) => void;
  onAddEntry: (entry: TimetableEntry) => void;
  classes: ClassProfile[];
  teachingUnits: TeachingUnit[];
}

export const TimetableView = ({ timetable, onEditEntry, onAddEntry, classes, teachingUnits }: TimetableViewProps) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const [quickSubject, setQuickSubject] = useState('');
  const [quickClass, setQuickClass] = useState('');
  const [quickRoom, setQuickRoom] = useState('');
  const [quickTime, setQuickTime] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Weekly Timetable</h2>
        <div className="flex gap-2">
          <button disabled className="btn-secondary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Download PDF</button>
          <button disabled className="btn-primary text-sm opacity-50 cursor-not-allowed" title="Coming Soon">Edit Schedule</button>
        </div>
      </div>

      <div className="glass-card p-4 bg-indigo-50/30 border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <Plus size={16} /> Quick Add / Customize Event
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Subject (e.g. Flag Raising)"
            className="text-xs p-2 rounded-lg border border-indigo-100 bg-white"
            value={quickSubject}
            onChange={(e) => setQuickSubject(e.target.value)}
          />
          <input
            type="text"
            placeholder="Class (e.g. Y11/Ma/B)"
            className="text-xs p-2 rounded-lg border border-indigo-100 bg-white"
            value={quickClass}
            onChange={(e) => setQuickClass(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room (e.g. A327)"
            className="text-xs p-2 rounded-lg border border-indigo-100 bg-white"
            value={quickRoom}
            onChange={(e) => setQuickRoom(e.target.value)}
          />
          <input
            type="time"
            className="text-xs p-2 rounded-lg border border-indigo-100 bg-white"
            value={quickTime}
            onChange={(e) => setQuickTime(e.target.value)}
          />
          <button onClick={handleQuickAdd} className="btn-primary text-xs py-2 bg-indigo-600 border-none">Add to Schedule</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-6 gap-4">
          <div className="col-span-1"></div>
          {days.map(day => (
            <div key={day} className="text-center font-bold text-slate-500 uppercase text-xs tracking-widest pb-2">
              {day}
            </div>
          ))}

          {[
            '05:20', '06:20', '07:35', '07:45', '08:20', '09:10', '09:55', '10:25',
            '11:15', '12:05', '12:50', '13:35', '13:50', '14:40', '15:25', '15:30', '16:20', '16:30', '17:20'
          ].map(time => (
            <React.Fragment key={time}>
              <div className="text-right pr-4 text-[10px] font-medium text-slate-400 py-4 border-t border-slate-100">
                {time}
              </div>
              {[1, 2, 3, 4, 5].map(day => {
                const entry = timetable.find(e => e.day === day && e.start_time === time);
                return (
                  <div key={`${day}-${time}`} className="border-t border-slate-100 py-1">
                    {entry ? (
                      <div
                        onClick={() => onEditEntry(entry)}
                        className={cn(
                          "p-2 rounded-lg text-[10px] h-full border shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
                          entry.type === 'lesson' ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                          entry.type === 'tutor' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                          entry.type === 'duty' ? "bg-amber-50 border-amber-100 text-amber-700" :
                          entry.type === 'meeting' ? "bg-purple-50 border-purple-100 text-purple-700" :
                          "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold truncate">{entry.subject}</p>
                          {entry.is_prepared !== undefined && (
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              entry.is_prepared ? "bg-emerald-500" : "bg-red-500"
                            )} />
                          )}
                        </div>
                        <p className="opacity-80 truncate">{entry.class_name}</p>
                        <p className="opacity-60 truncate">{entry.room}</p>
                        {entry.topic && <p className="mt-1 font-medium text-[8px] italic truncate">Topic: {entry.topic}</p>}
                      </div>
                    ) : (
                      <div className="h-full min-h-[40px] rounded-lg border border-dashed border-slate-100 bg-slate-50/10 flex items-center justify-center">
                        <span className="text-[8px] text-slate-300 font-medium uppercase tracking-tighter">Free / Cover</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
