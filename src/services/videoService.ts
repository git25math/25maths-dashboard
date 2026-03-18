import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { VideoScript } from '../types/video';

const TABLE = 'video_scripts';

export const videoService = {
  async getAll(): Promise<VideoScript[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data as VideoScript[]) || [];
    } catch {
      return [];
    }
  },

  async create(item: VideoScript): Promise<VideoScript> {
    if (!isSupabaseConfigured) return item;

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      return data as VideoScript;
    } catch {
      return item;
    }
  },

  async update(id: string, updates: Partial<VideoScript>): Promise<VideoScript> {
    const fallback = { ...updates, id } as VideoScript;

    if (!isSupabaseConfigured) return fallback;

    try {
      const { data, error } = await supabase!
        .from(TABLE)
        .upsert({ ...updates, id })
        .select()
        .single();

      if (error) throw error;
      return data as VideoScript;
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
