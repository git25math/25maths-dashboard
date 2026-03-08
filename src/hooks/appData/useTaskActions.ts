import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { taskService } from '../../services/taskService';
import { Task, ToastApi } from '../../types';

interface UseTaskActionsParams {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
  toast: ToastApi;
}

export function useTaskActions({ tasks, setTasks, toast }: UseTaskActionsParams) {
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const addTask = useCallback(async (data: Omit<Task, 'id' | 'created_at'>) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      ) as Omit<Task, 'id' | 'created_at'>;
      const created = await taskService.create({
        ...cleanData,
        created_at: new Date().toISOString(),
      });
      setTasks(prev => [...prev, created]);
      toast.success('Task added');
      return created;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('addTask failed:', error);
      toast.error(`Failed to add task: ${msg}`);
      throw error;
    }
  }, [setTasks, toast]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const existing = tasksRef.current.find(t => t.id === id);
    if (!existing) return;
    if (updates.status === 'done' && existing.status !== 'done') {
      updates.completed_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'done') {
      updates.completed_at = undefined;
    }
    const merged = { ...existing, ...updates };
    try {
      const updated = await taskService.update(id, merged);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  }, [setTasks, toast]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  }, [setTasks, toast]);

  const cycleTaskStatus = useCallback(async (id: string) => {
    const task = tasksRef.current.find(t => t.id === id);
    if (!task) return;
    const cycle: Record<string, Task['status']> = {
      inbox: 'next', next: 'waiting', waiting: 'someday', someday: 'done', done: 'inbox'
    };
    const newStatus = cycle[task.status] || 'inbox';
    await updateTask(id, { status: newStatus });
  }, [updateTask]);

  return {
    addTask,
    updateTask,
    deleteTask,
    cycleTaskStatus,
  };
}
