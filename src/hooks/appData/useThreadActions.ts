import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { threadService } from '../../services/threadService';
import { DevLogThread } from '../../types/chronicle';
import { ToastApi } from '../../types';

interface UseThreadActionsParams {
  threads: DevLogThread[];
  setThreads: Dispatch<SetStateAction<DevLogThread[]>>;
  toast: ToastApi;
}

export function useThreadActions({ threads, setThreads, toast }: UseThreadActionsParams) {
  const threadsRef = useRef(threads);
  threadsRef.current = threads;

  const addThread = useCallback(async (data: Omit<DevLogThread, 'id'>) => {
    try {
      const created = await threadService.create(data);
      setThreads(prev => [created, ...prev]);
      toast.success('Thread created');
      return created;
    } catch (error) {
      toast.error('Failed to create thread');
      throw error;
    }
  }, [setThreads, toast]);

  const updateThread = useCallback(async (id: string, updates: Partial<DevLogThread>) => {
    const existing = threadsRef.current.find(t => t.id === id);
    if (!existing) return;
    try {
      const updated = await threadService.update(id, { ...existing, ...updates });
      setThreads(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
      toast.success('Thread updated');
    } catch (error) {
      toast.error('Failed to update thread');
    }
  }, [setThreads, toast]);

  const deleteThread = useCallback(async (id: string) => {
    try {
      await threadService.delete(id);
      setThreads(prev => prev.filter(t => t.id !== id));
      toast.success('Thread deleted');
    } catch (error) {
      toast.error('Failed to delete thread');
    }
  }, [setThreads, toast]);

  return { addThread, updateThread, deleteThread };
}
