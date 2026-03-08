import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { goalService } from '../../services/goalService';
import { Goal, ToastApi } from '../../types';

interface UseGoalActionsParams {
  goals: Goal[];
  setGoals: Dispatch<SetStateAction<Goal[]>>;
  toast: ToastApi;
}

export function useGoalActions({ goals, setGoals, toast }: UseGoalActionsParams) {
  const goalsRef = useRef(goals);
  goalsRef.current = goals;

  const addGoal = useCallback(async (data: Omit<Goal, 'id'>) => {
    try {
      const created = await goalService.create(data);
      setGoals(prev => [...prev, created]);
      toast.success('Goal added');
    } catch (error) {
      toast.error('Failed to add goal');
    }
  }, [setGoals, toast]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const existing = goalsRef.current.find(g => g.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await goalService.update(id, merged);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
      toast.success('Goal updated');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  }, [setGoals, toast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await goalService.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  }, [setGoals, toast]);

  return {
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
