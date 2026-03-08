import { useCallback, useState } from 'react';
import { randomAlphaId } from '../lib/id';
import { KahootBoard, KahootItem, KahootQuestion, KahootTrack } from '../types';

export type WizardStep = 'prompt' | 'review' | 'export' | 'upload' | 'done';

const STEP_ORDER: WizardStep[] = ['prompt', 'review', 'export', 'upload', 'done'];

function createBlankItem(board: KahootBoard, track: KahootTrack): KahootItem {
  const now = new Date().toISOString();
  return {
    id: `kahoot-${randomAlphaId()}`,
    board,
    track,
    topic_code: '',
    title: '',
    description: '',
    tags: [],
    upload_status: 'ai_generated',
    pipeline: {
      ai_generated: false, reviewed: false, excel_exported: false,
      kahoot_uploaded: false, web_verified: false, published: false,
    },
    questions: [],
    created_at: now,
    updated_at: now,
  };
}

export interface WizardState {
  step: WizardStep;
  stepIndex: number;
  draft: KahootItem;
  aiPrompt: string;
  isGenerating: boolean;
  generateError: string;
}

export interface WizardActions {
  setStep: (step: WizardStep) => void;
  next: () => void;
  back: () => void;
  canGoNext: boolean;
  canGoBack: boolean;
  updateDraft: (updates: Partial<KahootItem>) => void;
  setQuestions: (questions: KahootQuestion[]) => void;
  setAiPrompt: (prompt: string) => void;
  setIsGenerating: (v: boolean) => void;
  setGenerateError: (msg: string) => void;
  reset: (board?: KahootBoard, track?: KahootTrack) => void;
}

export function useKahootWizard(
  initialBoard: KahootBoard = 'cie0580',
  initialTrack: KahootTrack = 'core',
): WizardState & WizardActions {
  const [step, setStepRaw] = useState<WizardStep>('prompt');
  const [draft, setDraft] = useState<KahootItem>(() => createBlankItem(initialBoard, initialTrack));
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const stepIndex = STEP_ORDER.indexOf(step);
  const canGoNext = stepIndex < STEP_ORDER.length - 1;
  const canGoBack = stepIndex > 0;

  const setStep = useCallback((s: WizardStep) => setStepRaw(s), []);

  const next = useCallback(() => {
    setStepRaw(prev => {
      const idx = STEP_ORDER.indexOf(prev);
      return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : prev;
    });
  }, []);

  const back = useCallback(() => {
    setStepRaw(prev => {
      const idx = STEP_ORDER.indexOf(prev);
      return idx > 0 ? STEP_ORDER[idx - 1] : prev;
    });
  }, []);

  const updateDraft = useCallback((updates: Partial<KahootItem>) => {
    setDraft(prev => ({ ...prev, ...updates, updated_at: new Date().toISOString() }));
  }, []);

  const setQuestions = useCallback((questions: KahootQuestion[]) => {
    setDraft(prev => ({ ...prev, questions, updated_at: new Date().toISOString() }));
  }, []);

  const reset = useCallback((board?: KahootBoard, track?: KahootTrack) => {
    setStepRaw('prompt');
    setDraft(createBlankItem(board ?? 'cie0580', track ?? 'core'));
    setAiPrompt('');
    setIsGenerating(false);
    setGenerateError('');
  }, []);

  return {
    step,
    stepIndex,
    draft,
    aiPrompt,
    isGenerating,
    generateError,
    setStep,
    next,
    back,
    canGoNext,
    canGoBack,
    updateDraft,
    setQuestions,
    setAiPrompt,
    setIsGenerating,
    setGenerateError,
    reset,
  };
}
