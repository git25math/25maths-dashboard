import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ClassProfile } from '../types';

const genId = () => Math.random().toString(36).substr(2, 9);

export const classService = {
  async getAllClasses(): Promise<ClassProfile[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('classes').select('*');
    if (error) throw error;
    return data || [];
  },

  async createClass(classProfile: Omit<ClassProfile, 'id'>): Promise<ClassProfile> {
    const newClass = { ...classProfile, id: genId() };
    if (!isSupabaseConfigured) return newClass;
    const { data, error } = await supabase!.from('classes').insert([newClass]).select().single();
    if (error) throw error;
    return data;
  },

  async updateClass(id: string, updates: Partial<ClassProfile>): Promise<ClassProfile> {
    if (!isSupabaseConfigured) return { ...updates, id } as ClassProfile;
    const { data, error } = await supabase!.from('classes').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async deleteClass(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('classes').delete().eq('id', id);
    if (error) throw error;
  }
};
