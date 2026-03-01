import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { WorkLog } from '../types';

const genId = () => `wl-${Date.now()}`;

export const workLogService = {
  async getAll(): Promise<WorkLog[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('work_logs').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(log: Omit<WorkLog, 'id'>): Promise<WorkLog> {
    const newLog = { ...log, id: genId() };
    if (!isSupabaseConfigured) return newLog;
    const { data, error } = await supabase!.from('work_logs').insert([newLog]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<WorkLog>): Promise<WorkLog> {
    if (!isSupabaseConfigured) return { ...updates, id } as WorkLog;
    const { data, error } = await supabase!.from('work_logs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('work_logs').delete().eq('id', id);
    if (error) throw error;
  },
};
