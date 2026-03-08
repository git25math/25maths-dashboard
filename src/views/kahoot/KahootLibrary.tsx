import { useMemo, useState } from 'react';
import { ArrowDownAZ, Check, Clock, RotateCcw, Search, X } from 'lucide-react';
import { FilterChip } from '../../components/FilterChip';
import { cn } from '../../lib/utils';
import { KAHOOT_PIPELINE_STAGES, KahootBoard, KahootItem, KahootOrgType, KahootPipelineStage, KahootTrack } from '../../types';
import { KahootCard } from './KahootCard';

type BoardFilter = 'all' | KahootBoard;
type TrackFilter = 'all' | KahootTrack;
type OrgFilter = 'all' | KahootOrgType;
type SortMode = 'updated' | 'topic';

// null = no filter, true = done, false = not done
type PipelineFilter = Record<KahootPipelineStage, boolean | null>;

const INITIAL_PIPELINE_FILTER: PipelineFilter = {
  ai_generated: null,
  reviewed: null,
  excel_exported: null,
  kahoot_uploaded: null,
  web_verified: null,
  published: null,
};

const BOARD_OPTIONS: { key: BoardFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cie0580', label: 'CIE 0580' },
  { key: 'edexcel-4ma1', label: '4MA1' },
];

const ALL_TRACK_OPTIONS: { key: TrackFilter; label: string; board?: KahootBoard }[] = [
  { key: 'all', label: 'All' },
  { key: 'core', label: 'Core', board: 'cie0580' },
  { key: 'extended', label: 'Extended', board: 'cie0580' },
  { key: 'foundation', label: 'Foundation', board: 'edexcel-4ma1' },
  { key: 'higher', label: 'Higher', board: 'edexcel-4ma1' },
];

const ORG_OPTIONS: { key: OrgFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'standalone', label: 'Standalone' },
  { key: 'in_course', label: 'In Course' },
  { key: 'in_channel', label: 'In Channel' },
];

function naturalTopicSort(a: string, b: string): number {
  const parseCode = (code: string) => {
    const m = code.match(/^([A-Za-z])(\d+)\.(\d+)$/);
    return m ? [m[1].toLowerCase(), Number(m[2]), Number(m[3])] as const : [code, 0, 0] as const;
  };
  const [ap, ac, as_] = parseCode(a);
  const [bp, bc, bs] = parseCode(b);
  if (ap !== bp) return ap < bp ? -1 : 1;
  if (ac !== bc) return ac - bc;
  return as_ - bs;
}

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
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>(INITIAL_PIPELINE_FILTER);
  const [orgFilter, setOrgFilter] = useState<OrgFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('topic');

  // Smart track options: filter by selected board
  const trackOptions = useMemo(
    () => ALL_TRACK_OPTIONS.filter(o => o.key === 'all' || !o.board || boardFilter === 'all' || o.board === boardFilter),
    [boardFilter],
  );

  // Reset track when board changes and current track is invalid
  const handleBoardChange = (board: BoardFilter) => {
    setBoardFilter(board);
    if (board !== 'all') {
      const valid = ALL_TRACK_OPTIONS.filter(o => o.key === 'all' || o.board === board).map(o => o.key);
      if (!valid.includes(trackFilter)) setTrackFilter('all');
    }
  };

  const togglePipeline = (stage: KahootPipelineStage) => {
    setPipelineFilter(prev => {
      const current = prev[stage];
      const next = current === null ? true : current === true ? false : null;
      return { ...prev, [stage]: next };
    });
  };

  const hasActiveFilters = boardFilter !== 'all' || trackFilter !== 'all' || orgFilter !== 'all' || search.trim() !== ''
    || Object.values(pipelineFilter).some(v => v !== null);

  const clearAllFilters = () => {
    setSearch('');
    setBoardFilter('all');
    setTrackFilter('all');
    setPipelineFilter(INITIAL_PIPELINE_FILTER);
    setOrgFilter('all');
  };

  const pipelineStats = useMemo(() => {
    const result: Record<KahootPipelineStage, number> = {
      ai_generated: 0, reviewed: 0, excel_exported: 0,
      kahoot_uploaded: 0, web_verified: 0, published: 0,
    };
    for (const item of items) {
      const p = item.pipeline;
      if (p) {
        for (const key of Object.keys(result) as KahootPipelineStage[]) {
          if (p[key]) result[key]++;
        }
      }
    }
    return result;
  }, [items]);

  const completedCount = useMemo(
    () => items.filter(i => i.pipeline && Object.values(i.pipeline).every(Boolean)).length,
    [items],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter(i => boardFilter === 'all' || i.board === boardFilter)
      .filter(i => trackFilter === 'all' || i.track === trackFilter)
      .filter(i => {
        const p = i.pipeline;
        if (!p) return true;
        for (const [stage, value] of Object.entries(pipelineFilter) as [KahootPipelineStage, boolean | null][]) {
          if (value === null) continue;
          if (p[stage] !== value) return false;
        }
        return true;
      })
      .filter(i => orgFilter === 'all' || (i.org_type ?? 'standalone') === orgFilter)
      .filter(i => {
        if (!q) return true;
        return [i.title, i.topic_code, i.description, i.tags.join(' '), i.challenge_url ?? '']
          .join(' ').toLowerCase().includes(q);
      })
      .sort((a, b) => sortMode === 'topic'
        ? naturalTopicSort(a.topic_code, b.topic_code)
        : b.updated_at.localeCompare(a.updated_at),
      );
  }, [items, boardFilter, trackFilter, pipelineFilter, orgFilter, search, sortMode]);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={items.length} />
        <StatCard label="All Done" value={completedCount} tone="text-emerald-600" />
        <StatCard label="Published" value={pipelineStats.published} tone="text-indigo-600" />
        <StatCard label="AI Generated" value={pipelineStats.ai_generated} tone="text-sky-600" />
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Row 1: Board + Track + Search */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Board</span>
            {BOARD_OPTIONS.map(o => (
              <FilterChip key={o.key} active={boardFilter === o.key} onClick={() => handleBoardChange(o.key)}>
                {o.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Track</span>
            {trackOptions.map(o => (
              <FilterChip key={o.key} active={trackFilter === o.key} onClick={() => setTrackFilter(o.key)} tone="violet">
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

        {/* Row 2: Pipeline toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pipeline</span>
          {KAHOOT_PIPELINE_STAGES.map(s => {
            const val = pipelineFilter[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => togglePipeline(s.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all active:scale-[0.97]',
                  val === true
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                    : val === false
                      ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300',
                )}
                title={val === null ? 'Click to filter: done' : val ? 'Click to filter: not done' : 'Click to clear filter'}
              >
                {val === true && <Check size={12} />}
                {val === false && <X size={12} />}
                {s.label}
                <span className="text-[10px] opacity-60">{pipelineStats[s.key]}</span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Type + Sort + Clear */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Type</span>
            {ORG_OPTIONS.map(o => (
              <FilterChip key={o.key} active={orgFilter === o.key} onClick={() => setOrgFilter(o.key)} tone="teal">
                {o.label}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Sort</span>
            <FilterChip active={sortMode === 'topic'} onClick={() => setSortMode('topic')} tone="indigo">
              <ArrowDownAZ size={12} className="mr-1 inline" />Topic
            </FilterChip>
            <FilterChip active={sortMode === 'updated'} onClick={() => setSortMode('updated')} tone="indigo">
              <Clock size={12} className="mr-1 inline" />Updated
            </FilterChip>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition"
            >
              <RotateCcw size={12} /> Clear Filters
            </button>
          )}
        </div>
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
