import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isPlaceholderConfig =
  supabaseUrl === 'your_supabase_project_url' ||
  supabaseAnonKey === 'your_supabase_anon_key';

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  isValidHttpUrl(supabaseUrl) &&
  !isPlaceholderConfig;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const requireSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.'
    );
  }
  return supabase;
};

/** Bulk-upsert localStorage data to Supabase (one-time migration). */
export async function syncToSupabase<T extends { id: string }>(table: string, localData: T[]): Promise<void> {
  if (!supabase || localData.length === 0) return;
  const { error } = await supabase.from(table).upsert(localData, { onConflict: 'id', ignoreDuplicates: false });
  if (error) console.warn(`syncToSupabase(${table}):`, error.message);
}
