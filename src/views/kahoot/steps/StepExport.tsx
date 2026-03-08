import { Download } from 'lucide-react';
import { KahootItem } from '../../../types';
import { KahootDeploySection } from '../KahootDeploySection';

function buildKahootCsvContent(item: KahootItem): string {
  const headers = ['Question - max 120 characters', 'Answer 1 - max 75 characters', 'Answer 2 - max 75 characters', 'Answer 3 - max 75 characters', 'Answer 4 - max 75 characters', 'Time limit (sec)', 'Correct answer(s)'];
  const rows = item.questions.map(q => {
    const correctIndex = { A: 1, B: 2, C: 3, D: 4 }[q.correct_option] ?? 1;
    return [q.prompt, q.option_a, q.option_b, q.option_c, q.option_d, String(q.time_limit), String(correctIndex)];
  });

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(','), ...rows.map(row => row.map(escape).join(','))].join('\n');
}

function downloadCsv(item: KahootItem) {
  const csv = buildKahootCsvContent(item);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `kahoot-${item.topic_code || 'export'}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

interface StepExportProps {
  draft: KahootItem;
  onNext: () => void;
  onBack: () => void;
  onCopy: (value: string, label: string) => void;
  onPersistItem: (id: string, updates: Partial<KahootItem>) => Promise<void> | void;
}

export function StepExport({ draft, onNext, onBack, onCopy, onPersistItem }: StepExportProps) {
  const excelReady = draft.pipeline.excel_exported;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Export & Build Excel</h3>
        <p className="text-sm text-slate-500">
          Review the import shape, download a quick CSV if needed, then run the Markdown and Excel build jobs from the same pipeline used in the library.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{draft.questions.length}</p>
            <p className="mt-1 text-xs text-slate-400">Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{draft.tags.length}</p>
            <p className="mt-1 text-xs text-slate-400">Tags</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(draft.questions.reduce((sum, question) => sum + question.time_limit, 0) / 60)}m
            </p>
            <p className="mt-1 text-xs text-slate-400">Total Time</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2">
          <p className="text-sm font-bold text-slate-900">{draft.title}</p>
          <p className="mt-1 text-xs text-slate-500">{draft.description || 'No description'}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Import Preview</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-3 py-2 font-semibold text-slate-400">#</th>
                <th className="px-3 py-2 font-semibold text-slate-400">Question</th>
                <th className="px-3 py-2 font-semibold text-slate-400">A</th>
                <th className="px-3 py-2 font-semibold text-slate-400">B</th>
                <th className="px-3 py-2 font-semibold text-slate-400">C</th>
                <th className="px-3 py-2 font-semibold text-slate-400">D</th>
                <th className="px-3 py-2 font-semibold text-slate-400">Ans</th>
                <th className="px-3 py-2 font-semibold text-slate-400">Time</th>
              </tr>
            </thead>
            <tbody>
              {draft.questions.map((question, index) => (
                <tr key={question.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2 text-slate-400">{index + 1}</td>
                  <td className="max-w-[240px] truncate px-3 py-2 text-slate-700">{question.prompt}</td>
                  <td className="px-3 py-2 text-slate-600">{question.option_a}</td>
                  <td className="px-3 py-2 text-slate-600">{question.option_b}</td>
                  <td className="px-3 py-2 text-slate-600">{question.option_c}</td>
                  <td className="px-3 py-2 text-slate-600">{question.option_d}</td>
                  <td className="px-3 py-2 font-bold text-indigo-600">{question.correct_option}</td>
                  <td className="px-3 py-2 text-slate-400">{question.time_limit}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <KahootDeploySection
        item={draft}
        onCopy={onCopy}
        onPersistItem={onPersistItem}
        allowArtifacts
        allowSpreadsheet
        allowUpload={false}
        title="Export Pipeline"
        description="Step 1 exports Markdown artifacts. Step 2 builds the import-ready Excel file and writes the result back to this draft."
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {excelReady
          ? 'Excel build completed. You can continue to the upload step.'
          : 'Run Build Excel above to unlock the upload step.'}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300"
        >
          Back
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => downloadCsv(draft)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300"
          >
            <Download size={15} /> Download CSV
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!excelReady}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to Upload
          </button>
        </div>
      </div>
    </div>
  );
}
