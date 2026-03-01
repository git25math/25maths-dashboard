import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SchoolEvent } from '../types';

const genId = () => `evt-${Date.now()}`;

export const schoolEventService = {
  async getAll(): Promise<SchoolEvent[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('school_events').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(event: Omit<SchoolEvent, 'id'>): Promise<SchoolEvent> {
    const newEvent = { ...event, id: genId() };
    if (!isSupabaseConfigured) return newEvent;
    const { data, error } = await supabase!.from('school_events').insert([newEvent]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<SchoolEvent>): Promise<SchoolEvent> {
    if (!isSupabaseConfigured) return { ...updates, id } as SchoolEvent;
    const { data, error } = await supabase!.from('school_events').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('school_events').delete().eq('id', id);
    if (error) throw error;
  },
};
