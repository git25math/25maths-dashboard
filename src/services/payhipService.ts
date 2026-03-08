import { randomAlphaId } from '../lib/id';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { PayhipItem } from '../types';

const TABLE = 'payhip_items';

const genId = () => `payhip-${randomAlphaId()}`;

export const payhipService = {
  async getAll(): Promise<PayhipItem[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .select('*')
        .order('level', { ascending: true })
        .order('sku', { ascending: true });

      if (error) throw error;
      return (data as PayhipItem[]) || [];
    } catch {
      return [];
    }
  },

  async create(item: Omit<PayhipItem, 'id'>): Promise<PayhipItem> {
    const newItem: PayhipItem = {
      ...item,
      id: item.sku || genId(),
    };

    if (!isSupabaseConfigured) return newItem;

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      return data as PayhipItem;
    } catch {
      return newItem;
    }
  },

  async update(id: string, updates: Partial<PayhipItem>): Promise<PayhipItem> {
    const fallback = { ...updates, id } as PayhipItem;

    if (!isSupabaseConfigured) return fallback;

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .upsert({ ...updates, id })
        .select()
        .single();

      if (error) throw error;
      return data as PayhipItem;
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
      // Keep local state usable even when Supabase is unavailable.
    }
  },
};
