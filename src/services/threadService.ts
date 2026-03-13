import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { DevLogThread } from '../types/chronicle';

const genId = () => `thr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const threadService = {
  async getAll(): Promise<DevLogThread[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('devlog_threads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(entry: Omit<DevLogThread, 'id'>): Promise<DevLogThread> {
    const newItem = { ...entry, id: genId() };
    if (!isSupabaseConfigured) return newItem;
    const { data, error } = await supabase!.from('devlog_threads').insert([newItem]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DevLogThread>): Promise<DevLogThread> {
    if (!isSupabaseConfigured) return { ...updates, id } as DevLogThread;
    const { data, error } = await supabase!.from('devlog_threads').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('devlog_threads').delete().eq('id', id);
    if (error) throw error;
  },
};
