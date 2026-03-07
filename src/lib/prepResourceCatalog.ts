import { PrepResource } from '../types';

export const PREP_RESOURCE_KIND_OPTIONS: Array<{ value: NonNullable<PrepResource['kind']>; label: string }> = [
  { value: 'link', label: 'General Link' },
  { value: 'worksheet', label: 'Worksheet' },
  { value: 'practice', label: 'Practice' },
  { value: 'kahoot', label: 'Kahoot / Quiz' },
  { value: 'homework', label: 'Homework' },
  { value: 'vocab', label: 'Vocabulary' },
  { value: 'slides', label: 'Slides / Presentation' },
  { value: 'video', label: 'Video Lesson' },
  { value: 'textbook', label: 'Textbook / Reading' },
  { value: 'assessment', label: 'Assessment / Exit Ticket' },
  { value: 'answers', label: 'Answer Key / Mark Scheme' },
  { value: 'simulation', label: 'GeoGebra / Desmos / Simulation' },
  { value: 'past_paper', label: 'Past Paper / Exam Practice' },
  { value: 'manipulative', label: 'Manipulative / Printable' },
  { value: 'other', label: 'Other' },
];

export const RESOURCE_TEMPLATE_KINDS: Array<NonNullable<PrepResource['kind']>> = [
  'worksheet',
  'practice',
  'slides',
  'video',
  'assessment',
  'answers',
  'simulation',
  'textbook',
  'past_paper',
  'manipulative',
];

const RESOURCE_TEMPLATES: Record<NonNullable<PrepResource['kind']>, Pick<PrepResource, 'title' | 'kind' | 'note'>> = {
  link: {
    title: 'General Teaching Link',
    kind: 'link',
    note: 'Use this for any supporting webpage, shared folder, or mixed resource collection.',
  },
  worksheet: {
    title: 'Worksheet',
    kind: 'worksheet',
    note: 'Printable or digital worksheet for guided and independent practice.',
  },
  practice: {
    title: 'Online Practice',
    kind: 'practice',
    note: 'Self-paced online practice for fluency or retrieval.',
  },
  kahoot: {
    title: 'Kahoot / Quiz',
    kind: 'kahoot',
    note: 'Quick retrieval, hinge-check, or plenary quiz.',
  },
  homework: {
    title: 'Homework',
    kind: 'homework',
    note: 'Independent follow-up practice for after class.',
  },
  vocab: {
    title: 'Vocabulary Practice',
    kind: 'vocab',
    note: 'Bilingual term rehearsal or retrieval prompt.',
  },
  slides: {
    title: 'Slides / Presentation',
    kind: 'slides',
    note: 'Teaching deck, board sequence, or modelling slides.',
  },
  video: {
    title: 'Video Lesson',
    kind: 'video',
    note: 'Short explainer, worked-example clip, or flipped-learning video.',
  },
  textbook: {
    title: 'Textbook / Reading',
    kind: 'textbook',
    note: 'Reference chapter, reading extract, or example set.',
  },
  assessment: {
    title: 'Assessment / Exit Ticket',
    kind: 'assessment',
    note: 'Mini-check, quiz, or exit ticket for this content.',
  },
  answers: {
    title: 'Answer Key / Mark Scheme',
    kind: 'answers',
    note: 'Answers, worked solutions, or mark scheme for teacher checking.',
  },
  simulation: {
    title: 'GeoGebra / Desmos / Simulation',
    kind: 'simulation',
    note: 'Dynamic visualisation, graphing tool, or digital manipulative.',
  },
  past_paper: {
    title: 'Past Paper / Exam Practice',
    kind: 'past_paper',
    note: 'Exam-style questions, past paper extract, or mastery challenge.',
  },
  manipulative: {
    title: 'Manipulative / Printable',
    kind: 'manipulative',
    note: 'Card sort, cut-out, template, or hands-on printable aid.',
  },
  other: {
    title: 'Additional Resource',
    kind: 'other',
    note: 'Any other useful support material for this topic.',
  },
};

export function emptyPrepResource(kind: NonNullable<PrepResource['kind']> = 'link'): PrepResource {
  const template = RESOURCE_TEMPLATES[kind] || RESOURCE_TEMPLATES.link;
  return {
    title: template.title,
    url: '',
    kind: template.kind,
    note: template.note,
  };
}

export function isPrepResourceFilled(resource: PrepResource) {
  return !!(resource.title.trim() || resource.url.trim() || (resource.note || '').trim());
}

export function dedupePrepResources(resources: PrepResource[]) {
  const seen = new Set<string>();
  return resources.filter(resource => {
    if (!isPrepResourceFilled(resource)) return false;
    const key = [
      resource.kind || '',
      resource.title.trim().toLowerCase(),
      resource.url.trim().toLowerCase(),
      (resource.note || '').trim().toLowerCase(),
    ].join('::');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
