import { supabase } from '../lib/supabase';
import { Student, StudentStatusRecord, StudentRequest, StudentWeakness } from '../types';

export const studentService = {
  async getAllStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async getStudentById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Status Records
  async addStatusRecord(studentId: string, record: Omit<StudentStatusRecord, 'id'>): Promise<StudentStatusRecord> {
    const { data, error } = await supabase
      .from('student_status_records')
      .insert([{ ...record, student_id: studentId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Requests
  async addRequest(studentId: string, request: Omit<StudentRequest, 'id'>): Promise<StudentRequest> {
    const { data, error } = await supabase
      .from('student_requests')
      .insert([{ ...request, student_id: studentId }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Weaknesses
  async updateWeaknesses(studentId: string, weaknesses: StudentWeakness[]): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ weaknesses })
      .eq('id', studentId);
    
    if (error) throw error;
  }
};
