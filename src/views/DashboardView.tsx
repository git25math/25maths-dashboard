import { Plus, Clock, Users, Calendar, BookOpen, ExternalLink, AlertCircle, Lightbulb, CheckSquare, Inbox, Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { TimetableEntry, ClassProfile, TeachingUnit, Goal, SchoolEvent, WorkLog, Idea, Task, EventTimeMode, Project, Student } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { USER_CONFIG } from '../shared/constants';
import { sortTeachingUnits } from '../lib/teachingUnitOrder';
import { getPrepCoverageLevel, summarizeUnitPrep } from '../lib/prepCompleteness';
import { compareSchoolEventsUpcoming, isSchoolEventPast } from '../lib/schoolEventTime';

function formatEventDateShort(event: SchoolEvent): string {
  const mode: EventTimeMode = event.time_mode || 'all-day';
  const d = new Date(event.date);
  switch (mode) {
    case 'multi-day': {
      const end = event.end_date ? new Date(event.end_date) : d;
      if (d.getMonth() === end.getMonth()) {
        return `${format(d, 'MMM d')}–${format(end, 'd')}`;
      }
      return `${format(d, 'MMM d')}–${format(end, 'MMM d')}`;
    }
    case 'timed':
      return `${format(d, 'MMM d')} ${event.start_time || ''}`;
    case 'multi-day-timed': {
      const end = event.end_date ? new Date(event.end_date) : d;
      if (d.getMonth() === end.getMonth()) {
        return `${format(d, 'MMM d')}–${format(end, 'd')}`;
      }
      return `${format(d, 'MMM d')}–${format(end, 'MMM d')}`;
    }
    default:
      return format(d, 'MMM d');
  }
}

type UpdateItem =
  | { type: 'worklog'; id: string; time: string; content: string; category: string }
  | { type: 'idea'; id: string; time: string; content: string; title: string };

interface DashboardViewProps {
  currentEvent: TimetableEntry | undefined;
  nextEvent: TimetableEntry | undefined;
  onSelectUnit: (id: string) => void;
  classes: ClassProfile[];
  teachingUnits: TeachingUnit[];
  goals: Goal[];
  schoolEvents: SchoolEvent[];
  workLogs: WorkLog[];
  ideas: Idea[];
  tasks: Task[];
  projects: Project[];
  students: Student[];
  onNavigate: (tab: string) => void;
}

const DASHBOARD_PROGRESS_YEARS = ['Year 7', 'Year 8', 'Year 10', 'Year 11', 'Year 12'] as const;

function getPrepCoverageBarClass(percent: number) {
  const level = getPrepCoverageLevel(percent);
  if (level === 'high') return 'bg-emerald-500';
  if (level === 'medium') return 'bg-amber-500';
  return 'bg-rose-500';
}

export const DashboardView = ({
  currentEvent,
  nextEvent,
  onSelectUnit,
  classes,
  teachingUnits,
  goals,
  schoolEvents,
  workLogs,
  ideas,
  tasks,
  projects,
  students,
  onNavigate,
}: DashboardViewProps) => {
  const pendingRequests = students.reduce((sum, s) => sum + (s.requests?.filter(r => r.status === 'pending').length || 0), 0);
  const pendingComms = students.reduce((sum, s) => sum + (s.parent_communications?.filter(c => c.status === 'pending').length || 0), 0);
  const upcomingSchoolEvents = schoolEvents
    .filter(event => !isSchoolEventPast(event))
    .sort(compareSchoolEventsUpcoming)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header & Current Context */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Hello, {USER_CONFIG.name}!</h2>
          <p className="text-slate-500 mt-1">It's {format(new Date(), 'EEEE, MMMM do, HH:mm')}</p>
        </div>

        <div className="flex gap-3">
          <a href="https://teams.microsoft.com" target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm">
            <ExternalLink size={20} />
          </a>
          <button
            onClick={() => onNavigate('worklogs')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Record</span>
          </button>
        </div>
      </header>

      {/* Context Card */}
      <section className="glass-card p-6 border-l-4 border-l-indigo-600">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
              <Clock size={16} />
              <span>Current Context</span>
            </div>

            {currentEvent ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-slate-900">{currentEvent.subject}</h3>
                  {currentEvent.type === 'lesson' && (() => {
                    const ps = currentEvent.prep_status || (currentEvent.is_prepared ? 'prepared' : 'not_prepared');
                    const cfg: Record<string, { label: string; color: string }> = {
                      not_prepared: { label: '未备课', color: 'bg-red-50 text-red-600' },
                      prepared: { label: '已备课', color: 'bg-emerald-50 text-emerald-600' },
                      finished: { label: '已完成', color: 'bg-blue-50 text-blue-600' },
                      recorded: { label: '已归档', color: 'bg-slate-100 text-slate-600' },
                    };
                    const c = cfg[ps] || cfg.not_prepared;
                    return (
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded", c.color)}>
                        {c.label}
                      </span>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1"><Users size={16} /> {currentEvent.class_name}</span>
                  <span className="flex items-center gap-1"><Calendar size={16} /> Room {currentEvent.room}</span>
                  {currentEvent.topic && (
                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                      <BookOpen size={16} /> {currentEvent.topic}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Free Time / Planning</h3>
                <p className="text-slate-500 mt-1">Perfect time to review your startup ideas or prep for next class.</p>
              </div>
            )}
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Event</p>
            {nextEvent ? (
              <div className="mt-1">
                <p className="font-bold text-slate-900">{nextEvent.subject}</p>
                <p className="text-xs text-slate-500">
                  {nextEvent.start_time} · {nextEvent.class_name} · Room {nextEvent.room}
                </p>
              </div>
            ) : (
              <p className="font-semibold text-slate-400 mt-1 italic">No more events today</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Teaching Section ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-indigo-500" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Teaching</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Class Progress Tracking */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900">Class Progress Tracking</h4>
              <button onClick={() => onNavigate('teaching')} className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DASHBOARD_PROGRESS_YEARS.map(year => {
                const yearClasses = classes.filter(cls => cls.year_group === year);
                const orderedYearUnits = sortTeachingUnits(teachingUnits.filter(u => u.year_group === year));
                const primaryClass = yearClasses.find(cls => cls.current_unit_id) || yearClasses[0];
                const currentUnit = primaryClass
                  ? teachingUnits.find(u => u.id === primaryClass.current_unit_id)
                  : orderedYearUnits[0];
                const prepSummary = currentUnit ? summarizeUnitPrep(currentUnit) : null;
                const totalLOs = currentUnit?.sub_units.reduce((sum, su) => sum + su.learning_objectives.length, 0) || 0;
                const completedLOs = currentUnit?.sub_units.reduce((sum, su) => sum + su.learning_objectives.filter(lo => lo.status === 'completed').length, 0) || 0;
                const progress = currentUnit && totalLOs > 0 ? Math.round((completedLOs / totalLOs) * 100) : 0;
                return (
                  <div key={year} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{year}</p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        Class: <span className="text-slate-700 font-medium">{primaryClass?.name || 'Not Assigned'}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        Unit: <span className="text-indigo-600 font-medium">{currentUnit?.title || 'None'}</span>
                      </p>
                      {currentUnit && (
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>PROGRESS</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                          {prepSummary && (
                            <>
                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>PREP</span>
                                <span>{prepSummary.readinessPct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className={cn('h-full transition-all duration-500', getPrepCoverageBarClass(prepSummary.readinessPct))} style={{ width: `${prepSummary.readinessPct}%` }} />
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {prepSummary.objectivesReady}/{prepSummary.objectivesTotal} objectives ready
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {currentUnit ? (
                      <button
                        onClick={() => onSelectUnit(currentUnit.id)}
                        className="mt-3 text-[10px] font-bold text-indigo-600 hover:underline text-left"
                      >
                        View Module →
                      </button>
                    ) : (
                      <p className="mt-3 text-[10px] text-slate-400 italic">No unit assigned</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goals (work category) */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900">Active Goals</h4>
              <button onClick={() => onNavigate('goals')} className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {goals.filter(g => g.status === 'in-progress').slice(0, 2).map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-600">{goal.title}</span>
                    <span className="text-indigo-600">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Support */}
          <div className="glass-card p-6 bg-red-50 border-red-100 space-y-4">
            <h4 className="font-bold text-red-900">Emergency Support</h4>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = `mailto:${USER_CONFIG.email}?subject=Emergency Support Needed in ${USER_CONFIG.room}`}
                className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <AlertCircle size={14} /> Upper On-Call
              </button>
              <button disabled className="w-full py-2 bg-white text-red-400 border border-red-200 text-xs font-bold rounded-lg cursor-not-allowed" title="Coming Soon">
                Medical Alert
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tutor & Admin Section ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tutor & Admin</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quick stats */}
          <div className="glass-card p-6 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Pending Actions</h4>
            <div className="space-y-2">
              <button onClick={() => onNavigate('students')} className="w-full flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <span className="text-xs text-slate-600">Parent Comms</span>
                <span className={cn("text-xs font-bold", pendingComms > 0 ? "text-amber-600" : "text-slate-400")}>{pendingComms}</span>
              </button>
              <button onClick={() => onNavigate('students')} className="w-full flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <span className="text-xs text-slate-600">Student Requests</span>
                <span className={cn("text-xs font-bold", pendingRequests > 0 ? "text-amber-600" : "text-slate-400")}>{pendingRequests}</span>
              </button>
            </div>
          </div>

          {/* School Events */}
          <div className="lg:col-span-3 glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900">Upcoming Events</h4>
              <button onClick={() => onNavigate('events')} className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {upcomingSchoolEvents.length > 0 ? upcomingSchoolEvents.map(event => (
                <div key={event.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start">
                    <h5 className="text-xs font-bold text-slate-900">{event.title}</h5>
                    <span className="text-[9px] text-slate-400 flex-shrink-0 ml-2">{formatEventDateShort(event)}</span>
                  </div>
                  <MarkdownRenderer content={event.description} className="text-[10px] text-slate-500 mt-1 line-clamp-1" />
                </div>
              )) : (
                <div className="sm:col-span-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                  No upcoming school events.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects Section ── */}
      {projects.filter(p => p.status === 'active').length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-purple-500" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Projects</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.filter(p => p.status === 'active').map(project => {
              const taskCount = tasks.filter(t => t.project_id === project.id && t.status !== 'done').length;
              return (
                <button
                  key={project.id}
                  onClick={() => onNavigate('projects')}
                  className="glass-card overflow-hidden flex text-left hover:shadow-md transition-shadow"
                >
                  <div className="w-1 flex-shrink-0" style={{ backgroundColor: project.color }} />
                  <div className="p-4 flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <Rocket size={10} className="text-purple-500" />
                      <span className="font-bold">{taskCount} active task{taskCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Productivity Section ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-amber-500" />
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Productivity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* GTD Tasks Widget */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare size={16} className="text-cyan-600" />
                GTD Tasks
                {tasks.filter(t => t.status === 'inbox').length > 0 && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Inbox size={9} />
                    {tasks.filter(t => t.status === 'inbox').length}
                  </span>
                )}
              </h4>
              <button onClick={() => onNavigate('tasks')} className="text-indigo-600 text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-2">
              {(() => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const nextTasks = tasks
                  .filter(t => t.status === 'next')
                  .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                  .slice(0, 3);
                if (nextTasks.length === 0) {
                  return <p className="text-xs text-slate-400 italic">No next actions. Check your inbox!</p>;
                }
                return nextTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className={cn("w-1.5 h-full min-h-[24px] rounded-full flex-shrink-0",
                      task.priority === 'high' ? "bg-red-500" : task.priority === 'medium' ? "bg-amber-500" : "bg-blue-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                      {task.due_date && (
                        <p className={cn("text-[10px]", new Date(task.due_date) < new Date() ? "text-red-500 font-bold" : "text-slate-400")}>
                          Due: {task.due_date}
                        </p>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="lg:col-span-2 glass-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900">Recent Updates</h4>
              <button onClick={() => onNavigate('worklogs')} className="text-indigo-600 text-xs font-bold hover:underline">View History</button>
            </div>
            <div className="space-y-3">
              {(() => {
                const items: UpdateItem[] = [
                  ...workLogs.map(log => ({ type: 'worklog' as const, id: log.id, time: log.timestamp, content: log.content, category: log.category })),
                  ...ideas.filter(i => i.show_on_dashboard).map(idea => ({ type: 'idea' as const, id: idea.id, time: idea.created_at, content: idea.content, title: idea.title })),
                ];
                items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
                return items.slice(0, 5).map(item => (
                  <div key={`${item.type}-${item.id}`} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className={cn(
                      "w-1 h-auto rounded-full flex-shrink-0",
                      item.type === 'idea' ? "bg-purple-500" :
                      (item as Extract<UpdateItem, { type: 'worklog' }>).category === 'tutor' ? "bg-indigo-500" : "bg-emerald-500"
                    )} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.type === 'idea' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 flex items-center gap-0.5">
                            <Lightbulb size={9} /> Idea
                          </span>
                        )}
                        {item.type === 'worklog' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600">
                            Work Log
                          </span>
                        )}
                      </div>
                      {item.type === 'idea' && (
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{(item as Extract<UpdateItem, { type: 'idea' }>).title}</p>
                      )}
                      <MarkdownRenderer content={item.content} className="text-xs text-slate-700 mt-0.5 line-clamp-2" />
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
