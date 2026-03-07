import { GoogleGenAI } from '@google/genai';
import { AISummary, Idea, WorkLog, SOP, SmartTaskPreview, TypicalExample, VocabularyItem } from '../types';

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
  prepMaterialTemplate?: string;
  unitTypicalExamples?: TypicalExample[];
  subUnits?: { title: string; objectives: string[] }[];
  completedObjectives: string[];
}

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

const stripJsonFences = (raw: string) => raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

const formatVocabulary = (items?: VocabularyItem[]) => {
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

const formatTypicalExamples = (examples?: TypicalExample[]) => {
  const cleaned = (examples || [])
    .filter(example => example.question.trim() || example.solution.trim())
    .map((example, index) => `Example ${index + 1}: Q: ${example.question.trim() || 'N/A'} | A: ${example.solution.trim() || 'N/A'}`);

  return cleaned.length > 0 ? cleaned.join('\n') : 'None provided.';
};

const formatUnitSubUnits = (subUnits?: UnitPlanningSubUnit[]) => {
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

const buildUnitContextBlock = (context: UnitPlanningContext) => `Context:
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

const buildObjectiveContextBlock = (context: ObjectivePrepContext) => `Context:
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
    const jsonStr = stripJsonFences(text);
    return JSON.parse(jsonStr) as AISummary;
  },

  async generateLessonPlan(context: LessonPlanContext): Promise<string> {
    const ai = getClient();

    const completedInfo = context.completedObjectives.length > 0
      ? `\nCompleted objectives so far: ${context.completedObjectives.join(', ')}`
      : '\nNo objectives completed yet in this unit.';

    const subUnitsInfo = context.subUnits?.length
      ? `\nSub-units:\n${context.subUnits.map(s => `- ${s.title}: ${s.objectives.join('; ')}`).join('\n')}`
      : '';
    const typicalExamplesInfo = context.unitTypicalExamples?.length
      ? `\nUnit Typical Examples:\n${formatTypicalExamples(context.unitTypicalExamples)}`
      : '\nNo unit-level typical examples provided.';
    const prepTemplateInfo = context.prepMaterialTemplate?.trim()
      ? `\nPrep Material Template:\n${context.prepMaterialTemplate.trim()}`
      : '\nNo prep material template provided.';

    const prompt = `You are a lesson planning assistant for a math teacher. Generate a detailed lesson plan in Markdown format.

Context:
- Subject: ${context.subject}
- Topic: ${context.topic}
- Class: ${context.className} (${context.yearGroup})
- Unit: ${context.unitTitle}
- Unit Objectives: ${context.unitObjectives.join('; ')}${subUnitsInfo}${completedInfo}${typicalExamplesInfo}${prepTemplateInfo}

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

  async generatePrepMaterialTemplate(context: UnitPlanningContext): Promise<string> {
    const ai = getClient();
    const prompt = `You are a secondary maths planning assistant.

Generate concise Markdown prep notes for this unit for the teacher's internal planning use.

Requirements:
- Use the same language as the context, or bilingual Chinese/English if the context is mixed.
- Keep it practical and compact.
- Do not write a full lesson plan.
- Use exactly these sections:
### Core Focus
### Modelling and Representations
### Misconceptions to Anticipate
### Practice and Resource Priorities
### Hinge Checks

In "Hinge Checks", include 2 or 3 short whole-class check questions or prompts.

${buildUnitContextBlock(context)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return (response.text ?? '').trim();
  },

  async generateUnitPromptTemplate(context: UnitPlanningContext): Promise<string> {
    const ai = getClient();
    const prompt = `You are a secondary maths planning assistant.

Generate a reusable AI prompt template for this unit. The output should help a teacher later request lesson plans, explanations, or worked examples.

Requirements:
- Return plain text only, no markdown fences.
- Do not generate the lesson plan itself.
- Start with: "Act as a rigorous secondary maths teacher."
- Then write 6-10 short bullet points describing the expected planning style, modelling approach, misconception focus, checking strategy, and formatting constraints.
- Keep it reusable for the whole unit rather than one single lesson.
- Use the same language as the context, or bilingual Chinese/English if the context is mixed.

${buildUnitContextBlock(context)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return (response.text ?? '').trim();
  },

  async generateUnitTypicalExamples(context: UnitPlanningContext): Promise<TypicalExample[]> {
    const ai = getClient();
    const prompt = `You are a secondary maths planning assistant preparing unit-level worked examples.

Return ONLY valid JSON array (no markdown fences) with 3 objects in this exact shape:
[
  {
    "question": "Example prompt in Markdown. Use LaTeX only when helpful.",
    "solution": "Concise worked solution in Markdown, showing the main teaching steps."
  }
]

Requirements:
- Use the same language as the context, or bilingual Chinese/English if the context is mixed.
- Cover the breadth of the unit, not just one sub-topic.
- Progress from foundational to standard to more demanding or transfer-style example.
- Keep the examples classroom-appropriate for the stated year group.

${buildUnitContextBlock(context)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = stripJsonFences(raw);
    return JSON.parse(jsonStr) as TypicalExample[];
  },

  async generateUnitTeachingSummary(context: UnitPlanningContext): Promise<string> {
    const ai = getClient();
    const prompt = `You are a secondary maths reflection assistant.

Generate a concise Markdown teaching summary for this unit based on available sub-unit coverage, examples, notes, and reflections.

Requirements:
- Use the same language as the context, or bilingual Chinese/English if the context is mixed.
- Be honest about missing evidence if reflections are sparse.
- Keep it concise and actionable.
- Use exactly these sections:
### Coverage Snapshot
### What Landed Well
### Gaps and Misconceptions
### Next Adjustments

${buildUnitContextBlock(context)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return (response.text ?? '').trim();
  },

  async generateObjectiveConceptExplanation(context: ObjectivePrepContext): Promise<string> {
    const ai = getClient();
    const prompt = `You are a math teaching assistant preparing one learning objective for classroom delivery.

Generate a concise Markdown explanation for the teacher to use directly in planning or board notes.

Requirements:
- Use the same language as the context, or bilingual Chinese/English if the context is mixed.
- Focus on explanation quality, not lesson timings.
- Keep it practical and compact.
- Do not add a title before the sections.
- Use exactly these sections:
### Core Idea
### Common Misconceptions
### Teaching Sequence
### Quick Check

In "Teaching Sequence", give 3-5 clear teacher moves or modelling steps.
In "Quick Check", give 2 short hinge-check questions or prompts.

${buildObjectiveContextBlock(context)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return (response.text ?? '').trim();
  },

  async generateObjectiveTypicalExamples(context: ObjectivePrepContext): Promise<TypicalExample[]> {
    const ai = getClient();
    const prompt = `You are a math teaching assistant preparing worked examples for one learning objective.

Return ONLY valid JSON array (no markdown fences) with 2 or 3 objects in this exact shape:
[
  {
    "question": "Example prompt in Markdown. Use LaTeX only when helpful.",
    "solution": "Concise worked solution in Markdown, showing the teacher's modelled steps."
  }
]

Requirements:
- Use the same language as the context, or bilingual Chinese/English if the context is mixed.
- Make the examples progressively harder: first direct modelling, then standard practice, then optional transfer/application.
- Keep questions classroom-appropriate for the stated year group.
- Solutions should be clear enough to project or write on the board.
- Avoid unnecessary prose outside the worked steps.

${buildObjectiveContextBlock(context)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = stripJsonFences(raw);
    return JSON.parse(jsonStr) as TypicalExample[];
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
    const jsonStr = stripJsonFences(raw);
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
    const jsonStr = stripJsonFences(raw);
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
    const jsonStr = stripJsonFences(raw);
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
    const jsonStr = stripJsonFences(raw);
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
    const jsonStr = stripJsonFences(raw);
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

  async processEmailDigest(emailContent: string): Promise<EmailDigestResult> {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a school email digest assistant for a teacher. Analyze the following English school email and produce a structured JSON summary in Chinese.

Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "subject": "邮件主题（中文）",
  "chinese_translation": "完整的中文翻译，保留原文结构和段落",
  "items": [
    { "content": "提取的要点（中文）", "type": "action" },
    { "content": "提取的备忘（中文）", "type": "memo" }
  ]
}

Rules:
- "subject": Extract or infer the email subject, translate to Chinese
- "chinese_translation": Full translation of the email into Chinese, preserving structure
- "items": Extract key points as structured items
  - type "action": items that require the teacher to DO something (deadlines, submissions, tasks, RSVPs)
  - type "memo": informational items to be aware of (announcements, policy changes, FYI)
- Keep each item concise (1-2 sentences)
- Order items by importance (actions first, then memos)

Email content:
${emailContent}`,
        }],
      }],
    });

    const raw = (response.text ?? '').trim();
    const jsonStr = stripJsonFences(raw);
    return JSON.parse(jsonStr) as EmailDigestResult;
  },

  async generateSubjectReport(input: SubjectReportInput): Promise<string> {
    const ai = getClient();

    const examBlock = input.examRecords.length > 0
      ? input.examRecords.map(e => `- ${e.exam_name} (${e.date}): ${e.score}/${e.total_score} (${Math.round(e.score / e.total_score * 100)}%)`).join('\n')
      : 'No exam records available.';

    const weaknessBlock = input.weaknesses.length > 0
      ? input.weaknesses.map(w => `- ${w.topic} [${w.level}]: ${w.notes}`).join('\n')
      : 'No weaknesses recorded.';

    const statusBlock = input.statusRecords.length > 0
      ? input.statusRecords.map(s => `- [${s.timestamp}] ${s.content}`).join('\n')
      : 'No status records.';

    const requestBlock = input.requests.length > 0
      ? input.requests.map(r => `- [${r.timestamp}] ${r.content}`).join('\n')
      : 'No requests recorded.';

    const prompt = `You are a bilingual (Chinese & English) subject report generator for a math teacher. Generate a professional subject report in Markdown format with both Chinese and English for each section heading.

Student: ${input.studentName}${input.chineseName ? ` (${input.chineseName})` : ''}
Year Group: ${input.yearGroup}
Class: ${input.className}

Exam Records:
${examBlock}

Weaknesses:
${weaknessBlock}

Status Records:
${statusBlock}

Student Requests:
${requestBlock}

Generate a report with these sections (use bilingual headings):

## 学科报告 / Subject Report
Student info header.

## 学业成绩总结 / Academic Performance Summary
Analyze exam scores, trends, and percentages.

## 知识薄弱环节 / Areas Requiring Attention
Based on recorded weaknesses, suggest focus areas.

## 学习状态综述 / Learning Attitude & Behaviour
Based on status records, summarize learning attitude and behaviour.

## 学生需求与跟进 / Student Requests & Follow-up
Summarize any requests and recommended follow-up.

## 教师建议 / Teacher Recommendations
Provide 3-5 actionable recommendations.

Keep it professional, concise, and bilingual (Chinese paragraph followed by English paragraph in each section). If data is missing for a section, note it gracefully.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text ?? '';
  },

  async generateParentMeetingNotes(input: ParentMeetingNotesInput): Promise<string> {
    const ai = getClient();

    const examBlock = input.examRecords.length > 0
      ? input.examRecords.map(e => `- ${e.exam_name} (${e.date}): ${e.score}/${e.total_score} (${Math.round(e.score / e.total_score * 100)}%)`).join('\n')
      : 'No exam records available.';

    const weaknessBlock = input.weaknesses.length > 0
      ? input.weaknesses.map(w => `- ${w.topic} [${w.level}]: ${w.notes}`).join('\n')
      : 'No weaknesses recorded.';

    const statusBlock = input.statusRecords.length > 0
      ? input.statusRecords.map(s => `- [${s.timestamp}] ${s.content}`).join('\n')
      : 'No status records.';

    const commBlock = input.parentCommunications.length > 0
      ? input.parentCommunications.map(c => `- [${c.timestamp}] (${c.type}) ${c.content}`).join('\n')
      : 'No previous parent communications.';

    const prompt = `You are a bilingual (Chinese & English) parent meeting preparation assistant for a math teacher. Generate meeting preparation notes in Markdown format with both Chinese and English for each section heading.

Student: ${input.studentName}${input.chineseName ? ` (${input.chineseName})` : ''}
Year Group: ${input.yearGroup}
Class: ${input.className}

Exam Records:
${examBlock}

Weaknesses:
${weaknessBlock}

Status Records:
${statusBlock}

Parent Communication History:
${commBlock}

Generate meeting prep notes with these sections (use bilingual headings):

## 家长会准备 / Parent Meeting Prep Notes
Student info and meeting context.

## 本次会面目标 / Meeting Objectives
2-3 clear objectives for this meeting.

## 学业亮点 / Academic Achievements
Highlight positive aspects from exam records and status.

## 关注事项 / Areas of Concern
Key concerns based on weaknesses and status records.

## 沟通要点 / Key Talking Points
Specific points to discuss with parents, with suggested phrasing.

## 历史沟通回顾 / Previous Communication Summary
Summary of past parent communications and outcomes.

## 建议家长行动 / Recommended Parent Actions
3-5 specific actions parents can take at home.

## 后续跟进计划 / Follow-up Plan
Timeline and next steps after the meeting.

Keep it professional, concise, and bilingual (Chinese paragraph followed by English paragraph in each section). If data is missing for a section, note it gracefully. Tone should be positive and constructive.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text ?? '';
  },
};
