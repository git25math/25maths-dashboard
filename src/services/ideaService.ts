import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Idea } from '../types';

const genId = () => `idea-${Date.now()}`;

export const ideaService = {
  async getAll(): Promise<Idea[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('ideas').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(idea: Omit<Idea, 'id'>): Promise<Idea> {
    const newIdea = { ...idea, id: genId() };
    if (!isSupabaseConfigured) return newIdea;
    const { data, error } = await supabase!.from('ideas').insert([newIdea]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Idea>): Promise<Idea> {
    if (!isSupabaseConfigured) return { ...updates, id } as Idea;
    const { data, error } = await supabase!.from('ideas').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('ideas').delete().eq('id', id);
    if (error) throw error;
  },
};
