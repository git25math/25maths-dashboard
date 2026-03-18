import { AISummary, SmartTaskPreview } from '../../types';
import { getClient, safeJsonParse, SmartTasksInput, EmailDigestResult, ActionPlanInput } from './shared';

export const meetingAiService = {
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

    return safeJsonParse<AISummary>(response.text ?? '', 'meeting summary');
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

    return safeJsonParse<SmartTaskPreview[]>(response.text ?? '', 'smart tasks');
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

    return safeJsonParse<EmailDigestResult>(response.text ?? '', 'email digest');
  },
};
