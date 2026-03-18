import { memo } from 'react';
import { Video } from 'lucide-react';
import { PipelineDots } from '../../components/PipelineDots';
import { cn } from '../../lib/utils';
import { VideoScript, VIDEO_PIPELINE_STAGES, VideoPipelineStage } from '../../types/video';

const BOARD_LABELS: Record<string, string> = {
  cie: 'CIE', edx: 'Edexcel', ial: 'IAL', amc: 'AMC',
  ukmt: 'UKMT', bmmt: 'BMMT', kangaroo: 'Kangaroo', asdan: 'ASDAN',
};

const TIER_LABELS: Record<string, string> = {
  both: 'Both', core_only: 'Core', extended_only: 'Extended',
};

const NEXT_ACTION_LABELS: Record<VideoPipelineStage, string> = {
  stub_created: 'Create stub',
  script_written: 'Write script',
  script_validated: 'Validate script',
  ai_enhanced: 'AI enhance',
  rendered: 'Render video',
  cover_generated: 'Generate cover',
  meta_generated: 'Generate metadata',
  uploaded: 'Upload to Bilibili',
};

function getNextAction(pipeline: VideoScript['pipeline']): { key: VideoPipelineStage | 'complete'; label: string } {
  for (const stage of VIDEO_PIPELINE_STAGES) {
    if (!pipeline[stage.key]) return { key: stage.key, label: NEXT_ACTION_LABELS[stage.key] };
  }
  return { key: 'complete', label: 'All done' };
}

interface VideoCardProps {
  item: VideoScript;
  isSelected: boolean;
  onClick: () => void;
}

export const VideoCard = memo(function VideoCard({ item, isSelected, onClick }: VideoCardProps) {
  const nextAction = getNextAction(item.pipeline);

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
        <div className="hidden sm:flex shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-100 items-center justify-center text-slate-300">
          <Video size={24} />
        </div>

        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold tracking-wide uppercase">{item.id}</span>
            <span>&middot;</span>
            <span>{BOARD_LABELS[item.board] ?? item.board}</span>
            <span>&middot;</span>
            <span>{TIER_LABELS[item.tier] ?? item.tier}</span>
            {item.section && (
              <>
                <span>&middot;</span>
                <span>§{item.section}</span>
              </>
            )}
          </div>

          <p className="text-sm font-bold text-slate-900 truncate">{item.title || item.title_zh || 'Untitled'}</p>

          <p className={cn('text-xs font-semibold truncate', nextAction.key === 'complete' ? 'text-emerald-600' : 'text-slate-400')}>
            Next: {nextAction.label}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <PipelineDots stages={VIDEO_PIPELINE_STAGES} pipeline={item.pipeline} />
            <span className="text-slate-400">{item.acts.length} acts</span>
            <span className="text-slate-400">{Math.round(item.target_duration / 60)}min</span>
          </div>
        </div>
      </div>
    </button>
  );
});
