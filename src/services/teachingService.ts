import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { TeachingUnit } from '../types';

const genId = () => Math.random().toString(36).substr(2, 9);

export const teachingService = {
  async getAllUnits(): Promise<TeachingUnit[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('teaching_units').select('*');
    if (error) throw error;
    return data || [];
  },

  async createUnit(unit: Omit<TeachingUnit, 'id'>): Promise<TeachingUnit> {
    const newUnit = { ...unit, id: genId() };
    if (!isSupabaseConfigured) return newUnit;
    const { data, error } = await supabase!.from('teaching_units').insert([newUnit]).select().single();
    if (error) throw error;
    return data;
  },

  async updateUnit(id: string, updates: Partial<TeachingUnit>): Promise<TeachingUnit> {
    if (!isSupabaseConfigured) return { ...updates, id } as TeachingUnit;
    const { data, error } = await supabase!.from('teaching_units').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async deleteUnit(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('teaching_units').delete().eq('id', id);
    if (error) throw error;
  }
};
