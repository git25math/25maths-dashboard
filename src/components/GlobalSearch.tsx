import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Search, X, Users, Calendar, BookOpen, Lightbulb, CheckSquare, Clock, Target, CalendarDays, Mic, Mail, FileText, Settings, GraduationCap, Rocket, Flag, PenLine } from 'lucide-react';
import { Student, TeachingUnit, Idea, SOP, WorkLog, Goal, SchoolEvent, MeetingRecord, LessonRecord, ClassProfile, TimetableEntry, Task, EmailDigest, EventTimeMode, Project } from '../types';
import { ProjectMilestone, DevLogEntry } from '../types/chronicle';

interface GlobalSearchProps {
  data: {
    students: Student[];
    teachingUnits: TeachingUnit[];
    ideas: Idea[];
    sops: SOP[];
    workLogs: WorkLog[];
    goals: Goal[];
    schoolEvents: SchoolEvent[];
    meetings: MeetingRecord[];
    lessonRecords: LessonRecord[];
    classes: ClassProfile[];
    timetable: TimetableEntry[];
    tasks: Task[];
    emailDigests: EmailDigest[];
    projects: Project[];
    milestones: ProjectMilestone[];
    devlogs: DevLogEntry[];
  };
  onNavigate: (tabKey: string) => void;
}

interface SearchResult {
  type: string;
  tabKey: string;
  title: string;
  subtitle?: string;
  icon: typeof Users;
}

const ENTITY_CONFIG = [
  { key: 'students', tabKey: 'students', label: 'Students', icon: Users },
  { key: 'teachingUnits', tabKey: 'teaching', label: 'Teaching Units', icon: BookOpen },
  { key: 'ideas', tabKey: 'ideas', label: 'Ideas', icon: Lightbulb },
  { key: 'sops', tabKey: 'sop', label: 'SOPs', icon: Settings },
  { key: 'workLogs', tabKey: 'worklogs', label: 'Work Logs', icon: Clock },
  { key: 'goals', tabKey: 'goals', label: 'Goals', icon: Target },
  { key: 'schoolEvents', tabKey: 'events', label: 'School Events', icon: CalendarDays },
  { key: 'meetings', tabKey: 'meetings', label: 'Meetings', icon: Mic },
  { key: 'lessonRecords', tabKey: 'lessons', label: 'Lesson Records', icon: FileText },
  { key: 'classes', tabKey: 'students', label: 'Classes', icon: GraduationCap },
  { key: 'timetable', tabKey: 'timetable', label: 'Calendar', icon: Calendar },
  { key: 'tasks', tabKey: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'emailDigests', tabKey: 'email-digest', label: 'Email Digests', icon: Mail },
  { key: 'projects', tabKey: 'projects', label: 'Projects', icon: Rocket },
  { key: 'milestones', tabKey: 'projects', label: 'Milestones', icon: Flag },
  { key: 'devlogs', tabKey: 'projects', label: 'Dev Logs', icon: PenLine },
] as const;

function getSearchableText(item: Record<string, unknown>, entityKey: string): string {
  switch (entityKey) {
    case 'students': {
      const s = item as unknown as Student;
      return [s.name, s.chinese_name, s.class_name, s.notes].filter(Boolean).join(' ');
    }
    case 'teachingUnits': {
      const u = item as unknown as TeachingUnit;
      return [u.title, u.year_group].filter(Boolean).join(' ');
    }
    case 'ideas': {
      const i = item as unknown as Idea;
      return [i.title, i.content].filter(Boolean).join(' ');
    }
    case 'sops': {
      const s = item as unknown as SOP;
      return [s.title, s.content].filter(Boolean).join(' ');
    }
    case 'workLogs': {
      const w = item as unknown as WorkLog;
      return w.content || '';
    }
    case 'goals': {
      const g = item as unknown as Goal;
      return g.title || '';
    }
    case 'schoolEvents': {
      const e = item as unknown as SchoolEvent;
      return [e.title, e.description].filter(Boolean).join(' ');
    }
    case 'meetings': {
      const m = item as unknown as MeetingRecord;
      return [m.title, m.participants?.join(' ')].filter(Boolean).join(' ');
    }
    case 'lessonRecords': {
      const l = item as unknown as LessonRecord;
      return [l.topic, l.class_name].filter(Boolean).join(' ');
    }
    case 'classes': {
      const c = item as unknown as ClassProfile;
      return [c.name, c.description].filter(Boolean).join(' ');
    }
    case 'timetable': {
      const t = item as unknown as TimetableEntry;
      return [t.subject, t.class_name, t.topic, t.date].filter(Boolean).join(' ');
    }
    case 'tasks': {
      const t = item as unknown as Task;
      return [t.title, t.description, t.assignee, ...(t.tags || [])].filter(Boolean).join(' ');
    }
    case 'emailDigests': {
      const ed = item as unknown as EmailDigest;
      return [ed.subject, ed.original_content].filter(Boolean).join(' ');
    }
    case 'projects': {
      const p = item as unknown as Project;
      return [p.name, p.description].filter(Boolean).join(' ');
    }
    case 'milestones': {
      const m = item as unknown as ProjectMilestone;
      return [m.title, m.description].filter(Boolean).join(' ');
    }
    case 'devlogs': {
      const d = item as unknown as DevLogEntry;
      return [d.title, d.content, ...(d.tags || [])].filter(Boolean).join(' ');
    }
    default:
      return '';
  }
}

