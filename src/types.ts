export type Role = 'teacher' | 'tutor' | 'entrepreneur';

// --- PrepStatus (4-state) ---
export type PrepStatus = 'not_prepared' | 'prepared' | 'finished' | 'recorded';

// --- GTD Task types ---
export type TaskStatus = 'inbox' | 'next' | 'waiting' | 'someday' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskSource = 'meeting' | 'calendar' | 'manual' | 'idea' | 'parent-comm' | 'email-digest';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  source_type?: TaskSource;
  source_id?: string;
  assignee?: string;
  due_date?: string;
  tags?: string[];
  created_at: string;
  completed_at?: string;
}

export interface Student {
  id: string;
  name: string;
  chinese_name?: string;
  year_group: string;
  class_name: string;
  tutor_group?: string;
  house?: string;
  tutor_1?: string;
  tutor_2?: string;
  parent_email?: string;
  dfm_username?: string;
  dfm_password?: string;
  is_tutor_group: boolean;
  house_points: number;
  notes: string;
  weaknesses?: StudentWeakness[];
  exam_records?: ExamRecord[];
  attendance_status?: 'present' | 'absent' | 'late';
  status_records?: StudentStatusRecord[];
  requests?: StudentRequest[];
  parent_communications?: ParentCommunication[];
}

export interface ExamRecord {
  id: string;
  exam_name: string;
  date: string;
  score: number;
  total_score: number;
  weaknesses: string;
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
  resolved_date?: string;
}

export type ParentCommMethod = 'face-to-face' | 'phone' | 'wechat' | 'email' | 'other';

export interface ParentCommFollowUp {
  date: string;
  content: string;
}

export interface ParentCommunication {
  id: string;
  date: string;
  method: ParentCommMethod;
  content: string;
  status: 'pending' | 'resolved';
  resolved_date?: string;
  needs_follow_up: boolean;
  follow_up_plan?: string;
  follow_up_task_id?: string;
  follow_ups?: ParentCommFollowUp[];
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
  class_id?: string; // Link to ClassProfile
  room: string;
  type: 'lesson' | 'tutor' | 'duty' | 'meeting' | 'break';
  topic?: string;
  notes?: string;
  is_prepared?: boolean; // @deprecated — use prep_status instead
  prep_status?: PrepStatus;
  unit_id?: string; // Link to TeachingUnit
  lesson_id?: string; // Link to specific LessonPlanItem
  date?: string; // ISO 'YYYY-MM-DD'. If set, date-specific (non-recurring). If absent, recurring weekly.
  recurring_id?: string; // If this is a single-day override, points to the original recurring entry's id
  meeting_record_id?: string; // Link to MeetingRecord for meeting-type entries
}

export interface HousePointAward {
  student_id: string;
  student_name: string;
  points: number;
  reason: string;
}

export interface HPAwardLog {
  id: string;
  date: string;
  student_id: string;
  student_name: string;
  class_name: string;
  points: number;
  reason: string;
  source: 'batch' | 'lesson';
  source_id?: string;
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
  timetable_entry_id?: string; // Back-reference to linked timetable entry
  house_point_awards?: HousePointAward[];
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  category: 'work' | 'student' | 'startup';
  priority: 'low' | 'medium' | 'high';
  status: 'note' | 'pending' | 'processed';
  show_on_dashboard?: boolean;
  created_at: string;
}

export interface SOP {
  id: string;
  category: string;
  title: string;
  content: string;
}

export type EventTimeMode = 'all-day' | 'multi-day' | 'timed' | 'multi-day-timed';

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  time_mode?: EventTimeMode;
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

export interface VocabularyItem {
  english: string;
  chinese: string;
}

export interface TeachingReflection {
  lesson_date?: string;
  student_reception?: string;
  planned_content?: string;
  actual_content?: string;
  improvements?: string;
}

export interface LearningObjective {
  id: string;
  objective: string;
  status: 'not_started' | 'in_progress' | 'completed';
  periods: number;
  notes?: string;
  covered_lesson_dates?: string[];  // ISO dates of lessons that covered this LO
}

export interface SubUnit {
  id: string;
  title: string;
  learning_objectives: LearningObjective[];
  periods: number;
  vocabulary: VocabularyItem[];
  classroom_exercises: string;
  worksheet_url?: string;
  online_practice_url?: string;
  kahoot_url?: string;
  homework_url?: string;
  vocab_practice_url?: string;
  homework_content?: string;
  reflection?: TeachingReflection;
  ai_summary?: string;
}

export interface TeachingUnit {
  id: string;
  year_group: string;
  title: string;
  sub_units: SubUnit[];
  typical_examples: { question: string; solution: string }[];
  worksheet_url?: string;
  homework_url?: string;
  online_practice_url?: string;
  kahoot_url?: string;
  vocab_practice_url?: string;
  prep_material_template: string;
  ai_prompt_template: string;
  teaching_summary?: string;
}

/** @deprecated Retained only for TimetableEntry.lesson_id back-compat. */
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

export interface ActionItem {
  content: string;
  assignee: string;
  deadline: string;
  status: 'pending' | 'done';
}

export interface AISummary {
  summary: string;
  key_points: string[];
  action_items: ActionItem[];
  decisions: string[];
}

export interface SmartTaskPreview {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  due_date?: string;
  tags: string[];
  source_section: 'action_item' | 'key_point' | 'decision' | 'summary';
}

export interface EmailDigestItem {
  id: string;
  content: string;
  type: 'action' | 'memo';
  checked: boolean;
  task_id?: string;
}

export interface EmailDigest {
  id: string;
  subject: string;
  original_content: string;
  chinese_translation: string;
  items: EmailDigestItem[];
  created_at: string;
}

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  duration: number;
  transcript: string;
  ai_summary: AISummary | null;
  category: 'flag-raising' | 'ws-staff' | 'us-staff' | 'tutor' | 'department' | 'sptc' | 'assembly' | 'parent' | 'other';
  participants: string[];
  status: 'draft' | 'transcribing' | 'summarizing' | 'completed';
  created_at: string;
}
