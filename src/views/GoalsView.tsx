import { useState } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { Goal } from '../types';
import { format } from 'date-fns';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: () => void;
  onDeleteGoal: (id: string) => void;
  onEditGoal: (goal: Goal) => void;
  onUpdateGoal: (id: string, data: Partial<Goal>) => void;
}

const CATEGORY_COLORS: Record<Goal['category'], string> = {
  dream: 'bg-purple-50 text-purple-600 border-purple-200',
  work: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  startup: 'bg-indigo-50 text-indigo-600 border-indigo-200',
};

const STATUS_COLORS: Record<Goal['status'], string> = {
  'in-progress': 'bg-amber-50 text-amber-600 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'on-hold': 'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_CYCLE: Goal['status'][] = ['in-progress', 'completed', 'on-hold'];

const CATEGORY_FILTERS = ['All', 'Dream', 'Work', 'Startup'] as const;
const STATUS_FILTERS = ['All', 'In Progress', 'Completed', 'On Hold'] as const;

const statusFilterMap: Record<string, Goal['status'] | undefined> = {
  'All': undefined,
  'In Progress': 'in-progress',
  'Completed': 'completed',
  'On Hold': 'on-hold',
};

export const GoalsView = ({ goals, onAddGoal, onDeleteGoal, onEditGoal, onUpdateGoal }: GoalsViewProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = goals.filter(g => {
    if (categoryFilter !== 'All' && g.category !== categoryFilter.toLowerCase()) return false;
    const mappedStatus = statusFilterMap[statusFilter];
    if (mappedStatus && g.status !== mappedStatus) return false;
    return true;
  });

  const cycleStatus = (goal: Goal) => {
    const idx = STATUS_CYCLE.indexOf(goal.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onUpdateGoal(goal.id, { status: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target size={24} className="text-indigo-600" /> Goals
          </h2>
          <p className="text-sm text-slate-500 mt-1">{goals.length} goals total</p>
        </div>
        <button onClick={onAddGoal} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                categoryFilter === f
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                statusFilter === f
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Target size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No goals found</p>
          <p className="text-sm">Create your first goal to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(goal => (
            <div
              key={goal.id}
              className="group glass-card overflow-hidden flex flex-col"
            >
              {goal.image_url && (
                <div
                  className="h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url(${goal.image_url})` }}
                />
              )}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", CATEGORY_COLORS[goal.category])}>
                    {goal.category}
                  </span>
                  <button
                    onClick={() => cycleStatus(goal)}
                    className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity", STATUS_COLORS[goal.status])}
                  >
                    {goal.status}
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 mb-3">{goal.title}</h3>

                <div className="space-y-1.5 mt-auto">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>PROGRESS</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        goal.progress >= 100 ? "bg-emerald-500" : "bg-indigo-600"
                      )}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {goal.deadline && (
                  <p className="text-[10px] text-slate-400 mt-3">
                    Deadline: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                  </p>
                )}

                {/* Hover actions */}
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditGoal(goal)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
