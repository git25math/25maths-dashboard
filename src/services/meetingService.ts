import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { MeetingRecord } from '../types';

const genId = () => `mt-${Date.now()}`;

export const meetingService = {
  async getAll(): Promise<MeetingRecord[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('meeting_records').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(meeting: Omit<MeetingRecord, 'id'>): Promise<MeetingRecord> {
    const newMeeting = { ...meeting, id: genId() };
    if (!isSupabaseConfigured) return newMeeting;
    const { data, error } = await supabase!.from('meeting_records').insert([newMeeting]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<MeetingRecord>): Promise<MeetingRecord> {
    if (!isSupabaseConfigured) return { ...updates, id } as MeetingRecord;
    const { data, error } = await supabase!
      .from('meeting_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('meeting_records').delete().eq('id', id);
    if (error) throw error;
  },
};
