import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FilterChip } from '../../components/FilterChip';
import { cn } from '../../lib/utils';
import { KahootBoard, KahootItem, KahootOrgType, KahootTrack, KahootUploadStatus } from '../../types';
import { KahootCard } from './KahootCard';

type BoardFilter = 'all' | KahootBoard;
type TrackFilter = 'all' | KahootTrack;
type StatusFilter = 'all' | KahootUploadStatus;
type OrgFilter = 'all' | KahootOrgType;

const BOARD_OPTIONS: { key: BoardFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cie0580', label: 'CIE 0580' },
  { key: 'edexcel-4ma1', label: '4MA1' },
];

const TRACK_OPTIONS: { key: TrackFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'core', label: 'Core' },
  { key: 'extended', label: 'Extended' },
  { key: 'foundation', label: 'Foundation' },
  { key: 'higher', label: 'Higher' },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ai_generated', label: 'AI Generated' },
  { key: 'human_review', label: 'Reviewed' },
  { key: 'excel_exported', label: 'Excel Ready' },
  { key: 'kahoot_uploaded', label: 'Uploaded' },
  { key: 'web_verified', label: 'Verified' },
  { key: 'published', label: 'Published' },
];

const ORG_OPTIONS: { key: OrgFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'standalone', label: 'Standalone' },
  { key: 'in_course', label: 'In Course' },
  { key: 'in_channel', label: 'In Channel' },
];

interface StatCardProps {
  label: string;
  value: number;
  tone?: string;
}

function StatCard({ label, value, tone = 'text-slate-900' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={cn('mt-2 text-3xl font-bold', tone)}>{value}</p>
    </div>
  );
}

interface KahootLibraryProps {
  items: KahootItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function KahootLibrary({ items, selectedId, onSelect }: KahootLibraryProps) {
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [orgFilter, setOrgFilter] = useState<OrgFilter>('all');

  const stats = useMemo(() => ({
    total: items.length,
    published: items.filter(i => i.upload_status === 'published').length,
    uploaded: items.filter(i => i.upload_status === 'kahoot_uploaded' || i.upload_status === 'web_verified').length,
    inProgress: items.filter(i => i.upload_status === 'ai_generated' || i.upload_status === 'human_review' || i.upload_status === 'excel_exported').length,
  }), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter(i => boardFilter === 'all' || i.board === boardFilter)
      .filter(i => trackFilter === 'all' || i.track === trackFilter)
      .filter(i => statusFilter === 'all' || i.upload_status === statusFilter)
      .filter(i => orgFilter === 'all' || (i.org_type ?? 'standalone') === orgFilter)
      .filter(i => {
        if (!q) return true;
        return [i.title, i.topic_code, i.description, i.tags.join(' '), i.challenge_url ?? '']
          .join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [items, boardFilter, trackFilter, statusFilter, orgFilter, search]);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Published" value={stats.published} tone="text-emerald-600" />
        <StatCard label="Uploaded" value={stats.uploaded} tone="text-indigo-600" />
        <StatCard label="In Progress" value={stats.inProgress} tone="text-amber-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Board</span>
          {BOARD_OPTIONS.map(o => (
            <FilterChip key={o.key} active={boardFilter === o.key} onClick={() => setBoardFilter(o.key)}>
              {o.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Track</span>
          {TRACK_OPTIONS.map(o => (
            <FilterChip key={o.key} active={trackFilter === o.key} onClick={() => setTrackFilter(o.key)} tone="violet">
              {o.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Status</span>
          {STATUS_OPTIONS.map(o => (
            <FilterChip key={o.key} active={statusFilter === o.key} onClick={() => setStatusFilter(o.key)} tone="emerald">
              {o.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Type</span>
          {ORG_OPTIONS.map(o => (
            <FilterChip key={o.key} active={orgFilter === o.key} onClick={() => setOrgFilter(o.key)} tone="teal">
              {o.label}
            </FilterChip>
          ))}
        </div>

        <label className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, tags, code..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {filtered.map(item => (
          <KahootCard
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            onClick={() => onSelect(item.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center">
            <p className="text-sm text-slate-400">
              {items.length === 0 ? 'No Kahoots yet. Create your first one!' : 'No items match the current filters.'}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        {filtered.length} of {items.length} shown
      </p>
    </div>
  );
}
