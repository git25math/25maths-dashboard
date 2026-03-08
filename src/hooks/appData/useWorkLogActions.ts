import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { workLogService } from '../../services/workLogService';
import { WorkLog, ToastApi } from '../../types';

interface UseWorkLogActionsParams {
  workLogs: WorkLog[];
  setWorkLogs: Dispatch<SetStateAction<WorkLog[]>>;
  toast: ToastApi;
}

export function useWorkLogActions({ workLogs, setWorkLogs, toast }: UseWorkLogActionsParams) {
  const workLogsRef = useRef(workLogs);
  workLogsRef.current = workLogs;

  const addWorkLog = useCallback(async (data: { content: string; category: WorkLog['category']; tags?: string[] }) => {
    try {
      const created = await workLogService.create({
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
        ...data,
      });
      setWorkLogs(prev => [created, ...prev]);
      toast.success('Work log added');
    } catch (error) {
      toast.error('Failed to add work log');
    }
  }, [setWorkLogs, toast]);

  const updateWorkLog = useCallback(async (id: string, updates: Partial<WorkLog>) => {
    const existing = workLogsRef.current.find(l => l.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await workLogService.update(id, merged);
      setWorkLogs(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
      toast.success('Work log updated');
    } catch (error) {
      toast.error('Failed to update work log');
    }
  }, [setWorkLogs, toast]);

  const deleteWorkLog = useCallback(async (id: string) => {
    try {
      await workLogService.delete(id);
      setWorkLogs(prev => prev.filter(l => l.id !== id));
      toast.success('Work log deleted');
    } catch (error) {
      toast.error('Failed to delete work log');
    }
  }, [setWorkLogs, toast]);

  const consolidateWorkLogs = useCallback(async (
    selectedIds: string[],
    consolidated: { content: string; category: WorkLog['category']; tags?: string[] }
  ) => {
    try {
      await Promise.all(selectedIds.map(id => workLogService.delete(id)));
      setWorkLogs(prev => prev.filter(l => !selectedIds.includes(l.id)));

      const created = await workLogService.create({
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
        ...consolidated,
      });
      setWorkLogs(prev => [created, ...prev]);
      toast.success(`Consolidated ${selectedIds.length} logs into 1`);
    } catch (error) {
      toast.error('Failed to consolidate work logs');
      throw error;
    }
  }, [setWorkLogs, toast]);

  return {
    addWorkLog,
    updateWorkLog,
    deleteWorkLog,
    consolidateWorkLogs,
  };
}
