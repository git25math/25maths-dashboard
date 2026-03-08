import { useCallback } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useKahootWizard, WizardStep } from '../../hooks/useKahootWizard';
import { KahootItem } from '../../types';
import { StepPrompt } from './steps/StepPrompt';
import { StepReview } from './steps/StepReview';
import { StepExport } from './steps/StepExport';
import { StepUpload } from './steps/StepUpload';
import { StepDone } from './steps/StepDone';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'prompt', label: 'Prompt' },
  { key: 'review', label: 'Review' },
  { key: 'export', label: 'Export' },
  { key: 'upload', label: 'Upload' },
  { key: 'done', label: 'Done' },
];

interface KahootCreateWizardProps {
  onBack: () => void;
  onSaveItem: (item: KahootItem) => Promise<KahootItem | undefined>;
  onCopy: (value: string, label: string) => void;
}

export function KahootCreateWizard({ onBack, onSaveItem, onCopy }: KahootCreateWizardProps) {
  const wizard = useKahootWizard();

  const handleGenerate = useCallback(async () => {
    // For now, just move to review step.
    // Full AI generation via Agent is available in the Upload step.
    wizard.setIsGenerating(true);
    wizard.setGenerateError('');
    try {
      // Mark that AI fill should be used during upload
      wizard.updateDraft({ review_notes: `AI prompt: ${wizard.aiPrompt}` });
      // Move to review so user can paste the AI-generated output
      wizard.next();
    } catch (err) {
      wizard.setGenerateError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      wizard.setIsGenerating(false);
    }
  }, [wizard]);

  const persistDraft = useCallback(async (draft: KahootItem) => {
    const saved = await onSaveItem(draft);
    if (saved) wizard.updateDraft(saved);
    return saved;
  }, [onSaveItem, wizard]);

  const handlePersistDraftUpdates = useCallback(async (id: string, updates: Partial<KahootItem>) => {
    const merged: KahootItem = {
      ...wizard.draft,
      ...updates,
      id,
    };

    wizard.updateDraft(merged);
    const saved = await onSaveItem(merged);
    if (saved) wizard.updateDraft(saved);
  }, [onSaveItem, wizard]);

  const handleReviewNext = useCallback(async () => {
    const reviewed: KahootItem = {
      ...wizard.draft,
      pipeline: {
        ...wizard.draft.pipeline,
        reviewed: true,
      },
      upload_status: wizard.draft.upload_status === 'ai_generated'
        ? 'human_review'
        : wizard.draft.upload_status,
    };

    wizard.updateDraft(reviewed);
    await persistDraft(reviewed);
    wizard.next();
  }, [persistDraft, wizard]);

  const handleGoToLibrary = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleCreateAnother = useCallback(() => {
    wizard.reset();
  }, [wizard]);

  return (
    <div className="space-y-8">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Create</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">New Kahoot</h2>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const isCurrent = s.key === wizard.step;
          const isPast = i < wizard.stepIndex;

          return (
            <div key={s.key} className="flex items-center gap-1 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0',
                  isCurrent ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' :
                  isPast ? 'bg-emerald-100 text-emerald-600' :
                  'bg-slate-100 text-slate-400',
                )}>
                  {isPast ? <Check size={14} /> : i + 1}
                </div>
                <span className={cn(
                  'text-xs font-semibold hidden sm:block',
                  isCurrent ? 'text-indigo-600' : isPast ? 'text-emerald-600' : 'text-slate-400',
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-px flex-1', isPast ? 'bg-emerald-200' : 'bg-slate-200')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="pt-4">
        {wizard.step === 'prompt' && (
          <StepPrompt
            board={wizard.draft.board}
            track={wizard.draft.track}
            topicCode={wizard.draft.topic_code}
            aiPrompt={wizard.aiPrompt}
            isGenerating={wizard.isGenerating}
            generateError={wizard.generateError}
            onBoardChange={board => wizard.updateDraft({ board })}
            onTrackChange={track => wizard.updateDraft({ track })}
            onTopicCodeChange={topic_code => wizard.updateDraft({ topic_code })}
            onAiPromptChange={wizard.setAiPrompt}
            onGenerate={handleGenerate}
            onSkip={() => wizard.next()}
          />
        )}

        {wizard.step === 'review' && (
          <StepReview
            draft={wizard.draft}
            onUpdateDraft={wizard.updateDraft}
            onSetQuestions={wizard.setQuestions}
            onNext={() => void handleReviewNext()}
            onBack={wizard.back}
          />
        )}

        {wizard.step === 'export' && (
          <StepExport
            draft={wizard.draft}
            onNext={wizard.next}
            onBack={wizard.back}
            onCopy={onCopy}
            onPersistItem={handlePersistDraftUpdates}
          />
        )}

        {wizard.step === 'upload' && (
          <StepUpload
            draft={wizard.draft}
            onNext={wizard.next}
            onBack={wizard.back}
            onCopy={onCopy}
            onPersistItem={handlePersistDraftUpdates}
          />
        )}

        {wizard.step === 'done' && (
          <StepDone
            draft={wizard.draft}
            onCopy={onCopy}
            onGoToLibrary={handleGoToLibrary}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </div>
    </div>
  );
}
