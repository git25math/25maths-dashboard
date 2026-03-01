import { supabase } from '../lib/supabase';
import { TeachingUnit, LessonPlanItem } from '../types';

export const teachingService = {
  async getAllUnits(): Promise<TeachingUnit[]> {
    const { data, error } = await supabase
      .from('teaching_units')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async getUnitById(id: string): Promise<TeachingUnit | null> {
    const { data, error } = await supabase
      .from('teaching_units')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createUnit(unit: Omit<TeachingUnit, 'id'>): Promise<TeachingUnit> {
    const { data, error } = await supabase
      .from('teaching_units')
      .insert([unit])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUnit(id: string, updates: Partial<TeachingUnit>): Promise<TeachingUnit> {
    const { data, error } = await supabase
      .from('teaching_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteUnit(id: string): Promise<void> {
    const { error } = await supabase
      .from('teaching_units')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
