import { GoogleGenAI } from '@google/genai';
import { AISummary, Idea, WorkLog, SOP, SmartTaskPreview } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey });
};

export interface LessonPlanContext {
  aiPromptTemplate: string;
  subject: string;
  topic: string;
  className: string;
  yearGroup: string;
  unitTitle: string;
  unitObjectives: string[];
  subUnits?: { title: string; objectives: string[] }[];
  completedLessons: string[];
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

export interface ActionPlanInput {
  summary: AISummary;
  meetingTitle: string;
  meetingDate: string;
  meetingCategory: string;
  participants: string[];
  transcript?: string;
}

export const geminiService = {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const ai = getClient();
    const buffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: audioBlob.type || 'audio/webm',
                data: base64,
              },
            },
            {
              text: 'Please transcribe this audio recording accurately. The audio may contain both Chinese (Mandarin) and English. Preserve the original language as spoken — do not translate. Output only the transcript text, with no extra commentary.',
            },
          ],
        },
      ],
    });

    return response.text ?? '';
  },

  async generateMeetingSummary(transcript: string): Promise<AISummary> {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are a meeting minutes assistant. Analyze the following meeting transcript and produce a structured JSON summary. The transcript may be in Chinese, English, or a mix — respond in the same language(s) as the transcript.

Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "summary": "A concise 2-3 sentence overview of the meeting",
  "key_points": ["point 1", "point 2", ...],
  "action_items": [
    { "content": "task description", "assignee": "person or empty string", "deadline": "date or empty string", "status": "pending" }
  ],
  "decisions": ["decision 1", "decision 2", ...]
}

Transcript:
${transcript}`,
            },
          ],
        },
      ],
    });

    const text = (response.text ?? '').trim();
    // Strip markdown code fences if present
    const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as AISummary;
  },

  async generateLessonPlan(context: LessonPlanContext): Promise<string> {
    const ai = getClient();

    const completedInfo = context.completedLessons.length > 0
      ? `\nCompleted lessons so far: ${context.completedLessons.join(', ')}`
      : '\nNo lessons completed yet in this unit.';

    const subUnitsInfo = context.subUnits?.length
      ? `\nSub-units:\n${context.subUnits.map(s => `- ${s.title}: ${s.objectives.join('; ')}`).join('\n')}`
      : '';

    const prompt = `You are a lesson planning assistant for a math teacher. Generate a detailed lesson plan in Markdown format.

Context:
- Subject: ${context.subject}
- Topic: ${context.topic}
- Class: ${context.className} (${context.yearGroup})
- Unit: ${context.unitTitle}
- Unit Objectives: ${context.unitObjectives.join('; ')}${subUnitsInfo}${completedInfo}

Teacher's prompt template: ${context.aiPromptTemplate}

Generate a lesson plan with these sections:
### Starter (5 min)
### Main Activity (20 min)
### Practice (15 min)
### Plenary (5 min)
### Homework

Keep it concise and practical. Use bullet points. Include specific example questions where appropriate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text ?? '';
  },

  async suggestCategorization(text: string): Promise<CategorizationResult> {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a categorization assistant for a teacher's dashboard. Analyze the following note and suggest how to categorize it.

Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "ideaCategory": "work" | "student" | "startup",
  "ideaPriority": "low" | "medium" | "high",
  "workLogCategory": "tutor" | "teaching" | "admin" | "startup" | "other",
  "tags": ["tag1", "tag2"]
}

Categories:
- "work": teaching, classroom, school duties
- "student": individual student matters, parent communication
- "startup": business ideas, side projects, EdTech

Note:
${text}`,
        }],
      }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as CategorizationResult;
  },

  async recommendPractice(weakness: WeaknessInput): Promise<string> {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a math teaching assistant. A student in ${weakness.studentYearGroup} has the following weakness:

Topic: ${weakness.topic}
Severity: ${weakness.level}
Teacher notes: ${weakness.notes}

Provide a concise practice recommendation in Markdown with these sections:
### Diagnosis
### Practice Strategy
### Quick Win

Keep each section to 2-3 bullet points. Be specific and actionable.`,
        }],
      }],
    });

    return response.text ?? '';
  },

  async consolidateIdeas(ideas: Pick<Idea, 'title' | 'content' | 'category' | 'priority'>[]): Promise<ConsolidatedIdea> {
    const ai = getClient();

    const ideasText = ideas.map((idea, i) =>
      `[Idea ${i + 1}]\nTitle: ${idea.title}\nContent: ${idea.content}\nCategory: ${idea.category}\nPriority: ${idea.priority}`
    ).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a productivity assistant. The user has multiple scattered ideas that need to be consolidated into one structured note. Analyze the following ideas and merge them into a single, well-organized idea.

Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "title": "A concise title that captures the consolidated theme",
  "content": "Well-structured Markdown content that merges, deduplicates, and organizes all the ideas. Use headings, bullet points, etc. as appropriate.",
  "category": "work" | "student" | "startup",
  "priority": "low" | "medium" | "high"
}

Rules:
- The content should be in the same language as the original ideas (Chinese, English, or mixed)
- Merge overlapping points, remove redundancy
- Preserve all unique insights from each idea
- Pick the most appropriate single category and the highest priority among the inputs
- The content should be well-structured Markdown

