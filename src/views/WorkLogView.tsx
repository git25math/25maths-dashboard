import { useState } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkLog } from '../types';

const CATEGORY_FILTERS = ['All', 'tutor', 'teaching', 'admin', 'startup', 'other'] as const;
type CategoryFilter = typeof CATEGORY_FILTERS[number];

interface WorkLogViewProps {
  workLogs: WorkLog[];
  onAddLog: () => void;
  onDeleteLog: (id: string) => void;
  onEditLog?: (log: WorkLog) => void;
}

export const WorkLogView = ({ workLogs, onAddLog, onDeleteLog, onEditLog }: WorkLogViewProps) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All');

  const filteredLogs = activeFilter === 'All'
    ? workLogs
    : workLogs.filter(log => log.category === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Work Logs (工作日志)</h2>
        <button onClick={onAddLog} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> New Log Entry
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
              activeFilter === filter
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"
            )}
          >
            {filter === 'All' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-bottom border-slate-100 dark:border-slate-700">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Content</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tags</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group">
                <td className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                <td className="p-4">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                    log.category === 'tutor' ? "bg-indigo-50 text-indigo-600" :
                    log.category === 'teaching' ? "bg-emerald-50 text-emerald-600" :
                    log.category === 'admin' ? "bg-blue-50 text-blue-600" :
                    log.category === 'startup' ? "bg-purple-50 text-purple-600" :
                    "bg-slate-100 text-slate-500"
                  )}>
                    {log.category}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{log.content}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {log.tags?.map(tag => (
                      <span key={tag} className="text-[9px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {onEditLog && (
                      <button
                        onClick={() => onEditLog(log)}
                        className="text-slate-300 hover:text-indigo-500 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm('Delete this log entry?')) onDeleteLog(log.id); }}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            {activeFilter === 'All' ? 'No work logs yet. Click "New Log Entry" to add one.' : `No ${activeFilter} logs found.`}
          </div>
        )}
      </div>
    </div>
  );
};
