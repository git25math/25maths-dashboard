import { GoogleGenAI } from '@google/genai';
import { AISummary } from '../types';

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

export interface WeaknessInput {
  topic: string;
  level: 'low' | 'medium' | 'high';
  notes: string;
  studentYearGroup: string;
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
      model: 'gemini-2.0-flash',
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
      model: 'gemini-2.0-flash',
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
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text ?? '';
  },

  async suggestCategorization(text: string): Promise<CategorizationResult> {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
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
      model: 'gemini-2.0-flash',
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
};
