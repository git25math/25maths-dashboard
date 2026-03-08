import { KahootItem } from '../../../types';
import { KahootDeploySection } from '../KahootDeploySection';

interface StepUploadProps {
  draft: KahootItem;
  onNext: () => void;
  onBack: () => void;
  onCopy: (value: string, label: string) => void;
  onPersistItem: (id: string, updates: Partial<KahootItem>) => Promise<void> | void;
}

export function StepUpload({ draft, onNext, onBack, onCopy, onPersistItem }: StepUploadProps) {
  const uploadReady = draft.pipeline.kahoot_uploaded || draft.pipeline.published;
  const websiteSynced = draft.pipeline.web_verified || draft.pipeline.published;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Upload to Kahoot</h3>
        <p className="text-sm text-slate-500">
          Reuse the same deploy pipeline as the library detail view. Dry run first if you want to inspect the generated browser flow, then run the real upload.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Excel</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {draft.pipeline.excel_exported ? 'Ready' : 'Missing'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Kahoot Upload</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {uploadReady ? 'Completed' : 'Pending'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Website Sync</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {websiteSynced ? 'Completed' : 'Not Yet'}
          </p>
        </div>
      </div>

      <KahootDeploySection
        item={draft}
        onCopy={onCopy}
        onPersistItem={onPersistItem}
        allowArtifacts={false}
        allowSpreadsheet={false}
        allowUpload
        title="Upload Pipeline"
        description="Run a dry run or full upload. Successful uploads write the returned Kahoot links and pipeline status back into this draft."
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {uploadReady
          ? 'Upload completed. You can finish the wizard now.'
          : 'Run the upload above to finish this wizard.'}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!uploadReady}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
