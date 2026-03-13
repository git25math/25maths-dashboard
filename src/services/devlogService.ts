import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { DevLogEntry } from '../types/chronicle';

const genId = () => `dl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const devlogService = {
  async getAll(): Promise<DevLogEntry[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('devlogs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(entry: Omit<DevLogEntry, 'id'>): Promise<DevLogEntry> {
    const newItem = { ...entry, id: genId() };
    if (!isSupabaseConfigured) return newItem;
    const { data, error } = await supabase!.from('devlogs').insert([newItem]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<DevLogEntry>): Promise<DevLogEntry> {
    if (!isSupabaseConfigured) return { ...updates, id } as DevLogEntry;
    const { data, error } = await supabase!.from('devlogs').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('devlogs').delete().eq('id', id);
    if (error) throw error;
  },
};
