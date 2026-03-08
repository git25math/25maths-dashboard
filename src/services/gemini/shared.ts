import { GoogleGenAI } from '@google/genai';
import { AISummary, Idea, WorkLog, SOP, SmartTaskPreview, TypicalExample, VocabularyItem } from '../../types';

export const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey });
};

export const stripJsonFences = (raw: string) => raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

export const formatVocabulary = (items?: VocabularyItem[]) => {
  const cleaned = (items || [])
    .filter(item => item.english.trim() || item.chinese.trim())
    .map(item => {
      const english = item.english.trim();
      const chinese = item.chinese.trim();
      if (english && chinese) return `${english} (${chinese})`;
      return english || chinese;
    });

  return cleaned.length > 0 ? cleaned.join('; ') : 'None provided.';
};

export const formatTypicalExamples = (examples?: TypicalExample[]) => {
  const cleaned = (examples || [])
    .filter(example => example.question.trim() || example.solution.trim())
    .map((example, index) => `Example ${index + 1}: Q: ${example.question.trim() || 'N/A'} | A: ${example.solution.trim() || 'N/A'}`);

  return cleaned.length > 0 ? cleaned.join('\n') : 'None provided.';
};

export interface UnitPlanningSubUnit {
  title: string;
  objectives: string[];
  reflectionNotes?: string[];
}

export interface UnitPlanningContext {
  yearGroup: string;
  unitTitle: string;
  prepMaterialTemplate?: string;
  aiPromptTemplate?: string;
  teachingSummary?: string;
  typicalExamples?: TypicalExample[];
  subUnits?: UnitPlanningSubUnit[];
  resourceTitles?: string[];
}

export interface ObjectivePrepContext {
  unitTitle?: string;
  yearGroup?: string;
  aiPromptTemplate?: string;
  subUnitTitle: string;
  objective: string;
  sharedVocabulary?: VocabularyItem[];
  objectiveVocabulary?: VocabularyItem[];
  classroomExercises?: string;
  homeworkContent?: string;
  aiSummary?: string;
  conceptExplanation?: string;
}

export const formatUnitSubUnits = (subUnits?: UnitPlanningSubUnit[]) => {
  const cleaned = (subUnits || []).map(subUnit => {
    const objectives = subUnit.objectives.length > 0 ? subUnit.objectives.join('; ') : 'No objectives listed.';
    const reflections = (subUnit.reflectionNotes || []).filter(Boolean);
    return [
      `- ${subUnit.title}`,
      `  Objectives: ${objectives}`,
      reflections.length > 0 ? `  Notes: ${reflections.join(' | ')}` : '',
    ].filter(Boolean).join('\n');
  });

  return cleaned.length > 0 ? cleaned.join('\n') : 'None provided.';
};

export const buildUnitContextBlock = (context: UnitPlanningContext) => `Context:
- Year Group: ${context.yearGroup}
- Unit: ${context.unitTitle}
- Prep Material Template: ${context.prepMaterialTemplate?.trim() || 'Not provided'}
- AI Prompt Template: ${context.aiPromptTemplate?.trim() || 'Not provided'}
- Existing Teaching Summary: ${context.teachingSummary?.trim() || 'Not provided'}
- Resource Titles: ${(context.resourceTitles || []).filter(Boolean).join('; ') || 'None provided'}

Sub-units:
${formatUnitSubUnits(context.subUnits)}

Unit Typical Examples:
${formatTypicalExamples(context.typicalExamples)}`;

export const buildObjectiveContextBlock = (context: ObjectivePrepContext) => `Context:
- Year Group: ${context.yearGroup || 'Not specified'}
- Unit: ${context.unitTitle || 'Not specified'}
- Sub-Unit: ${context.subUnitTitle}
- Learning Objective: ${context.objective}
- Objective Vocabulary: ${formatVocabulary(context.objectiveVocabulary)}
- Shared Vocabulary: ${formatVocabulary(context.sharedVocabulary)}
- Shared Classroom Exercises: ${context.classroomExercises?.trim() || 'Not provided'}
- Homework Context: ${context.homeworkContent?.trim() || 'Not provided'}
- Existing AI Summary: ${context.aiSummary?.trim() || 'Not provided'}
- Existing Concept Explanation: ${context.conceptExplanation?.trim() || 'Not provided'}
- Unit AI Prompt Template: ${context.aiPromptTemplate?.trim() || 'Not provided'}`;

export interface LessonPlanContext {
  aiPromptTemplate: string;
  subject: string;
  topic: string;
  className: string;
  yearGroup: string;
  unitTitle: string;
  unitObjectives: string[];
  prepMaterialTemplate?: string;
  unitTypicalExamples?: TypicalExample[];
  subUnits?: { title: string; objectives: string[] }[];
  completedObjectives: string[];
}

export interface CategorizationResult {
  ideaCategory: 'work' | 'student' | 'startup';
  ideaPriority: 'low' | 'medium' | 'high';
  workLogCategory: 'tutor' | 'teaching' | 'admin' | 'startup' | 'other';
  tags: string[];
}

export interface ConsolidatedIdea {
  title: string;
  content: string;
  category: Idea['category'];
  priority: Idea['priority'];
}

export interface ConsolidatedWorkLog {
  content: string;
  category: WorkLog['category'];
  tags: string[];
}

export interface ConsolidatedSOP {
  title: string;
  content: string;
  category: string;
}

export interface WeaknessInput {
  topic: string;
  level: 'low' | 'medium' | 'high';
  notes: string;
  studentYearGroup: string;
}

export interface SmartTasksInput {
  summary: AISummary;
  meetingTitle: string;
  meetingDate: string;
  meetingCategory: string;
  participants: string[];
}

export interface EmailDigestResult {
  subject: string;
  chinese_translation: string;
  items: { content: string; type: 'action' | 'memo' }[];
}

export interface SubjectReportInput {
  studentName: string;
  chineseName?: string;
  yearGroup: string;
  className: string;
  examRecords: { exam_name: string; date: string; score: number; total_score: number }[];
  weaknesses: { topic: string; level: string; notes: string }[];
  statusRecords: { content: string; timestamp: string }[];
  requests: { content: string; timestamp: string }[];
}

export interface ParentMeetingNotesInput {
  studentName: string;
  chineseName?: string;
  yearGroup: string;
  className: string;
  examRecords: { exam_name: string; date: string; score: number; total_score: number }[];
  weaknesses: { topic: string; level: string; notes: string }[];
  statusRecords: { content: string; timestamp: string }[];
  parentCommunications: { type: string; content: string; timestamp: string }[];
}

export interface ActionPlanInput {
  summary: AISummary;
  meetingTitle: string;
  meetingDate: string;
  meetingCategory: string;
  participants: string[];
  transcript?: string;
}

export type { AISummary, Idea, WorkLog, SOP, SmartTaskPreview, TypicalExample, VocabularyItem };
