import { useCallback, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { parseQuestions, questionHasIssues, countIssues } from '../../../lib/kahootQuestionParser';
import { cn } from '../../../lib/utils';
import { KahootItem, KahootQuestion } from '../../../types';

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

interface StepReviewProps {
  draft: KahootItem;
  onUpdateDraft: (updates: Partial<KahootItem>) => void;
  onSetQuestions: (questions: KahootQuestion[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepReview({ draft, onUpdateDraft, onSetQuestions, onNext, onBack }: StepReviewProps) {
  const [rawText, setRawText] = useState('');
  const [parseError, setParseError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleParse = useCallback(() => {
    try {
      const questions = parseQuestions(rawText);
      if (questions.length === 0) {
        setParseError('No questions were found. Check your format.');
        return;
      }
      onSetQuestions(questions);
      setParseError('');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Parse failed.');
    }
  }, [rawText, onSetQuestions]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (!draft.tags.includes(tag)) {
      onUpdateDraft({ tags: [...draft.tags, tag] });
    }
    setTagInput('');
  };

  const issues = countIssues(draft.questions);
  const avgTime = draft.questions.length > 0
    ? Math.round(draft.questions.reduce((s, q) => s + q.time_limit, 0) / draft.questions.length)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Review & Edit</h3>
        <p className="text-sm text-slate-500">Confirm title, description, tags, then paste or review questions below.</p>
      </div>

      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Title</span>
          <input
            value={draft.title}
            onChange={e => onUpdateDraft({ title: e.target.value })}
            placeholder="Kahoot title..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Description</span>
          <textarea
            value={draft.description}
            onChange={e => onUpdateDraft({ description: e.target.value })}
            rows={3}
            placeholder="Short learner-facing summary..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
        </label>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tags</span>
        <div className="flex flex-wrap gap-2">
          {draft.tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => onUpdateDraft({ tags: draft.tags.filter(t => t !== tag) })}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition"
            >
              {tag} &times;
            </button>
          ))}
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddTag(); } }}
              placeholder="Add tag..."
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs outline-none focus:border-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* Paste area */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Paste Questions (Markdown table or JSON)</span>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          rows={8}
          placeholder={`| # | Question | A | B | C | D | Correct | Time |\n| 1 | What is 2+2? | 3 | 4 | 5 | 6 | B | 20 |`}
          className="w-full rounded-2xl border border-slate-200 px-5 py-4 font-mono text-xs leading-relaxed outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Parse & Preview
          </button>
          {parseError && <span className="text-sm text-rose-600">{parseError}</span>}
        </div>
      </div>

      {/* Question preview */}
      {draft.questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Preview ({draft.questions.length} questions)
            </span>
            <span className="text-xs text-slate-400">
              {issues > 0 ? `${issues} with issues` : 'All valid'} &middot; avg {avgTime}s
            </span>
          </div>

          <div className="space-y-2">
            {draft.questions.map((q, i) => {
              const hasIssue = questionHasIssues(q);
              return (
                <div
                  key={q.id}
                  className={cn(
                    'rounded-xl border p-4',
                    hasIssue ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200 bg-white',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-slate-400 mt-0.5 w-8 shrink-0">Q{i + 1}</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-slate-800">{q.prompt || <span className="text-rose-400 italic">Missing prompt</span>}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {OPTION_KEYS.map(key => {
                          const val = q[`option_${key.toLowerCase()}` as keyof KahootQuestion] as string;
                          const isCorrect = q.correct_option === key;
                          return (
                            <span
                              key={key}
                              className={cn(
                                'rounded-lg px-3 py-1.5 border',
                                isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 bg-slate-50 text-slate-600',
                              )}
                            >
                              {key}. {val || <span className="text-rose-400">empty</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{q.time_limit}s</span>
                    {hasIssue ? <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" /> : <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nav */}
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
          disabled={draft.questions.length === 0 || !draft.title.trim()}
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
