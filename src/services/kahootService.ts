import { randomAlphaId } from '../lib/id';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { KahootItem } from '../types';

const TABLE = 'kahoot_items';

const genId = () => `kahoot-${randomAlphaId()}`;

export const kahootService = {
  async getAll(): Promise<KahootItem[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data as KahootItem[]) || [];
    } catch {
      return [];
    }
  },

  async create(item: Omit<KahootItem, 'id'>): Promise<KahootItem> {
    const newItem: KahootItem = {
      ...item,
      id: genId(),
    };

    if (!isSupabaseConfigured) return newItem;

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      return data as KahootItem;
    } catch {
      return newItem;
    }
  },

  async update(id: string, updates: Partial<KahootItem>): Promise<KahootItem> {
    const fallback = { ...updates, id } as KahootItem;

    if (!isSupabaseConfigured) return fallback;

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .upsert({ ...updates, id })
        .select()
        .single();

      if (error) throw error;
      return data as KahootItem;
    } catch {
      return fallback;
    }
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase!.from(TABLE).delete().eq('id', id);
      if (error) throw error;
    } catch {
      // Keep local state usable even when the Supabase table is not provisioned yet.
    }
  },
};
