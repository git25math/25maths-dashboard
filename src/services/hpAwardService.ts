import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { HPAwardLog } from '../types';

const genId = () => `hp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const hpAwardService = {
  async getAll(): Promise<HPAwardLog[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('hp_award_logs').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(log: Omit<HPAwardLog, 'id'>): Promise<HPAwardLog> {
    const newLog = { ...log, id: genId() };
    if (!isSupabaseConfigured) return newLog;
    const { data, error } = await supabase!.from('hp_award_logs').insert([newLog]).select().single();
    if (error) throw error;
    return data;
  },

  async createBatch(logs: Omit<HPAwardLog, 'id'>[]): Promise<HPAwardLog[]> {
    const newLogs = logs.map(log => ({ ...log, id: genId() }));
    if (!isSupabaseConfigured) return newLogs;
    const { data, error } = await supabase!.from('hp_award_logs').insert(newLogs).select();
    if (error) throw error;
    return data || newLogs;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('hp_award_logs').delete().eq('id', id);
    if (error) throw error;
  },

  async deleteBySourceId(sourceId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('hp_award_logs').delete().eq('source_id', sourceId);
    if (error) throw error;
  },
};
