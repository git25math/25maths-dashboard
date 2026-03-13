import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { devlogService } from '../../services/devlogService';
import { DevLogEntry } from '../../types/chronicle';
import { ToastApi } from '../../types';

interface UseDevlogActionsParams {
  devlogs: DevLogEntry[];
  setDevlogs: Dispatch<SetStateAction<DevLogEntry[]>>;
  toast: ToastApi;
}

export function useDevlogActions({ devlogs, setDevlogs, toast }: UseDevlogActionsParams) {
  const devlogsRef = useRef(devlogs);
  devlogsRef.current = devlogs;

  const addDevLog = useCallback(async (data: Omit<DevLogEntry, 'id'>) => {
    try {
      const created = await devlogService.create(data);
      setDevlogs(prev => [created, ...prev]);
      toast.success('Dev log added');
      return created;
    } catch (error) {
      toast.error('Failed to add dev log');
      throw error;
    }
  }, [setDevlogs, toast]);

  const updateDevLog = useCallback(async (id: string, updates: Partial<DevLogEntry>) => {
    const existing = devlogsRef.current.find(d => d.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
    try {
      const updated = await devlogService.update(id, merged);
      setDevlogs(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
      toast.success('Dev log updated');
    } catch (error) {
      toast.error('Failed to update dev log');
    }
  }, [setDevlogs, toast]);

  const deleteDevLog = useCallback(async (id: string) => {
    try {
      await devlogService.delete(id);
      setDevlogs(prev => prev.filter(d => d.id !== id));
      toast.success('Dev log deleted');
    } catch (error) {
      toast.error('Failed to delete dev log');
    }
  }, [setDevlogs, toast]);

  return { addDevLog, updateDevLog, deleteDevLog };
}
