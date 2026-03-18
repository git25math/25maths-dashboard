import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Bookmark } from '../types';

const genId = () => `bm-${Date.now()}`;

export const bookmarkService = {
  async getAll(): Promise<Bookmark[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('bookmarks').select('*').order('sort_order');
    if (error) throw error;
    return data || [];
  },

  async create(bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark> {
    const newBookmark = { ...bookmark, id: genId() };
    if (!isSupabaseConfigured) return newBookmark;
    const { data, error } = await supabase!.from('bookmarks').insert([newBookmark]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
    if (!isSupabaseConfigured) return { ...updates, id } as Bookmark;
    const { data, error } = await supabase!.from('bookmarks').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('bookmarks').delete().eq('id', id);
    if (error) throw error;
  },
};
