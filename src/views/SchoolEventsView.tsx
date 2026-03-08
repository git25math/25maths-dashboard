import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { SchoolEvent, EventTimeMode } from '../types';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { compareSchoolEventsPast, compareSchoolEventsUpcoming, isSchoolEventPast } from '../lib/schoolEventTime';
import { format } from 'date-fns';

function formatEventDate(event: SchoolEvent): string {
  const mode: EventTimeMode = event.time_mode || 'all-day';
  const d = new Date(event.date);
  switch (mode) {
    case 'multi-day': {
      const end = event.end_date ? new Date(event.end_date) : d;
      if (d.getFullYear() === end.getFullYear()) {
        return `${format(d, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
      }
      return `${format(d, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
    }
    case 'timed':
      return `${format(d, 'EEEE, MMM d, yyyy')} · ${event.start_time || ''}–${event.end_time || ''}`;
    case 'multi-day-timed': {
      const end = event.end_date ? new Date(event.end_date) : d;
      return `${format(d, 'MMM d')} ${event.start_time || ''} – ${format(end, 'MMM d')} ${event.end_time || ''}`;
    }
    default:
      return format(d, 'EEEE, MMM d, yyyy');
  }
}

interface SchoolEventsViewProps {
  schoolEvents: SchoolEvent[];
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
  onEditEvent: (event: SchoolEvent) => void;
}

const CATEGORY_COLORS: Record<SchoolEvent['category'], string> = {
  'school-wide': 'bg-red-50 text-red-600 border-red-200',
  personal: 'bg-blue-50 text-blue-600 border-blue-200',
  house: 'bg-green-50 text-green-600 border-green-200',
  event: 'bg-amber-50 text-amber-600 border-amber-200',
};

const CATEGORY_FILTERS = ['All', 'School-wide', 'Personal', 'House', 'Event'] as const;

const categoryFilterMap: Record<string, SchoolEvent['category'] | undefined> = {
  'All': undefined,
  'School-wide': 'school-wide',
  'Personal': 'personal',
  'House': 'house',
  'Event': 'event',
};

export const SchoolEventsView = ({ schoolEvents, onAddEvent, onDeleteEvent, onEditEvent }: SchoolEventsViewProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filtered = useMemo(() => schoolEvents
    .filter(e => {
      const mapped = categoryFilterMap[categoryFilter];
      if (mapped && e.category !== mapped) return false;
      return true;
    }),
    [schoolEvents, categoryFilter]);

  const visibleEvents = useMemo(
    () => filtered.filter(event => !isSchoolEventPast(event)).sort(compareSchoolEventsUpcoming),
    [filtered]
  );

  const pastEvents = useMemo(
    () => filtered.filter(event => isSchoolEventPast(event)).sort(compareSchoolEventsPast),
    [filtered]
  );

  const renderEventCard = (event: SchoolEvent, tone: 'active' | 'past' = 'active') => (
    <div
      key={event.id}
      className={cn(
        'group glass-card p-5 flex flex-col sm:flex-row sm:items-start gap-4',
        tone === 'past' && 'opacity-80 bg-slate-50/80'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
            CATEGORY_COLORS[event.category]
          )}>
            {event.category}
          </span>
          {event.is_action_required && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              <AlertTriangle size={10} /> Action Required
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-900">{event.title}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {formatEventDate(event)}
        </p>
        {event.description && (
          <MarkdownRenderer content={event.description} className="text-sm text-slate-600 mt-2 line-clamp-2" />
        )}
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEditEvent(event)}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <Pencil size={12} /> Edit
        </button>
        <button
          onClick={() => onDeleteEvent(event.id)}
          className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays size={24} className="text-indigo-600" /> School Events
          </h2>
          <p className="text-sm text-slate-500 mt-1">{schoolEvents.length} events total</p>
        </div>
        <button onClick={onAddEvent} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={18} /> New Event
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_FILTERS.map(f => (
          <FilterChip
            key={f}
            onClick={() => setCategoryFilter(f)}
            active={categoryFilter === f}
          >
            {f}
          </FilterChip>
        ))}
      </div>

      {/* Event List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <CalendarDays size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm">Create your first school event to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleEvents.length > 0 ? (
            <div className="space-y-3">
              {visibleEvents.map(event => renderEventCard(event))}
            </div>
          ) : (
            <div className="glass-card p-6 text-sm text-slate-500">
              No current or upcoming events in this filter.
            </div>
          )}

          {pastEvents.length > 0 && (
            <details className="glass-card p-4 group">
              <summary className="list-none cursor-pointer flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Past Events</p>
                  <p className="text-xs text-slate-500">{pastEvents.length} hidden by default</p>
                </div>
                <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="space-y-3 pt-4 border-t border-slate-100 mt-4">
                {pastEvents.map(event => renderEventCard(event, 'past'))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
