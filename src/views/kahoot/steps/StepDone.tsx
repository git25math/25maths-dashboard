import { CheckCircle2, Copy, ExternalLink, XCircle } from 'lucide-react';
import { LocalAgentJob } from '../../../services/localAgentService';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

interface StepDoneProps {
  job: LocalAgentJob | null;
  draftTitle: string;
  questionCount: number;
  onCopy: (value: string, label: string) => void;
  onGoToLibrary: () => void;
  onCreateAnother: () => void;
}

export function StepDone({ job, draftTitle, questionCount, onCopy, onGoToLibrary, onCreateAnother }: StepDoneProps) {
  const result = asRecord(job?.result);
  const challengeUrl = asString(result.challenge_url);
  const creatorUrl = asString(result.creator_url);
  const sync = asRecord(result.sync);
  const synced = sync.synced === true;
  const uploaded = asRecord(result.upload).uploaded === true || job?.status === 'completed';
  const failed = job?.status === 'failed';

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-center">
      {/* Status icon */}
      <div className="flex justify-center">
        {failed ? (
          <XCircle size={56} className="text-rose-400" />
        ) : (
          <CheckCircle2 size={56} className="text-emerald-400" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">
          {failed ? 'Upload Failed' : 'Kahoot Published'}
        </h3>
        <p className="text-sm text-slate-500">
          {failed
            ? (job?.error || 'Something went wrong during deployment.')
            : `${draftTitle} with ${questionCount} questions has been uploaded.`}
        </p>
      </div>

      {/* Links */}
      {!failed && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-left">
          {[
            { label: 'Play Link', value: challengeUrl },
            { label: 'Creator Link', value: creatorUrl },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-sm text-slate-700 truncate mt-1">{value || '-'}</p>
              </div>
              {value && (
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <a href={value} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 transition">
                    <ExternalLink size={15} />
                  </a>
                  <button type="button" onClick={() => onCopy(value, label)} className="p-2 text-slate-400 hover:text-slate-700 transition">
                    <Copy size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Sync status */}
          <div className="pt-3 border-t border-slate-100 space-y-1 text-sm">
            <p className={synced ? 'text-emerald-600' : 'text-slate-400'}>
              {synced ? 'Website CSV/JSON synced' : 'Website sync not performed'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          type="button"
          onClick={onGoToLibrary}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300"
        >
          View in Library
        </button>
        <button
          type="button"
          onClick={onCreateAnother}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          Create Another
        </button>
      </div>
    </div>
  );
}
