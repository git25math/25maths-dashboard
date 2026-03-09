import { useState, useCallback, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import type { PaperQuestion } from './types';
import { geminiService } from '../../services/geminiService';

interface QuestionVariantModalProps {
  question: PaperQuestion;
  isOpen: boolean;
  onClose: () => void;
  onUseVariant: (variant: { tex: string; marks: number }) => void;
}

interface VariantResult {
  tex: string;
  marks: number;
}

export function QuestionVariantModal({ question, isOpen, onClose, onUseVariant }: QuestionVariantModalProps) {
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<VariantResult[]>([]);
  const [error, setError] = useState('');
  const [usedIdx, setUsedIdx] = useState<Set<number>>(new Set());
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevQuestionId = useRef(question.id);

  // Reset state when question changes
  useEffect(() => {
    if (question.id !== prevQuestionId.current) {
      setVariants([]);
      setUsedIdx(new Set());
      setError('');
      prevQuestionId.current = question.id;
    }
  }, [question.id]);

  // Focus trap: focus the dialog on open
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError('');
    setVariants([]);
    setUsedIdx(new Set());
    try {
      const results = await geminiService.generateQuestionVariants({
        tex: question.tex,
        marks: question.marks,
        topic: question.topic || '',
        section: question.s,
        difficulty: question.d,
        count,
      });
      if (!results.length) {
        setError('No variants returned. Try again or adjust the count.');
      } else {
        setVariants(results);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate variants');
    } finally {
      setLoading(false);
    }
  }, [question, count]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="variant-modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4 outline-none"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h3 id="variant-modal-title" className="text-lg font-bold text-slate-900">AI Question Variants</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Original question */}
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Original ({question.marks}m)</p>
              <span className="text-xs text-slate-400 font-mono">{question.src}</span>
            </div>
            <p className="text-sm text-slate-700 font-mono whitespace-pre-wrap">{question.tex}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <label htmlFor="variant-count" className="text-sm text-slate-600">Variants:</label>
            <select
              id="variant-count"
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={14} /> Generate</>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {/* Variants */}
          {variants.map((v, i) => {
            const variantKey = `variant-${i}-${v.marks}-${v.tex.slice(0, 20)}`;
            return (
              <div key={variantKey} className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400">Variant {i + 1} ({v.marks}m)</p>
                  <button
                    type="button"
                    onClick={() => {
                      onUseVariant(v);
                      setUsedIdx(prev => new Set(prev).add(i));
                    }}
                    disabled={usedIdx.has(i)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50"
                  >
                    {usedIdx.has(i) ? <><Check size={12} /> Used</> : <><Plus size={12} /> Use</>}
                  </button>
                </div>
                <pre className="text-sm text-slate-700 font-mono whitespace-pre-wrap">{v.tex}</pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