function getDisplayTitle(item: Record<string, unknown>, entityKey: string): string {
  switch (entityKey) {
    case 'students': return (item as unknown as Student).name;
    case 'teachingUnits': return (item as unknown as TeachingUnit).title;
    case 'ideas': return (item as unknown as Idea).title;
    case 'sops': return (item as unknown as SOP).title;
    case 'workLogs': return (item as unknown as WorkLog).content.slice(0, 60);
    case 'goals': return (item as unknown as Goal).title;
    case 'schoolEvents': return (item as unknown as SchoolEvent).title;
    case 'meetings': return (item as unknown as MeetingRecord).title;
    case 'lessonRecords': return (item as unknown as LessonRecord).topic || (item as unknown as LessonRecord).class_name;
    case 'classes': return (item as unknown as ClassProfile).name;
    case 'timetable': return `${(item as unknown as TimetableEntry).subject} — ${(item as unknown as TimetableEntry).class_name}`;
    case 'tasks': return (item as unknown as Task).title;
    case 'emailDigests': return (item as unknown as EmailDigest).subject;
    case 'projects': return (item as unknown as Project).name;
    case 'milestones': return (item as unknown as ProjectMilestone).title;
    case 'devlogs': return (item as unknown as DevLogEntry).title;
    default: return '';
  }
}

function getDisplaySubtitle(item: Record<string, unknown>, entityKey: string): string | undefined {
  switch (entityKey) {
    case 'students': return (item as unknown as Student).class_name;
    case 'teachingUnits': return (item as unknown as TeachingUnit).year_group;
    case 'ideas': return (item as unknown as Idea).category;
    case 'sops': return (item as unknown as SOP).category;
    case 'workLogs': return (item as unknown as WorkLog).category;
    case 'schoolEvents': {
      const ev = item as unknown as SchoolEvent;
      const mode: EventTimeMode = ev.time_mode || 'all-day';
      switch (mode) {
        case 'multi-day':
          return ev.end_date ? `${ev.date} – ${ev.end_date}` : ev.date;
        case 'timed':
          return ev.start_time ? `${ev.date} ${ev.start_time}–${ev.end_time || ''}` : ev.date;
        case 'multi-day-timed':
          return `${ev.date} ${ev.start_time || ''} – ${ev.end_date || ev.date} ${ev.end_time || ''}`;
        default:
          return ev.date;
      }
    }
    case 'meetings': return (item as unknown as MeetingRecord).date;
    case 'lessonRecords': return (item as unknown as LessonRecord).date;
    case 'classes': return (item as unknown as ClassProfile).year_group;
    case 'timetable': {
      const t = item as unknown as TimetableEntry;
      return t.date ? `${t.room} \u00b7 ${t.date}` : t.room;
    }
    case 'tasks': return (item as unknown as Task).status;
    case 'emailDigests': return new Date((item as unknown as EmailDigest).created_at).toLocaleDateString();
    case 'projects': return (item as unknown as Project).status;
    case 'milestones': return (item as unknown as ProjectMilestone).status;
    case 'devlogs': return (item as unknown as DevLogEntry).tags?.join(', ');
    default: return undefined;
  }
}

export const GlobalSearch = memo(function GlobalSearch({ data, onNavigate }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const grouped: Record<string, SearchResult[]> = {};

    for (const config of ENTITY_CONFIG) {
      const items = data[config.key as keyof typeof data] as unknown[];
      if (!items) continue;

      const matches: SearchResult[] = [];
      for (const item of items) {
        const rec = item as Record<string, unknown>;
        const text = getSearchableText(rec, config.key);
        if (text.toLowerCase().includes(q)) {
          matches.push({
            type: config.label,
            tabKey: config.tabKey,
            title: getDisplayTitle(rec, config.key),
            subtitle: getDisplaySubtitle(rec, config.key),
            icon: config.icon,
          });
        }
        if (matches.length >= 5) break; // cap per type
      }
      if (matches.length > 0) {
        grouped[config.label] = matches;
      }
    }
    return grouped;
  }, [query, data]);

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh]" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <Search size={20} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search students, units, ideas, logs..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-slate-400 bg-slate-100 rounded-md">
            ESC
          </kbd>
          <button onClick={() => setIsOpen(false)} aria-label="Close search" className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              Type to search across all your data...
            </div>
          ) : totalResults === 0 ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No results found for "{query}"
            </div>
          ) : (
            Object.entries(results).map(([groupLabel, items]) => (
              <div key={groupLabel}>
                <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50">
                  {groupLabel} ({items.length})
                </div>
                {items.map((result, i) => {
                  const Icon = result.icon;
                  return (
                    <button
                      key={`${groupLabel}-${i}`}
                      onClick={() => { onNavigate(result.tabKey); setIsOpen(false); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <Icon size={16} className="text-indigo-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">⌘K</kbd> to toggle
          </span>
        </div>
      </div>
    </div>
  );
});
