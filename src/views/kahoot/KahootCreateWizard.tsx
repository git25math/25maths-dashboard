import { useCallback } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useKahootWizard, WizardStep } from '../../hooks/useKahootWizard';
import { LocalAgentJob } from '../../services/localAgentService';
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
  onSaveItem: (item: KahootItem) => Promise<void>;
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

  const handleJobComplete = useCallback(async (job: LocalAgentJob) => {
    if (job.status === 'completed') {
      const result = job.result as Record<string, unknown> | null;
      const itemResult = result?.item as Partial<KahootItem> | undefined;
      if (itemResult) {
        const merged: KahootItem = {
          ...wizard.draft,
          ...itemResult,
          upload_status: 'kahoot_uploaded',
          uploaded_at: new Date().toISOString(),
        };
        wizard.updateDraft(merged);
        try { await onSaveItem(merged); } catch { /* toast handles errors */ }
      }
    }
    wizard.next(); // Move to Done step
  }, [wizard, onSaveItem]);

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
            onNext={wizard.next}
            onBack={wizard.back}
          />
        )}

        {wizard.step === 'export' && (
          <StepExport
            draft={wizard.draft}
            onNext={wizard.next}
            onBack={wizard.back}
          />
        )}

        {wizard.step === 'upload' && (
          <StepUpload
            draft={wizard.draft}
            onJobComplete={handleJobComplete}
            onBack={wizard.back}
          />
        )}

        {wizard.step === 'done' && (
          <StepDone
            job={null}
            draftTitle={wizard.draft.title}
            questionCount={wizard.draft.questions.length}
            onCopy={onCopy}
            onGoToLibrary={handleGoToLibrary}
            onCreateAnother={handleCreateAnother}
          />
        )}
      </div>
    </div>
  );
}
