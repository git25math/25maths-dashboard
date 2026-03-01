import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Student, StudentStatusRecord, StudentRequest, StudentWeakness } from '../types';

const genId = () => Math.random().toString(36).substr(2, 9);

export const studentService = {
  async getAllStudents(): Promise<Student[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('students').select('*');
    if (error) throw error;
    return data || [];
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    if (!isSupabaseConfigured) return { ...student, id: genId() };
    const { data, error } = await supabase!.from('students').insert([student]).select().single();
    if (error) throw error;
    return data;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    if (!isSupabaseConfigured) return { ...updates, id } as Student;
    const { data, error } = await supabase!.from('students').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteStudent(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('students').delete().eq('id', id);
    if (error) throw error;
  },

  async addStatusRecord(studentId: string, record: Omit<StudentStatusRecord, 'id'>): Promise<StudentStatusRecord> {
    if (!isSupabaseConfigured) return { ...record, id: genId() };
    const { data, error } = await supabase!.from('student_status_records').insert([{ ...record, student_id: studentId }]).select().single();
    if (error) throw error;
    return data;
  },

  async addRequest(studentId: string, request: Omit<StudentRequest, 'id'>): Promise<StudentRequest> {
    if (!isSupabaseConfigured) return { ...request, id: genId() };
    const { data, error } = await supabase!.from('student_requests').insert([{ ...request, student_id: studentId }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateWeaknesses(studentId: string, weaknesses: StudentWeakness[]): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('students').update({ weaknesses }).eq('id', studentId);
    if (error) throw error;
  }
};
