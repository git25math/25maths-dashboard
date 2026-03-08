import { memo } from 'react';
import { Award, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Student, HPAwardLog } from '../../types';

interface HPHistorySectionProps {
  student: Student;
  hpAwardLogs: HPAwardLog[];
  onNavigateToHPHistory?: (studentId: string) => void;
}

export const HPHistorySection = memo(function HPHistorySection({ student, hpAwardLogs, onNavigateToHPHistory }: HPHistorySectionProps) {
  const studentLogs = hpAwardLogs
    .filter(l => l.student_id === student.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const displayLogs = studentLogs.slice(0, 10);
  const totalHP = studentLogs.reduce((sum, l) => sum + l.points, 0);

  return (
    <section className="space-y-4">
      <h3 className="font-bold text-lg border-b border-slate-100 pb-2 flex items-center gap-2">
        <Award size={18} className="text-emerald-500" /> House Point History
      </h3>
      {studentLogs.length > 0 ? (
        <>
          <p className="text-sm text-slate-500">
            <span className="font-bold text-emerald-600">{totalHP} HP</span> from {studentLogs.length} award{studentLogs.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {displayLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400 font-mono w-[80px] shrink-0">{log.date}</span>
                <span className="text-sm text-slate-600 flex-1 truncate">{log.reason}</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-100">+{log.points}</span>
                <span className={cn(
                  "text-[10px] font-bold uppercase",
                  log.source === 'lesson' ? "text-indigo-500" : "text-amber-500"
                )}>{log.source}</span>
              </div>
            ))}
          </div>
          {studentLogs.length > 10 && onNavigateToHPHistory && (
            <button
              onClick={() => onNavigateToHPHistory(student.id)}
              className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:underline"
            >
              View All {studentLogs.length} Awards <ChevronRight size={16} />
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400 italic">No HP awards yet.</p>
      )}
    </section>
  );
});
