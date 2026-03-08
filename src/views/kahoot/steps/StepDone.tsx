import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { KahootItem } from '../../../types';

interface StepDoneProps {
  draft: KahootItem;
  onCopy: (value: string, label: string) => void;
  onGoToLibrary: () => void;
  onCreateAnother: () => void;
}

export function StepDone({ draft, onCopy, onGoToLibrary, onCreateAnother }: StepDoneProps) {
  const published = draft.pipeline.published;
  const uploaded = draft.pipeline.kahoot_uploaded || published;
  const synced = draft.pipeline.web_verified || published;

  return (
    <div className="mx-auto max-w-2xl space-y-8 text-center">
      <div className="flex justify-center">
        <CheckCircle2 size={56} className="text-emerald-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">
          {published ? 'Kahoot Published' : uploaded ? 'Upload Completed' : 'Draft Saved'}
        </h3>
        <p className="text-sm text-slate-500">
          {published
            ? `${draft.title} has been uploaded and synced back to the website.`
            : uploaded
              ? `${draft.title} has been uploaded to Kahoot and is ready for final checks.`
              : `${draft.title} is saved in the library.`}
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-left">
        {[
          { label: 'Play Link', value: draft.challenge_url },
          { label: 'Creator Link', value: draft.creator_url },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
              <p className="mt-1 truncate text-sm text-slate-700">{value || '-'}</p>
            </div>
            {value && (
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-400 transition hover:text-indigo-600"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  type="button"
                  onClick={() => onCopy(value, label)}
                  className="p-2 text-slate-400 transition hover:text-slate-700"
                >
                  <Copy size={15} />
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
          <p className={uploaded ? 'text-emerald-600' : 'text-slate-400'}>
            {uploaded ? 'Kahoot upload completed' : 'Kahoot upload not completed'}
          </p>
          <p className={synced ? 'text-emerald-600' : 'text-slate-400'}>
            {synced ? 'Website CSV/JSON synced' : 'Website sync not performed'}
          </p>
        </div>
      </div>

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
