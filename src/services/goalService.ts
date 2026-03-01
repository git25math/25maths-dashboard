import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Goal } from '../types';

const genId = () => `goal-${Date.now()}`;

export const goalService = {
  async getAll(): Promise<Goal[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('goals').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const newGoal = { ...goal, id: genId() };
    if (!isSupabaseConfigured) return newGoal;
    const { data, error } = await supabase!.from('goals').insert([newGoal]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    if (!isSupabaseConfigured) return { ...updates, id } as Goal;
    const { data, error } = await supabase!.from('goals').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('goals').delete().eq('id', id);
    if (error) throw error;
  },
};
