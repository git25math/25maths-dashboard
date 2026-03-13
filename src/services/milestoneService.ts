import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ProjectMilestone } from '../types/chronicle';

const genId = () => `ms-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const milestoneService = {
  async getAll(): Promise<ProjectMilestone[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('milestones').select('*').order('order');
    if (error) throw error;
    return data || [];
  },

  async create(milestone: Omit<ProjectMilestone, 'id'>): Promise<ProjectMilestone> {
    const newItem = { ...milestone, id: genId() };
    if (!isSupabaseConfigured) return newItem;
    const { data, error } = await supabase!.from('milestones').insert([newItem]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<ProjectMilestone>): Promise<ProjectMilestone> {
    if (!isSupabaseConfigured) return { ...updates, id } as ProjectMilestone;
    const { data, error } = await supabase!.from('milestones').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('milestones').delete().eq('id', id);
    if (error) throw error;
  },
};
