import { Dispatch, SetStateAction, useCallback } from 'react';
import { randomAlphaId } from '../../lib/id';
import { kahootService } from '../../services/kahootService';
import { KahootCorrectOption, KahootItem, KahootPipeline, KahootQuestion, KahootTimeLimit, KahootUploadStatus } from '../../types';

const DEFAULT_PIPELINE: KahootPipeline = {
  ai_generated: false,
  reviewed: false,
  excel_exported: false,
  kahoot_uploaded: false,
  web_verified: false,
  published: false,
};

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface UseKahootActionsParams {
  kahootItems: KahootItem[];
  setKahootItems: Dispatch<SetStateAction<KahootItem[]>>;
  toast: ToastApi;
}

const DEFAULT_CORRECT_OPTION: KahootCorrectOption = 'A';
const DEFAULT_TIME_LIMIT: KahootTimeLimit = 20;

function makeDefaultQuestion(index: number): KahootQuestion {
  return {
    id: `question-${randomAlphaId()}`,
    prompt: `Question ${index}`,
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: DEFAULT_CORRECT_OPTION,
    time_limit: DEFAULT_TIME_LIMIT,
  };
}

const STATUS_ORDER: KahootUploadStatus[] = ['ai_generated', 'human_review', 'excel_exported', 'kahoot_uploaded', 'web_verified', 'published'];

function applyStatusTimestamps(item: KahootItem, nextStatus: KahootUploadStatus, timestamp: string): KahootItem {
  const idx = STATUS_ORDER.indexOf(nextStatus);

  return {
    ...item,
    upload_status: nextStatus,
    ai_generated_at: item.ai_generated_at || timestamp,
    human_reviewed_at: idx >= 1 ? (item.human_reviewed_at || timestamp) : item.human_reviewed_at,
    uploaded_at: idx >= 3 ? (item.uploaded_at || timestamp) : item.uploaded_at,
    updated_at: timestamp,
  };
}

