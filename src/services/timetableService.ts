import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { TimetableEntry } from '../types';

const genId = () => `tt-${Date.now()}`;

export const timetableService = {
  async getAll(): Promise<TimetableEntry[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('timetable_entries').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> {
    const newEntry = { ...entry, id: genId() };
    if (!isSupabaseConfigured) return newEntry;
    const { data, error } = await supabase!.from('timetable_entries').insert([newEntry]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<TimetableEntry>): Promise<TimetableEntry> {
    if (!isSupabaseConfigured) return { ...updates, id } as TimetableEntry;
    const { data, error } = await supabase!.from('timetable_entries').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('timetable_entries').delete().eq('id', id);
    if (error) throw error;
  },
};
