import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { sopService } from '../../services/sopService';
import { SOP, ToastApi } from '../../types';

interface UseSOPActionsParams {
  sops: SOP[];
  setSops: Dispatch<SetStateAction<SOP[]>>;
  toast: ToastApi;
}

export function useSOPActions({ sops, setSops, toast }: UseSOPActionsParams) {
  const sopsRef = useRef(sops);
  sopsRef.current = sops;

  const addSOP = useCallback(async (data: { title: string; category: string; content: string }) => {
    try {
      const created = await sopService.create(data);
      setSops(prev => [...prev, created]);
      toast.success('SOP added');
    } catch (error) {
      toast.error('Failed to add SOP');
    }
  }, [setSops, toast]);

  const updateSOP = useCallback(async (id: string, updates: Partial<SOP>) => {
    const existing = sopsRef.current.find(s => s.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await sopService.update(id, merged);
      setSops(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      toast.success('SOP updated');
    } catch (error) {
      toast.error('Failed to update SOP');
    }
  }, [setSops, toast]);

  const deleteSOP = useCallback(async (id: string) => {
    try {
      await sopService.delete(id);
      setSops(prev => prev.filter(s => s.id !== id));
      toast.success('SOP deleted');
    } catch (error) {
      toast.error('Failed to delete SOP');
    }
  }, [setSops, toast]);

  const consolidateSOPs = useCallback(async (
    selectedIds: string[],
    consolidated: { title: string; content: string; category: string }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => sopService.delete(id)));
      setSops(prev => prev.filter(s => !selectedIds.includes(s.id)));

      const created = await sopService.create(consolidated);
      setSops(prev => [...prev, created]);
      toast.success(`Consolidated ${selectedIds.length} SOPs into 1`);
    } catch (error) {
      toast.error('Failed to consolidate SOPs');
      throw error;
    }
  }, [setSops, toast]);

  return {
    addSOP,
    updateSOP,
    deleteSOP,
    consolidateSOPs,
  };
}
