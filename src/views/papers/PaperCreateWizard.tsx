import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Wand2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import type { PaperConfig, PaperQuestion, SavedPaper } from './types';
import { DEFAULT_PAPER_CONFIG } from './types';
import { PaperConfigForm } from './PaperConfigForm';
import { QuestionBrowser } from './QuestionBrowser';
import { PaperTexPreview } from './PaperTexPreview';
import { QuestionVariantModal } from './QuestionVariantModal';
import { paperService } from '../../services/paperService';
import { autoFillQuestions } from './utils/autoFill';
import { generatePaperTex, parseExamRef } from './utils/texGenerator';

const STEPS = ['Configure', 'Select Questions', 'Review & Reorder', 'Preview & Compile'] as const;

interface PaperCreateWizardProps {
  onBack: () => void;
  onSave: (paper: SavedPaper) => void;
  editPaper?: SavedPaper | null;
}

export function PaperCreateWizard({ onBack, onSave, editPaper }: PaperCreateWizardProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [allQuestions, setAllQuestions] = useState<PaperQuestion[]>([]);
  const [config, setConfig] = useState<Omit<PaperConfig, 'id' | 'createdAt' | 'updatedAt' | 'questionIds'>>(() => {
    if (editPaper) {
      const { id, createdAt, updatedAt, questionIds, texSource, pdfPath, ...rest } = editPaper;
      return rest;
    }
    return { ...DEFAULT_PAPER_CONFIG };
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    new Set(editPaper?.questionIds || []),
  );
  const [texSource, setTexSource] = useState('');
  /** Stores AI variant overrides: maps question id → { tex, marks } */
  const [questionOverrides, setQuestionOverrides] = useState<Map<string, { tex: string; marks: number }>>(new Map());
  /** Question currently open in the variant modal (step 2) */
  const [variantModalQ, setVariantModalQ] = useState<PaperQuestion | null>(null);
  const [saveError, setSaveError] = useState('');

  const [paperId] = useState(() => editPaper?.id || `paper-${Date.now()}`);

  // Load questions when board changes (with cancellation on unmount / board change)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    paperService.loadQuestions(config.board)
      .then(data => {
        if (!cancelled) { setAllQuestions(data.questions); setLoading(false); }
      })
      .catch(err => {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load questions'); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [config.board]);

  // Sync selectedIds when question bank changes (remove stale IDs)
  useEffect(() => {
    if (!allQuestions.length) return;
    const validIds = new Set(allQuestions.map(q => q.id));
    setSelectedIds(prev => {
      const filtered = new Set([...prev].filter(id => validIds.has(id)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [allQuestions]);

  const sections = useMemo(() => paperService.extractSections(allQuestions), [allQuestions]);

  const selectedQuestions = useMemo(
    () => allQuestions.filter(q => selectedIds.has(q.id)),
    [allQuestions, selectedIds],
  );

  const handleConfigChange = useCallback((updates: Partial<PaperConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleAutoFill = useCallback(() => {
    const filled = autoFillQuestions({
      questions: allQuestions,
      targetMarks: config.targetMarks,
      focus: config.focus,
      focusSections: config.focusSections,
      board: config.board,
      tier: config.tier,
    });
    setSelectedIds(new Set(filled.map(q => q.id)));
  }, [allQuestions, config.targetMarks, config.focus, config.focusSections, config.board, config.tier]);

  const handleRemoveQuestion = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleUseVariant = useCallback((questionId: string, variant: { tex: string; marks: number }) => {
    setQuestionOverrides(prev => new Map(prev).set(questionId, variant));
    setVariantModalQ(null);
  }, []);

  // Generate tex when entering step 3
  useEffect(() => {
    if (step === 3) {
      const ordered = allQuestions.filter(q => selectedIds.has(q.id));
      ordered.sort((a, b) => (a.d || 1) - (b.d || 1));
      // Apply AI variant overrides
      const questionsWithOverrides = ordered.map(q => {
        const override = questionOverrides.get(q.id);
        return override ? { ...q, tex: override.tex, marks: override.marks } : q;
      });
      const fullConfig: PaperConfig = {
        ...config,
        id: paperId,
        questionIds: ordered.map(q => q.id),
        createdAt: editPaper?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTexSource(generatePaperTex(fullConfig, questionsWithOverrides));
    }
  }, [step, selectedIds, config, allQuestions, paperId, editPaper, questionOverrides]);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const paper: SavedPaper = {
      ...config,
      id: paperId,
      questionIds: Array.from(selectedIds),
      texSource,
      createdAt: editPaper?.createdAt || now,
      updatedAt: now,
    };
    try {
      paperService.savePaper(paper);
      setSaveError('');
      onSave(paper);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save paper (localStorage may be full)');
    }
  }, [config, paperId, selectedIds, texSource, editPaper, onSave]);

  const totalMarks = selectedQuestions.reduce((s, q) => {
    const override = questionOverrides.get(q.id);
    return s + (override ? override.marks : q.marks);
  }, 0);
  const marksDiff = totalMarks - config.targetMarks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={step === 0 ? onBack : () => setStep(s => s - 1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          aria-label={step === 0 ? 'Back to library' : 'Previous step'}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">
            {editPaper ? 'Edit Paper' : 'Create Paper'}
          </h2>
          <div className="flex gap-2 mt-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { if (i < step) setStep(i); }}
                  disabled={i > step}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    i <= step ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                  } ${i < step ? 'cursor-pointer hover:bg-indigo-700' : ''}`}
                  aria-label={`Step ${i + 1}: ${s}`}
                >
                  {i + 1}
                </button>
                <span className={`text-xs hidden sm:inline ${i <= step ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-slate-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-3" />
          <span>Loading {config.board === 'cie' ? '4,107' : '1,855'} questions...</span>
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-700">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Failed to load question bank</p>
            <p className="text-sm">{loadError}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setLoadError('');
              paperService.loadQuestions(config.board)
                .then(data => { setAllQuestions(data.questions); setLoading(false); })
                .catch(err => { setLoadError(err instanceof Error ? err.message : 'Failed'); setLoading(false); });
            }}
            className="ml-auto px-3 py-1 rounded-lg text-sm font-medium bg-red-100 hover:bg-red-200 transition"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <>
          {/* Step 0: Configure */}
          {step === 0 && (
            <div className="max-w-xl">
              <PaperConfigForm
                config={config}
                onChange={handleConfigChange}
                sections={sections}
              />
            </div>
          )}

          {/* Step 1: Select Questions — kept mounted to preserve filter state */}
          <div className={step === 1 ? 'space-y-4' : 'hidden'}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-slate-600">
                {selectedIds.size} selected / {totalMarks} marks
                {marksDiff !== 0 && (
                  <span className={marksDiff > 0 ? 'text-amber-600 ml-1' : 'text-blue-600 ml-1'}>
                    ({marksDiff > 0 ? '+' : ''}{marksDiff} vs target {config.targetMarks})
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100 transition"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition"
                >
                  <Wand2 size={16} /> Auto-Fill ({config.targetMarks}m)
                </button>
              </div>
            </div>
            <QuestionBrowser
              questions={allQuestions}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              onSelectMultiple={handleSelectMultiple}
              board={config.board}
            />
          </div>

          {/* Step 2: Review & Reorder */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Warning for unparseable questions */}
              {(() => {
                const unparseable = selectedQuestions.filter(q => !parseExamRef(q.src, config.board));
                if (unparseable.length === 0) return null;
                return (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{unparseable.length} question(s) cannot be mapped to PastPapers</p>
                        <p className="text-xs mt-1 text-amber-600">
                          These will be listed as comments in the .tex file and need manual placement:
                          {' '}{unparseable.map(q => q.src).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {selectedQuestions.length} questions / {totalMarks} marks / Sorted by difficulty
                </div>
                {selectedQuestions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove All
                  </button>
                )}
              </div>
              {selectedQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No questions selected. Go back to select questions.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {[...selectedQuestions]
                    .sort((a, b) => (a.d || 1) - (b.d || 1))
                    .map((q, i) => {
                      const hasOverride = questionOverrides.has(q.id);
                      return (
                        <div key={q.id} className={`flex items-center gap-3 p-3 rounded-xl border bg-white ${hasOverride ? 'border-purple-300' : 'border-slate-200'}`}>
                          <span className="text-sm font-bold text-slate-400 w-8">Q{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono text-slate-400">{q.src}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                q.d === 1 ? 'bg-green-100 text-green-700' :
                                q.d === 2 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                d={q.d}
                              </span>
                              <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{q.marks}m</span>
                              <span className="text-xs text-slate-400">s:{q.s}</span>
                              {hasOverride && (
                                <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">AI variant</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 truncate mt-0.5">
                              {(questionOverrides.get(q.id)?.tex ?? q.tex)
                                .replace(/\$[^$]+\$/g, '[math]')
                                .replace(/\\[a-zA-Z]+/g, '')
                                .slice(0, 120)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setVariantModalQ(q)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-purple-600 hover:bg-purple-50 transition shrink-0"
                            title="Generate AI variants"
                          >
                            <Sparkles size={12} /> Variants
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="text-xs text-red-500 hover:text-red-600 shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview & Compile */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {selectedQuestions.length} questions / {totalMarks} marks
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition"
                >
                  Save Paper
                </button>
              </div>
              {saveError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {saveError}
                </div>
              )}
              <PaperTexPreview
                texSource={texSource}
                onTexChange={setTexSource}
                paperId={paperId}
                board={config.board}
              />
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && selectedIds.size === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                title={step === 1 && selectedIds.size === 0 ? 'Select at least one question to continue' : undefined}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* AI Variant Modal — shown from step 2 */}
      {variantModalQ && (
        <QuestionVariantModal
          question={variantModalQ}
          isOpen={true}
          onClose={() => setVariantModalQ(null)}
          onUseVariant={v => handleUseVariant(variantModalQ.id, v)}
        />
      )}
    </div>
  );
}