export function useKahootActions({ kahootItems, setKahootItems, toast }: UseKahootActionsParams) {
  const persistItem = useCallback(async (item: KahootItem, successMessage?: string) => {
    try {
      const updated = await kahootService.update(item.id, item);
      setKahootItems(prev => prev.map(entry => entry.id === item.id ? { ...entry, ...updated } : entry));
      if (successMessage) toast.success(successMessage);
      return updated;
    } catch (error) {
      toast.error('Failed to save Kahoot item');
      throw error;
    }
  }, [setKahootItems, toast]);

  const addKahoot = useCallback(async (seed?: Partial<Omit<KahootItem, 'id'>>): Promise<KahootItem | undefined> => {
    const timestamp = new Date().toISOString();
    const baseItem: Omit<KahootItem, 'id'> = {
      board: seed?.board || 'cie0580',
      track: seed?.track || 'core',
      topic_code: seed?.topic_code || `NEW-${kahootItems.length + 1}`,
      title: seed?.title || 'Untitled Kahoot',
      description: seed?.description || '',
      cover_url: seed?.cover_url,
      page_url: seed?.page_url,
      challenge_url: seed?.challenge_url,
      creator_url: seed?.creator_url,
      website_link_id: seed?.website_link_id,
      listing_path: seed?.listing_path,
      tags: seed?.tags || [],
      upload_status: seed?.upload_status || 'ai_generated',
      pipeline: seed?.pipeline || { ...DEFAULT_PIPELINE, ai_generated: true },
      questions: seed?.questions?.length ? seed.questions : [makeDefaultQuestion(1), makeDefaultQuestion(2)],
      review_notes: seed?.review_notes || '',
      created_at: seed?.created_at || timestamp,
      updated_at: timestamp,
      ai_generated_at: seed?.ai_generated_at || timestamp,
      human_reviewed_at: seed?.human_reviewed_at,
      uploaded_at: seed?.uploaded_at,
    };

    try {
      const created = await kahootService.create(baseItem);
      setKahootItems(prev => [created, ...prev]);
      toast.success('Kahoot item added');
      return created;
    } catch (error) {
      toast.error('Failed to add Kahoot item');
      return undefined;
    }
  }, [kahootItems.length, setKahootItems, toast]);

  const updateKahoot = useCallback(async (id: string, updates: Partial<KahootItem>) => {
    const existing = kahootItems.find(item => item.id === id);
    if (!existing) return;

    const timestamp = new Date().toISOString();
    const mergedBase: KahootItem = {
      ...existing,
      ...updates,
      updated_at: timestamp,
    };

    const merged = updates.upload_status
      ? applyStatusTimestamps(mergedBase, updates.upload_status, timestamp)
      : mergedBase;

    await persistItem(merged, 'Kahoot item updated');
  }, [kahootItems, persistItem]);

  const deleteKahoot = useCallback(async (id: string) => {
    try {
      await kahootService.delete(id);
      setKahootItems(prev => prev.filter(item => item.id !== id));
      toast.success('Kahoot item deleted');
    } catch (error) {
      toast.error('Failed to delete Kahoot item');
    }
  }, [setKahootItems, toast]);

  const duplicateKahoot = useCallback(async (id: string): Promise<KahootItem | undefined> => {
    const existing = kahootItems.find(item => item.id === id);
    if (!existing) return undefined;

    return addKahoot({
      ...existing,
      title: `${existing.title} Copy`,
      topic_code: `${existing.topic_code}-COPY`,
      upload_status: 'ai_generated',
      challenge_url: undefined,
      page_url: existing.page_url,
      creator_url: existing.creator_url,
      website_link_id: undefined,
      listing_path: existing.listing_path,
      ai_generated_at: new Date().toISOString(),
      human_reviewed_at: undefined,
      uploaded_at: undefined,
      questions: existing.questions.map((question, index) => ({
        ...question,
        id: `question-${randomAlphaId()}`,
        prompt: question.prompt || `Question ${index + 1}`,
      })),
    });
  }, [addKahoot, kahootItems]);

  const addQuestion = useCallback(async (kahootId: string) => {
    const existing = kahootItems.find(item => item.id === kahootId);
    if (!existing) return;

    const nextQuestion = makeDefaultQuestion(existing.questions.length + 1);
    await persistItem(
      {
        ...existing,
        questions: [...existing.questions, nextQuestion],
        updated_at: new Date().toISOString(),
      },
      'Question added',
    );
  }, [kahootItems, persistItem]);

  const updateQuestion = useCallback(async (kahootId: string, questionId: string, updates: Partial<KahootQuestion>) => {
    const existing = kahootItems.find(item => item.id === kahootId);
    if (!existing) return;

    await persistItem(
      {
        ...existing,
        questions: existing.questions.map(question => question.id === questionId ? { ...question, ...updates } : question),
        updated_at: new Date().toISOString(),
      },
      'Question updated',
    );
  }, [kahootItems, persistItem]);

  const deleteQuestion = useCallback(async (kahootId: string, questionId: string) => {
    const existing = kahootItems.find(item => item.id === kahootId);
    if (!existing) return;

    await persistItem(
      {
        ...existing,
        questions: existing.questions.filter(question => question.id !== questionId),
        updated_at: new Date().toISOString(),
      },
      'Question removed',
    );
  }, [kahootItems, persistItem]);

  const moveQuestion = useCallback(async (kahootId: string, questionId: string, direction: -1 | 1) => {
    const existing = kahootItems.find(item => item.id === kahootId);
    if (!existing) return;

    const index = existing.questions.findIndex(question => question.id === questionId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= existing.questions.length) return;

    const nextQuestions = [...existing.questions];
    const [moved] = nextQuestions.splice(index, 1);
    nextQuestions.splice(targetIndex, 0, moved);

    await persistItem(
      {
        ...existing,
        questions: nextQuestions,
        updated_at: new Date().toISOString(),
      },
      'Question order updated',
    );
  }, [kahootItems, persistItem]);

  return {
    addKahoot,
    updateKahoot,
    deleteKahoot,
    duplicateKahoot,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
  };
}
