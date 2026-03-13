export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed';

export interface MilestoneReview {
  what_done: string;
  what_learned: string;
  what_improve: string;
  time_spent?: string;
  reviewed_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  order: number;
  due_date?: string;
  completed_at?: string;
  review?: MilestoneReview;
  created_at: string;
}

export type DevLogTag = 'thinking' | 'decision' | 'ai-chat' | 'reflection'
  | 'bug-fix' | 'feature' | 'architecture' | 'research';

export const DEV_LOG_TAGS: { key: DevLogTag; label: string; color: string }[] = [
  { key: 'thinking', label: '思考', color: 'bg-purple-100 text-purple-700' },
  { key: 'decision', label: '决策', color: 'bg-blue-100 text-blue-700' },
  { key: 'ai-chat', label: 'AI 对话', color: 'bg-cyan-100 text-cyan-700' },
  { key: 'reflection', label: '反思', color: 'bg-amber-100 text-amber-700' },
  { key: 'bug-fix', label: 'Bug 修复', color: 'bg-red-100 text-red-700' },
  { key: 'feature', label: '功能', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'architecture', label: '架构', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'research', label: '调研', color: 'bg-orange-100 text-orange-700' },
];

export interface DevLogEntry {
  id: string;
  project_id: string;
  milestone_id?: string;
  task_id?: string;
  title: string;
  content: string;
  tags: DevLogTag[];
  created_at: string;
  updated_at?: string;
}
