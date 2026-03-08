import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { payhipService } from '../../services/payhipService';
import { PayhipItem, PayhipPipeline, PayhipPipelineStage, PayhipStatus, ToastApi } from '../../types';
import { isPayhipPipelineStageLocked, mergePayhipPipeline } from '../../lib/payhipUtils';

interface UsePayhipActionsParams {
  payhipItems: PayhipItem[];
  setPayhipItems: Dispatch<SetStateAction<PayhipItem[]>>;
  toast: ToastApi;
}

export interface PayhipUpdateOptions {
  silent?: boolean;
  successMessage?: string;
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
  const itemsRef = useRef(payhipItems);
  itemsRef.current = payhipItems;

  const persistItem = useCallback(async (item: PayhipItem, options?: PayhipUpdateOptions) => {
    try {
      const updated = await payhipService.update(item.id, item);
      setPayhipItems(prev => prev.map(entry => entry.id === item.id ? { ...entry, ...updated } : entry));
      const successMessage = options?.successMessage;
      if (!options?.silent && successMessage) toast.success(successMessage);
      return updated;
    } catch (error) {
      toast.error('Failed to save Payhip item');
      throw error;
    }
  }, [setPayhipItems, toast]);

  const updatePayhip = useCallback(async (id: string, updates: Partial<PayhipItem>, options?: PayhipUpdateOptions) => {
    const existing = itemsRef.current.find(item => item.id === id);
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

    await persistItem(merged, { successMessage: options?.successMessage || 'Payhip item updated', silent: options?.silent });
  }, [persistItem]);

  const setPayhipStatus = useCallback(async (id: string, status: PayhipStatus) => {
    await updatePayhip(id, { status });
  }, [updatePayhip]);

  const togglePayhipPipelineStage = useCallback(async (id: string, stage: PayhipPipelineStage) => {
    const existing = itemsRef.current.find(item => item.id === id);
    if (!existing) return;

    if (existing.pipeline[stage] && isPayhipPipelineStageLocked(existing, stage)) {
      toast.error('Final Payhip URL keeps this stage complete');
      return;
    }

    await updatePayhip(id, {
      pipeline: {
        ...existing.pipeline,
        [stage]: !existing.pipeline[stage],
      },
    });
  }, [toast, updatePayhip]);

  const bulkSetPayhipPipeline = useCallback(async (id: string, value: boolean) => {
    const existing = itemsRef.current.find(item => item.id === id);
    if (!existing) return;

    const pipeline = PAYHIP_PIPELINE_KEYS.reduce((acc, key) => {
      acc[key] = !value && isPayhipPipelineStageLocked(existing, key) ? true : value;
      return acc;
    }, {} as PayhipPipeline);

    await updatePayhip(id, { pipeline });
  }, [updatePayhip]);

  return {
    updatePayhip,
    setPayhipStatus,
    togglePayhipPipelineStage,
    bulkSetPayhipPipeline,
  };
}
