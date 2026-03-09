import { getClient, stripJsonFences } from './shared';

export const paperAiService = {
  async generateQuestionVariants(input: {
    tex: string;
    marks: number;
    topic: string;
    section: string;
    difficulty: number;
    count: number;
  }): Promise<{ tex: string; marks: number }[]> {
    const ai = getClient();
    const prompt = `You are a mathematics exam question writer for IGCSE level (CIE 0580 / Edexcel 4MA1).

Given the following original exam question, generate ${input.count} variant(s) that:
1. Keep the same mathematical structure, difficulty level (${input.difficulty}/3), and marks (${input.marks})
2. Change numerical values, variable names, or real-world context
3. Use valid LaTeX math notation (inline $...$ or display $$...$$)
4. Each variant must be self-contained and complete

Original question (${input.marks} marks, topic: ${input.topic}, section: ${input.section}):
${input.tex}

Return a JSON array of objects with "tex" (string, the question text with LaTeX) and "marks" (number).
Return ONLY the JSON array, no markdown fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = stripJsonFences(response.text ?? '[]');
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('[paperAiService] Variants response is not an array:', raw.slice(0, 200));
        return [];
      }
      // Validate each variant has required fields
      return parsed.filter(
        (v: unknown): v is { tex: string; marks: number } =>
          typeof v === 'object' && v !== null &&
          typeof (v as Record<string, unknown>).tex === 'string' &&
          typeof (v as Record<string, unknown>).marks === 'number',
      );
    } catch (err) {
      console.warn('[paperAiService] Failed to parse variants response:', err, raw.slice(0, 200));
      return [];
    }
  },

  async suggestCoverScheme(
    template: string,
    topic: string,
    board: string,
  ): Promise<{ name: string; params: Record<string, string> }[]> {
    const ai = getClient();
    const prompt = `You are a graphic designer creating educational resource covers for 25MATHS (${board}).

Suggest 4 harmonious color schemes for a "${template}" cover about "${topic}".
Each scheme should have:
- name: A descriptive name (e.g., "Ocean Breeze", "Sunset Warmth")
- primaryGradientStart: hex color for gradient start
- primaryGradientEnd: hex color for gradient end
- accentColor: hex color for accent elements
- textColor: hex color for main text (must be readable)

Requirements:
- Professional and clean aesthetic
- Good contrast for readability
- Suitable for educational materials
- Each scheme should be distinctly different

Return a JSON array of objects with "name" and "params" (containing the 4 color keys above).
Return ONLY the JSON array, no markdown fences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const raw = stripJsonFences(response.text ?? '[]');
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('[paperAiService] Cover scheme response is not an array:', raw.slice(0, 200));
        return [];
      }
      // Validate each scheme has required fields
      return parsed.filter(
        (s: unknown): s is { name: string; params: Record<string, string> } =>
          typeof s === 'object' && s !== null &&
          typeof (s as Record<string, unknown>).name === 'string' &&
          typeof (s as Record<string, unknown>).params === 'object',
      );
    } catch (err) {
      console.warn('[paperAiService] Failed to parse cover scheme response:', err, raw.slice(0, 200));
      return [];
    }
  },
};