Ideas to consolidate:
${ideasText}`,
        }],
      }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as ConsolidatedIdea;
  },

  async consolidateWorkLogs(logs: Pick<WorkLog, 'content' | 'category' | 'tags' | 'timestamp'>[]): Promise<ConsolidatedWorkLog> {
    const ai = getClient();

    const logsText = logs.map((log, i) =>
      `[Log ${i + 1}]\nTimestamp: ${log.timestamp}\nCategory: ${log.category}\nContent: ${log.content}\nTags: ${log.tags?.join(', ') || 'none'}`
    ).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a productivity assistant. The user has multiple work log entries that need to be consolidated into one comprehensive summary log. Analyze the following work logs and merge them.

Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "content": "Well-structured summary of all work done. Use Markdown formatting.",
  "category": "tutor" | "teaching" | "admin" | "startup" | "other",
  "tags": ["tag1", "tag2"]
}

Rules:
- The content should be in the same language as the original logs (Chinese, English, or mixed)
- Merge overlapping work items, remove redundancy
- Preserve all unique work details
- Pick the most representative category
- Combine all unique tags from the inputs

Work logs to consolidate:
${logsText}`,
        }],
      }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as ConsolidatedWorkLog;
  },

  async consolidateSOPs(sops: Pick<SOP, 'title' | 'content' | 'category'>[]): Promise<ConsolidatedSOP> {
    const ai = getClient();

    const sopsText = sops.map((sop, i) =>
      `[SOP ${i + 1}]\nTitle: ${sop.title}\nCategory: ${sop.category}\nContent: ${sop.content}`
    ).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a productivity assistant. The user has multiple Standard Operating Procedures (SOPs) that overlap or are related. Consolidate them into one comprehensive SOP.

Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "title": "A concise title for the consolidated SOP",
  "content": "Well-structured Markdown procedure that merges all steps. Use numbered lists and headings.",
  "category": "The most appropriate category"
}

Rules:
- The content should be in the same language as the original SOPs (Chinese, English, or mixed)
- Merge overlapping steps, remove redundancy
- Preserve all unique procedures and details
- Maintain logical step ordering
- The content should be well-structured Markdown with clear numbered steps

SOPs to consolidate:
${sopsText}`,
        }],
      }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as ConsolidatedSOP;
  },

  async generateSmartTasks(input: SmartTasksInput): Promise<SmartTaskPreview[]> {
    const ai = getClient();

    const contextBlock = `Meeting: ${input.meetingTitle}
Date: ${input.meetingDate}
Category: ${input.meetingCategory}
Participants: ${input.participants.join(', ') || 'Not specified'}

Summary: ${input.summary.summary}

Key Points:
${input.summary.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Action Items:
${input.summary.action_items.map((a, i) => `${i + 1}. ${a.content} (assignee: ${a.assignee || 'N/A'}, deadline: ${a.deadline || 'N/A'}, status: ${a.status})`).join('\n')}

Decisions:
${input.summary.decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a task extraction assistant. Analyze the following meeting data and extract structured tasks from ALL sections (summary, key points, action items, decisions). Not every item needs a task — only extract actionable ones.

For each task, determine:
- title: concise action-oriented title
- description: 1-2 sentences with meeting context
- priority: "high" (urgent/critical decisions), "medium" (standard follow-ups), "low" (nice-to-have)
- assignee: if mentioned in the meeting data, otherwise omit
- due_date: if a deadline is mentioned, in YYYY-MM-DD format, otherwise omit
- tags: relevant tags (e.g. "follow-up", "decision", "urgent", topic keywords)
- source_section: which section this came from ("action_item", "key_point", "decision", "summary")

Return ONLY valid JSON array (no markdown fences):
[
  { "title": "...", "description": "...", "priority": "high|medium|low", "assignee": "...", "due_date": "YYYY-MM-DD", "tags": ["..."], "source_section": "action_item|key_point|decision|summary" }
]

Meeting data:
${contextBlock}`,
        }],
      }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr) as SmartTaskPreview[];
  },

  async generateActionPlan(input: ActionPlanInput): Promise<string> {
    const ai = getClient();

    const contextBlock = `Meeting: ${input.meetingTitle}
Date: ${input.meetingDate}
Category: ${input.meetingCategory}
Participants: ${input.participants.join(', ') || 'Not specified'}

Summary: ${input.summary.summary}

Key Points:
${input.summary.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Action Items:
${input.summary.action_items.map((a, i) => `${i + 1}. ${a.content} (assignee: ${a.assignee || 'N/A'}, deadline: ${a.deadline || 'N/A'})`).join('\n')}

Decisions:
${input.summary.decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a meeting action plan generator. Based on the following meeting data, generate a comprehensive action plan document in Markdown format. Use the same language as the meeting content (Chinese, English, or mixed).

Structure the document with these sections:

## Meeting Overview
Brief overview with date, participants, and purpose.

## Key Decisions
Numbered list of important decisions made.

## Action Plan
A Markdown table with columns: # | Task | Assignee | Priority | Deadline | Status

## Timeline
Key milestones and deadlines organized chronologically.

## Risks & Follow-ups
Potential risks and items that need follow-up attention.

Keep it concise, professional, and actionable.

Meeting data:
${contextBlock}`,
        }],
      }],
    });

    return response.text ?? '';
  },
};
