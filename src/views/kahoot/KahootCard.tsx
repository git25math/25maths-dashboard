import { ExternalLink, Gamepad2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { KAHOOT_PIPELINE_STAGES, KahootBoard, KahootItem, KahootOrgType, KahootPipeline, KahootTrack } from '../../types';

const BOARD_LABELS: Record<KahootBoard, string> = {
  cie0580: 'CIE 0580',
  'edexcel-4ma1': 'Edexcel 4MA1',
};

const TRACK_LABELS: Record<KahootTrack, string> = {
  core: 'Core',
  extended: 'Extended',
  foundation: 'Foundation',
  higher: 'Higher',
};

const ORG_LABELS: Record<KahootOrgType, string> = {
  standalone: 'Standalone',
  in_course: 'In Course',
  in_channel: 'In Channel',
};

function PipelineDots({ pipeline }: { pipeline?: KahootPipeline }) {
  if (!pipeline) return null;
  const total = KAHOOT_PIPELINE_STAGES.length;
  const doneCount = Object.values(pipeline).filter(Boolean).length;
  const allDone = doneCount === total;
  return (
    <span className="inline-flex items-center gap-1.5" title={`${doneCount}/${total} stages done`}>
      <span className="inline-flex items-center gap-0.5">
        {KAHOOT_PIPELINE_STAGES.map(s => (
          <span
            key={s.key}
            className={cn(
              'w-2 h-2 rounded-full',
              pipeline[s.key] ? 'bg-emerald-500' : 'bg-slate-200',
            )}
            title={`${s.label}: ${pipeline[s.key] ? 'Done' : 'Pending'}`}
          />
        ))}
      </span>
      <span className={cn(
        'text-[10px] font-bold tabular-nums',
        allDone ? 'text-emerald-600' : 'text-slate-400',
      )}>
        {doneCount}/{total}
      </span>
    </span>
  );
}

interface KahootCardProps {
  item: KahootItem;
  isSelected: boolean;
  onClick: () => void;
}

export function KahootCard({ item, isSelected, onClick }: KahootCardProps) {
  const orgType = item.org_type ?? 'standalone';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border p-5 transition-all',
        'hover:shadow-md hover:border-slate-300',
        isSelected
          ? 'border-indigo-300 bg-indigo-50/50 shadow-sm'
          : 'border-slate-200 bg-white',
      )}
    >
      <div className="flex gap-5">
        {/* Cover thumbnail */}
        <div className="hidden sm:block shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
          {item.cover_url ? (
            <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Gamepad2 size={24} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Top row: topic code + meta */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold tracking-wide uppercase">{item.topic_code}</span>
            <span>&middot;</span>
            <span>{BOARD_LABELS[item.board]}</span>
            <span>&middot;</span>
            <span>{TRACK_LABELS[item.track]}</span>
            {orgType !== 'standalone' && (
              <>
                <span>&middot;</span>
                <span className="text-indigo-500">{ORG_LABELS[orgType]}{item.org_name ? `: ${item.org_name}` : ''}</span>
              </>
            )}
          </div>

          {/* Title */}
          <p className="text-sm font-bold text-slate-900 truncate">{item.title || 'Untitled Kahoot'}</p>

          {/* Status + counts + links */}
          <div className="flex items-center gap-4 text-xs">
            <PipelineDots pipeline={item.pipeline} />

            <span className="text-slate-400">{item.questions.length} Qs</span>

            {item.challenge_url && (
              <a
                href={item.challenge_url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-700 transition"
              >
                Play <ExternalLink size={11} />
              </a>
            )}

            {item.creator_url && (
              <a
                href={item.creator_url}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 transition"
              >
                Creator <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
