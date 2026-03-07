import { Download } from 'lucide-react';
import { KahootItem } from '../../../types';

function buildKahootCsvContent(item: KahootItem): string {
  const headers = ['Question - max 120 characters', 'Answer 1 - max 75 characters', 'Answer 2 - max 75 characters', 'Answer 3 - max 75 characters', 'Answer 4 - max 75 characters', 'Time limit (sec)', 'Correct answer(s)'];
  const rows = item.questions.map(q => {
    const correctIndex = { A: 1, B: 2, C: 3, D: 4 }[q.correct_option] ?? 1;
    return [q.prompt, q.option_a, q.option_b, q.option_c, q.option_d, String(q.time_limit), String(correctIndex)];
  });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
}

function downloadCsv(item: KahootItem) {
  const csv = buildKahootCsvContent(item);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kahoot-${item.topic_code || 'export'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface StepExportProps {
  draft: KahootItem;
  onNext: () => void;
  onBack: () => void;
}

export function StepExport({ draft, onNext, onBack }: StepExportProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Export & Preview</h3>
        <p className="text-sm text-slate-500">Preview the Kahoot import format. Download CSV or proceed to auto-upload.</p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{draft.questions.length}</p>
            <p className="text-xs text-slate-400 mt-1">Questions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{draft.tags.length}</p>
            <p className="text-xs text-slate-400 mt-1">Tags</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(draft.questions.reduce((s, q) => s + q.time_limit, 0) / 60)}m
            </p>
            <p className="text-xs text-slate-400 mt-1">Total Time</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-900">{draft.title}</p>
          <p className="text-xs text-slate-500 mt-1">{draft.description || 'No description'}</p>
        </div>
      </div>

      {/* Table preview */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Import Preview</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-3 py-2 text-slate-400 font-semibold">#</th>
                <th className="px-3 py-2 text-slate-400 font-semibold">Question</th>
                <th className="px-3 py-2 text-slate-400 font-semibold">A</th>
                <th className="px-3 py-2 text-slate-400 font-semibold">B</th>
                <th className="px-3 py-2 text-slate-400 font-semibold">C</th>
                <th className="px-3 py-2 text-slate-400 font-semibold">D</th>
                <th className="px-3 py-2 text-slate-400 font-semibold">Ans</th>
                <th className="px-3 py-2 text-slate-400 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {draft.questions.map((q, i) => (
                <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2 text-slate-700 max-w-[240px] truncate">{q.prompt}</td>
                  <td className="px-3 py-2 text-slate-600">{q.option_a}</td>
                  <td className="px-3 py-2 text-slate-600">{q.option_b}</td>
                  <td className="px-3 py-2 text-slate-600">{q.option_c}</td>
                  <td className="px-3 py-2 text-slate-600">{q.option_d}</td>
                  <td className="px-3 py-2 font-bold text-indigo-600">{q.correct_option}</td>
                  <td className="px-3 py-2 text-slate-400">{q.time_limit}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
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
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Upload to Kahoot
          </button>
        </div>
      </div>
    </div>
  );
}
