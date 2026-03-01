export type Role = 'teacher' | 'tutor' | 'entrepreneur';

export interface Student {
  id: string;
  name: string;
  year_group: string;
  class_name: string;
  is_tutor_group: boolean;
  house_points: number;
  notes: string;
  weaknesses?: StudentWeakness[];
  attendance_status?: 'present' | 'absent' | 'late';
  status_records?: StudentStatusRecord[];
  requests?: StudentRequest[];
}

export interface StudentStatusRecord {
  id: string;
  date: string;
  content: string;
  category: 'academic' | 'behavior' | 'personal' | 'report-material';
}

export interface StudentRequest {
  id: string;
  date: string;
  content: string;
  status: 'pending' | 'resolved';
}

export interface StudentWeakness {
  topic: string;
  level: 'low' | 'medium' | 'high';
  notes: string;
}

export interface TimetableEntry {
  id: string;
  day: number; // 1-5
  start_time: string;
  end_time: string;
  subject: string;
  class_name: string;
  room: string;
  type: 'lesson' | 'tutor' | 'duty' | 'meeting' | 'break';
  topic?: string;
  is_prepared?: boolean;
}

export interface LessonRecord {
  id: string;
  date: string;
  class_name: string;
  topic: string;
  progress: string;
  homework_assigned: string;
  notes: string;
  next_lesson_plan: string;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  category: 'work' | 'student' | 'startup';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'processed';
  created_at: string;
}

export interface SOP {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  category: 'school-wide' | 'personal' | 'house' | 'event';
  description: string;
  is_action_required: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: 'dream' | 'work' | 'startup';
  progress: number;
  status: 'in-progress' | 'completed' | 'on-hold';
  deadline?: string;
  image_url?: string;
}

export interface TeachingUnit {
  id: string;
  year_group: string;
  title: string;
  learning_objectives: string[];
  lessons: LessonPlanItem[];
  typical_examples: { question: string; solution: string }[];
  worksheet_url?: string;
  homework_url?: string;
  online_practice_url?: string;
  kahoot_url?: string;
  vocab_practice_url?: string;
  core_vocabulary: string[];
  prep_material_template: string;
  ai_prompt_template: string;
  teaching_summary?: string;
}

export interface LessonPlanItem {
  id: string;
  title: string;
  objectives: string[];
  activities: string[];
  resources?: string[];
}

export interface ClassProfile {
  id: string;
  name: string;
  year_group: string;
  description: string;
  current_unit_id?: string;
  student_ids: string[];
}

export interface WorkLog {
  id: string;
  timestamp: string;
  content: string;
  category: 'tutor' | 'teaching' | 'admin' | 'startup' | 'other';
  tags?: string[];
}

export interface AppVersion {
  version: string;
  date: string;
  changes: string[];
}
