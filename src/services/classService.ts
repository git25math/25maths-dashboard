import { supabase } from '../lib/supabase';
import { ClassProfile } from '../types';

export const classService = {
  async getAllClasses(): Promise<ClassProfile[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async getClassById(id: string): Promise<ClassProfile | null> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createClass(classProfile: Omit<ClassProfile, 'id'>): Promise<ClassProfile> {
    const { data, error } = await supabase
      .from('classes')
      .insert([classProfile])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateClass(id: string, updates: Partial<ClassProfile>): Promise<ClassProfile> {
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteClass(id: string): Promise<void> {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
