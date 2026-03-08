import { cn } from '../lib/utils';

interface PipelineDotsProps {
  stages: ReadonlyArray<{ key: string; label: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pipeline: { [key: string]: any };
}

export function PipelineDots({ stages, pipeline }: PipelineDotsProps) {
  const total = stages.length;
  const doneCount = stages.filter(s => pipeline[s.key]).length;
  const allDone = doneCount === total;

  return (
    <span className="inline-flex items-center gap-1.5" title={`${doneCount}/${total} stages done`}>
      <span className="inline-flex items-center gap-0.5">
        {stages.map(s => (
          <span
            key={s.key}
            className={cn('h-2 w-2 rounded-full', pipeline[s.key] ? 'bg-emerald-500' : 'bg-slate-200')}
            title={`${s.label}: ${pipeline[s.key] ? 'Done' : 'Pending'}`}
          />
        ))}
      </span>
      <span className={cn('text-[10px] font-bold tabular-nums', allDone ? 'text-emerald-600' : 'text-slate-400')}>
        {doneCount}/{total}
      </span>
    </span>
  );
}
