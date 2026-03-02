import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { LessonRecord } from '../types';

const genId = () => `lr-${Date.now()}`;

export const lessonRecordService = {
  async getAll(): Promise<LessonRecord[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('lesson_records').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(record: Omit<LessonRecord, 'id'>): Promise<LessonRecord> {
    const newRecord = { ...record, id: genId() };
    if (!isSupabaseConfigured) return newRecord;
    const { data, error } = await supabase!.from('lesson_records').insert([newRecord]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<LessonRecord>): Promise<LessonRecord> {
    if (!isSupabaseConfigured) return { ...updates, id } as LessonRecord;
    const { data, error } = await supabase!.from('lesson_records').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('lesson_records').delete().eq('id', id);
    if (error) throw error;
  },
};
