import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { EmailDigest } from '../types';

const genId = () => `ed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const emailDigestService = {
  async getAll(): Promise<EmailDigest[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('email_digests').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(digest: Omit<EmailDigest, 'id'>): Promise<EmailDigest> {
    const newDigest = { ...digest, id: genId() };
    if (!isSupabaseConfigured) return newDigest;
    const { data, error } = await supabase!.from('email_digests').insert([newDigest]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<EmailDigest>): Promise<EmailDigest> {
    if (!isSupabaseConfigured) return { ...updates, id } as EmailDigest;
    const { data, error } = await supabase!.from('email_digests').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('email_digests').delete().eq('id', id);
    if (error) throw error;
  },
};
