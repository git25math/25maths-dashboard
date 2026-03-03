import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Task } from '../types';

const genId = () => `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const taskService = {
  async getAll(): Promise<Task[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('tasks').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const newTask = { ...task, id: genId() };
    if (!isSupabaseConfigured) return newTask;
    const { data, error } = await supabase!.from('tasks').insert([newTask]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    if (!isSupabaseConfigured) return { ...updates, id } as Task;
    const { data, error } = await supabase!.from('tasks').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};
