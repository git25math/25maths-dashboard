import { getClient, WeaknessInput, SubjectReportInput, ParentMeetingNotesInput } from './shared';

export const studentAiService = {
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
};
