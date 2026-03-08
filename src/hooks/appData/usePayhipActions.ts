import { Dispatch, SetStateAction, useCallback } from 'react';
import { payhipService } from '../../services/payhipService';
import { PayhipItem, PayhipPipeline, PayhipPipelineStage, PayhipStatus } from '../../types';
import { mergePayhipPipeline } from '../../lib/payhipUtils';

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface UsePayhipActionsParams {
  payhipItems: PayhipItem[];
  setPayhipItems: Dispatch<SetStateAction<PayhipItem[]>>;
  toast: ToastApi;
}

const PAYHIP_PIPELINE_KEYS: PayhipPipelineStage[] = [
  'matrix_ready',
  'copy_ready',
  'payhip_created',
  'url_backfilled',
  'qa_verified',
  'site_synced',
];

export function usePayhipActions({ payhipItems, setPayhipItems, toast }: UsePayhipActionsParams) {
  const persistItem = useCallback(async (item: PayhipItem, successMessage?: string) => {
    try {
      const updated = await payhipService.update(item.id, item);
      setPayhipItems(prev => prev.map(entry => entry.id === item.id ? { ...entry, ...updated } : entry));
      if (successMessage) toast.success(successMessage);
      return updated;
    } catch (error) {
      toast.error('Failed to save Payhip item');
      throw error;
    }
  }, [setPayhipItems, toast]);

  const updatePayhip = useCallback(async (id: string, updates: Partial<PayhipItem>) => {
    const existing = payhipItems.find(item => item.id === id);
    if (!existing) return;

    const timestamp = new Date().toISOString();
    const merged: PayhipItem = {
      ...existing,
      ...updates,
      payhip_url: updates.payhip_url ?? existing.payhip_url,
      notes: updates.notes ?? existing.notes,
      presale_notes: updates.presale_notes ?? existing.presale_notes,
      pipeline: mergePayhipPipeline(existing, updates),
      updated_at: timestamp,
    };

    await persistItem(merged, 'Payhip item updated');
  }, [payhipItems, persistItem]);

  const setPayhipStatus = useCallback(async (id: string, status: PayhipStatus) => {
    await updatePayhip(id, { status });
  }, [updatePayhip]);

  const togglePayhipPipelineStage = useCallback(async (id: string, stage: PayhipPipelineStage) => {
    const existing = payhipItems.find(item => item.id === id);
    if (!existing) return;

    await updatePayhip(id, {
      pipeline: {
        ...existing.pipeline,
        [stage]: !existing.pipeline[stage],
      },
    });
  }, [payhipItems, updatePayhip]);

  const bulkSetPayhipPipeline = useCallback(async (id: string, value: boolean) => {
    const existing = payhipItems.find(item => item.id === id);
    if (!existing) return;

    const pipeline = PAYHIP_PIPELINE_KEYS.reduce((acc, key) => {
      acc[key] = value;
      return acc;
    }, {} as PayhipPipeline);

    await updatePayhip(id, { pipeline });
  }, [payhipItems, updatePayhip]);

  return {
    updatePayhip,
    setPayhipStatus,
    togglePayhipPipelineStage,
    bulkSetPayhipPipeline,
  };
}
