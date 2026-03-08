import { TypicalExample } from '../../types';
import {
  getClient,
  stripJsonFences,
  formatTypicalExamples,
  buildUnitContextBlock,
  buildObjectiveContextBlock,
  LessonPlanContext,
  UnitPlanningContext,
  ObjectivePrepContext,
} from './shared';

export const teachingAiService = {
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
};
