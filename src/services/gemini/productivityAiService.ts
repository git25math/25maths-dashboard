import { Idea, WorkLog, SOP } from '../../types';
import { getClient, stripJsonFences, CategorizationResult, ConsolidatedIdea, ConsolidatedWorkLog, ConsolidatedSOP } from './shared';

export const productivityAiService = {
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
};
