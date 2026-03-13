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

export const DEV_LOG_TAGS: { key: DevLogTag; label: string; color: string; template?: string }[] = [
  { key: 'thinking', label: '思考', color: 'bg-purple-100 text-purple-700', template: '## 背景\n\n## 思考过程\n\n## 初步结论\n\n## 待验证\n' },
  { key: 'decision', label: '决策', color: 'bg-blue-100 text-blue-700', template: '## 背景\n\n## 选项\n- \n- \n\n## 决定\n\n## 理由\n' },
  { key: 'ai-chat', label: 'AI 对话', color: 'bg-cyan-100 text-cyan-700', template: '## Prompt\n\n## Response 摘要\n\n## Key Insight\n\n## 下一步\n' },
  { key: 'reflection', label: '反思', color: 'bg-amber-100 text-amber-700', template: '## 回顾\n\n## 做得好的\n\n## 可以改进的\n\n## 下次行动\n' },
  { key: 'bug-fix', label: 'Bug 修复', color: 'bg-red-100 text-red-700', template: '## 症状\n\n## 根因\n\n## 修复方案\n\n## 预防措施\n' },
  { key: 'feature', label: '功能', color: 'bg-emerald-100 text-emerald-700', template: '## 需求\n\n## 设计方案\n\n## 实现要点\n\n## 测试计划\n' },
  { key: 'architecture', label: '架构', color: 'bg-indigo-100 text-indigo-700', template: '## 现状\n\n## 问题\n\n## 目标架构\n\n## 迁移路径\n\n## 风险\n' },
  { key: 'research', label: '调研', color: 'bg-orange-100 text-orange-700', template: '## 调研目标\n\n## 发现\n\n## 对比分析\n\n## 建议\n' },
];

// Idea incubation status for DevLog entries
export type DevLogStatus = 'draft' | 'incubating' | 'actionable' | 'archived';

export const DEV_LOG_STATUSES: { key: DevLogStatus; label: string; color: string }[] = [
  { key: 'draft', label: '草稿', color: 'bg-slate-100 text-slate-600' },
  { key: 'incubating', label: '孵化中', color: 'bg-amber-100 text-amber-700' },
  { key: 'actionable', label: '可执行', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'archived', label: '归档', color: 'bg-slate-100 text-slate-400' },
];

// Thread: group related DevLogs into a narrative
export interface DevLogThread {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface DevLogEntry {
  id: string;
  project_id: string;
  milestone_id?: string;
  task_id?: string;
  thread_id?: string;
  title: string;
  content: string;
  tags: DevLogTag[];
  status: DevLogStatus;
  created_at: string;
  updated_at?: string;
}
