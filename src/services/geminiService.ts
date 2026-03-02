import { GoogleGenAI } from '@google/genai';
import { AISummary } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not configured');
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const ai = getClient();
    const buffer = await audioBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

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
};
