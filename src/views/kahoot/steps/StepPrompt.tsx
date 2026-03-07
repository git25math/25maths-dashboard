import { Sparkles } from 'lucide-react';
import { KahootBoard, KahootTrack } from '../../../types';
import { cn } from '../../../lib/utils';

const BOARD_OPTIONS: { key: KahootBoard; label: string }[] = [
  { key: 'cie0580', label: 'CIE 0580' },
  { key: 'edexcel-4ma1', label: 'Edexcel 4MA1' },
];

const TRACK_OPTIONS: { key: KahootTrack; label: string }[] = [
  { key: 'core', label: 'Core' },
  { key: 'extended', label: 'Extended' },
  { key: 'foundation', label: 'Foundation' },
  { key: 'higher', label: 'Higher' },
];

interface StepPromptProps {
  board: KahootBoard;
  track: KahootTrack;
  topicCode: string;
  aiPrompt: string;
  isGenerating: boolean;
  generateError: string;
  onBoardChange: (board: KahootBoard) => void;
  onTrackChange: (track: KahootTrack) => void;
  onTopicCodeChange: (code: string) => void;
  onAiPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  onSkip: () => void;
}

export function StepPrompt({
  board, track, topicCode, aiPrompt, isGenerating, generateError,
  onBoardChange, onTrackChange, onTopicCodeChange, onAiPromptChange,
  onGenerate, onSkip,
}: StepPromptProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">What are you creating?</h3>
        <p className="text-sm text-slate-500">Set the topic, then give AI an instruction or skip straight to pasting questions.</p>
      </div>

      {/* Board + Track + Topic */}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Board</span>
          <select
            value={board}
            onChange={e => onBoardChange(e.target.value as KahootBoard)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {BOARD_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Track</span>
          <select
            value={track}
            onChange={e => onTrackChange(e.target.value as KahootTrack)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {TRACK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Topic Code</span>
          <input
            value={topicCode}
            onChange={e => onTopicCodeChange(e.target.value)}
            placeholder="e.g. C1.1"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>

      {/* AI Prompt */}
      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">AI Prompt</span>
        <textarea
          value={aiPrompt}
          onChange={e => onAiPromptChange(e.target.value)}
          rows={6}
          placeholder="e.g. Generate 12 multiple-choice questions about types of number (integer, prime, square, cube, rational, irrational) for IGCSE Core. Include 2 easy warm-ups and 2 tricky ones."
          className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm leading-relaxed outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none"
        />
      </label>

      {generateError && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{generateError}</div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition',
            'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed',
          )}
        >
          {isGenerating ? (
            <span className="inline-flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Generating...
            </span>
          ) : (
            <>
              <Sparkles size={16} /> Generate with AI
            </>
          )}
        </button>

        <div className="flex items-center gap-3 text-sm text-slate-400">
          <span className="h-px w-8 bg-slate-200" />
          or
          <span className="h-px w-8 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="text-sm font-bold text-slate-500 hover:text-slate-700 transition underline underline-offset-2"
        >
          Skip to paste questions directly
        </button>
      </div>
    </div>
  );
}
