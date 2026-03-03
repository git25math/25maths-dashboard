import { useState, useMemo, useEffect } from 'react';
import { Award, Users, BookOpen, Zap, Calendar, X, ChevronRight, List, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { HPAwardLog, Student, ClassProfile } from '../types';

interface HousePointHistoryViewProps {
  hpAwardLogs: HPAwardLog[];
  students: Student[];
  classes: ClassProfile[];
  onDeleteLog?: (id: string) => void;
  initialStudentFilter?: string | null;
  onClearInitialFilter?: () => void;
}

export const HousePointHistoryView = ({
  hpAwardLogs,
  students,
  classes,
  onDeleteLog,
  initialStudentFilter,
  onClearInitialFilter,
}: HousePointHistoryViewProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'class'>('list');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Apply initial student filter from navigation
  useEffect(() => {
    if (initialStudentFilter) {
      setStudentFilter(initialStudentFilter);
      setViewMode('list');
    }
  }, [initialStudentFilter]);

  const classNames = useMemo(() =>
    Array.from(new Set(hpAwardLogs.map(l => l.class_name).filter(Boolean))).sort(),
    [hpAwardLogs]
  );

  const filteredStudentOptions = useMemo(() => {
    const relevant = classFilter === 'all'
      ? students
      : students.filter(s => s.class_name === classFilter);
    return relevant.sort((a, b) => a.name.localeCompare(b.name));
  }, [students, classFilter]);

  const filteredLogs = useMemo(() => {
    let logs = [...hpAwardLogs];
    if (classFilter !== 'all') {
      logs = logs.filter(l => l.class_name === classFilter);
    }
    if (studentFilter !== 'all') {
      logs = logs.filter(l => l.student_id === studentFilter);
    }
    if (dateFrom) {
      logs = logs.filter(l => l.date >= dateFrom);
    }
    if (dateTo) {
      logs = logs.filter(l => l.date <= dateTo);
    }
    return logs.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [hpAwardLogs, classFilter, studentFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const totalHP = filteredLogs.reduce((sum, l) => sum + l.points, 0);
    const uniqueStudents = new Set(filteredLogs.map(l => l.student_id)).size;
    const fromLessons = filteredLogs.filter(l => l.source === 'lesson').reduce((sum, l) => sum + l.points, 0);
    const fromBatch = filteredLogs.filter(l => l.source === 'batch').reduce((sum, l) => sum + l.points, 0);
    return { totalHP, uniqueStudents, fromLessons, fromBatch };
  }, [filteredLogs]);

  // Class-grouped data
  const classGrouped = useMemo(() => {
    const groups = new Map<string, { logs: HPAwardLog[]; totalHP: number; students: Map<string, { name: string; totalHP: number; count: number }> }>();
    for (const log of filteredLogs) {
      const cls = log.class_name || 'Unknown';
      if (!groups.has(cls)) {
        groups.set(cls, { logs: [], totalHP: 0, students: new Map() });
      }
      const g = groups.get(cls)!;
      g.logs.push(log);
      g.totalHP += log.points;
      if (!g.students.has(log.student_id)) {
        g.students.set(log.student_id, { name: log.student_name, totalHP: 0, count: 0 });
      }
      const s = g.students.get(log.student_id)!;
      s.totalHP += log.points;
      s.count += 1;
    }
    return Array.from(groups.entries())
      .map(([name, data]) => ({
        name,
        totalHP: data.totalHP,
        logs: data.logs,
        students: Array.from(data.students.entries())
          .map(([id, info]) => ({ id, ...info }))
          .sort((a, b) => b.totalHP - a.totalHP),
      }))
      .sort((a, b) => b.totalHP - a.totalHP);
  }, [filteredLogs]);

  const clearFilters = () => {
    setClassFilter('all');
    setStudentFilter('all');
    setDateFrom('');
    setDateTo('');
    onClearInitialFilter?.();
  };

  const hasActiveFilters = classFilter !== 'all' || studentFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Award size={24} className="text-emerald-600" /> HP History
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''}</span>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded transition-all",
                viewMode === 'list' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('class')}
              className={cn(
                "p-1.5 rounded transition-all",
                viewMode === 'class' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
              title="Class View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Class filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setClassFilter('all'); setStudentFilter('all'); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
            classFilter === 'all'
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
          )}
        >
          All Classes
        </button>
        {classNames.map(name => (
          <button
            key={name}
            onClick={() => { setClassFilter(name); setStudentFilter('all'); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
              classFilter === name
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Filter row (list mode only shows student/date, class mode only shows date) */}
      <div className="flex flex-wrap items-center gap-3">
        {viewMode === 'list' && (
          <select
            value={studentFilter}
            onChange={e => setStudentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white min-w-[160px]"
          >
            <option value="all">All Students</option>
            {filteredStudentOptions.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            placeholder="From"
          />
          <span className="text-slate-300">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
            placeholder="To"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total HP</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.totalHP}</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Students</p>
          <p className="text-2xl font-bold text-slate-700 flex items-center gap-2"><Users size={18} className="text-slate-400" />{stats.uniqueStudents}</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From Lessons</p>
          <p className="text-2xl font-bold text-indigo-600 flex items-center gap-2"><BookOpen size={18} className="text-indigo-400" />{stats.fromLessons}</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch Awards</p>
          <p className="text-2xl font-bold text-amber-600 flex items-center gap-2"><Zap size={18} className="text-amber-400" />{stats.fromBatch}</p>
        </div>
      </div>

      {/* Content */}
      {filteredLogs.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed">
          <Award size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No HP awards found</p>
          <p className="text-sm text-slate-400 mt-1">Award house points from the Students page or Lesson Records to see history here.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {filteredLogs.map(log => (
            <div key={log.id} className="glass-card p-4 flex items-center gap-4 group">
              <div className="text-sm text-slate-400 font-mono w-[90px] shrink-0">{log.date}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 truncate">{log.student_name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.class_name}</span>
                </div>
                <p className="text-sm text-slate-500 truncate">{log.reason}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold border border-emerald-100">
                  +{log.points} HP
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  log.source === 'lesson'
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    : "bg-amber-50 text-amber-600 border border-amber-100"
                )}>
                  {log.source}
                </span>
                {onDeleteLog && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this HP award log?')) onDeleteLog(log.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Class-Grouped View */
        <div className="space-y-6">
          {classGrouped.map(group => (
            <div key={group.name} className="glass-card p-6 space-y-4">
              {/* Class header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{group.name}</h3>
                    <p className="text-xs text-slate-400">{group.students.length} student{group.students.length !== 1 ? 's' : ''} &middot; {group.logs.length} award{group.logs.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-lg font-bold border border-emerald-100">
                  {group.totalHP} HP
                </div>
              </div>

              {/* Student breakdown */}
              <div className="space-y-2">
                {group.students.map(student => {
                  const maxHP = group.students[0]?.totalHP || 1;
                  const barWidth = Math.max(4, Math.round((student.totalHP / maxHP) * 100));
                  return (
                    <div key={student.id} className="flex items-center gap-3 group/student">
                      <div className="w-[140px] shrink-0 truncate">
                        <span className="text-sm font-medium text-slate-700">{student.name}</span>
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full flex items-center justify-end pr-2 transition-all"
                          style={{ width: `${barWidth}%`, minWidth: '32px' }}
                        >
                          <span className="text-[10px] font-bold text-white">{student.totalHP}</span>
                        </div>
                      </div>
                      <div className="w-[60px] shrink-0 text-right">
                        <span className="text-xs text-slate-400">{student.count} award{student.count !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
