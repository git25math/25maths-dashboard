import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SOP } from '../types';

const genId = () => `sop-${Date.now()}`;

export const sopService = {
  async getAll(): Promise<SOP[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('sops').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(sop: Omit<SOP, 'id'>): Promise<SOP> {
    const newSop = { ...sop, id: genId() };
    if (!isSupabaseConfigured) return newSop;
    const { data, error } = await supabase!.from('sops').insert([newSop]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<SOP>): Promise<SOP> {
    if (!isSupabaseConfigured) return { ...updates, id } as SOP;
    const { data, error } = await supabase!.from('sops').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('sops').delete().eq('id', id);
    if (error) throw error;
  },
};
