import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Project } from '../types';

const genId = () => `proj-${Date.now()}`;

export const projectService = {
  async getAll(): Promise<Project[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('projects').select('*');
    if (error) throw error;
    return data || [];
  },

  async create(project: Omit<Project, 'id'>): Promise<Project> {
    const newProject = { ...project, id: genId() };
    if (!isSupabaseConfigured) return newProject;
    const { data, error } = await supabase!.from('projects').insert([newProject]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    if (!isSupabaseConfigured) return { ...updates, id } as Project;
    const { data, error } = await supabase!.from('projects').upsert({ ...updates, id }).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
};
