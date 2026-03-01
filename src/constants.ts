import { TimetableEntry, Student, Idea, SOP, TeachingUnit, SchoolEvent } from './types';

export const MOCK_TIMETABLE: TimetableEntry[] = [
  // --- Daily Routines (Mon-Fri) ---
  ...[1, 2, 3, 4, 5].flatMap(day => [
    { id: `morning-${day}`, day, start_time: '05:20', end_time: '06:20', subject: 'Morning Routine', class_name: 'Home', room: '-', type: 'break' as const },
    { id: `commute-in-${day}`, day, start_time: '06:20', end_time: '07:35', subject: 'Commute to School', class_name: 'Bus', room: '-', type: 'break' as const },
    { id: `tutor-time-${day}`, day, start_time: '07:45', end_time: '08:20', subject: 'Tutor Time', class_name: 'Y9-Song', room: 'A219', type: 'tutor' as const },
    { id: `lunch-${day}`, day, start_time: '12:50', end_time: '13:35', subject: 'Lunch (USL)', class_name: '-', room: 'Canteen', type: 'break' as const },
    { id: `afternoon-tt-${day}`, day, start_time: '13:35', end_time: '13:50', subject: 'Afternoon TT', class_name: 'Y9-Song', room: 'A219', type: 'tutor' as const },
  ]),

  // --- Monday ---
  { id: 'm1', day: 1, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'm2', day: 1, start_time: '11:15', end_time: '12:00', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'm3', day: 1, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'm4', day: 1, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 'm5', day: 1, start_time: '14:40', end_time: '15:25', subject: 'Maths Dept Meeting', class_name: 'Staff', room: 'Meeting Room', type: 'meeting' as const },
  { id: 'm-staff', day: 1, start_time: '16:30', end_time: '17:20', subject: 'US Staff / Whole School Meeting', class_name: 'Staff', room: 'Auditorium', type: 'meeting' as const },
  { id: 'm6', day: 1, start_time: '17:20', end_time: '19:00', subject: 'Commute Home', class_name: 'Bus', room: '-', type: 'break' as const },

  // --- Tuesday ---
  { id: 't1', day: 2, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 't2', day: 2, start_time: '09:10', end_time: '09:55', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 't3', day: 2, start_time: '09:55', end_time: '10:20', subject: 'Duty (执勤)', class_name: 'Staff', room: 'Playground (操场)', type: 'duty' as const },
  { id: 't4', day: 2, start_time: '11:15', end_time: '12:00', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 't5', day: 2, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 't6', day: 2, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y12/Ma/A', room: 'A219', type: 'lesson' as const },
  { id: 't-tutor', day: 2, start_time: '14:40', end_time: '15:25', subject: 'Tutor Meeting', class_name: 'Staff', room: 'A219', type: 'meeting' as const },
  { id: 't7', day: 2, start_time: '16:20', end_time: '19:00', subject: 'Commute Home', class_name: 'Bus', room: '-', type: 'break' as const },

  // --- Wednesday ---
  { id: 'w1', day: 3, start_time: '10:25', end_time: '11:10', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 'w2', day: 3, start_time: '11:15', end_time: '12:00', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'w3', day: 3, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y12/Ma/A', room: 'A219', type: 'lesson' as const },
  { id: 'w4', day: 3, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'w5', day: 3, start_time: '14:40', end_time: '15:25', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'w6', day: 3, start_time: '16:20', end_time: '19:00', subject: 'Commute Home', class_name: 'Bus', room: '-', type: 'break' as const },

  // --- Thursday ---
  { id: 'th1', day: 4, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'th2', day: 4, start_time: '09:55', end_time: '10:20', subject: 'Duty (执勤)', class_name: 'Staff', room: 'Cafe (咖啡厅)', type: 'duty' as const },
  { id: 'th3', day: 4, start_time: '10:25', end_time: '11:10', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'th4', day: 4, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 'th5', day: 4, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'th-ea', day: 4, start_time: '15:25', end_time: '16:20', subject: 'Maths EA', class_name: 'Staff', room: 'A219', type: 'lesson' as const },
  { id: 'th6', day: 4, start_time: '16:20', end_time: '19:00', subject: 'Commute Home', class_name: 'Bus', room: '-', type: 'break' as const },

  // --- Friday ---
  { id: 'f1', day: 5, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'f2', day: 5, start_time: '09:10', end_time: '09:55', subject: 'Mathematics', class_name: 'Y12/Ma/A', room: 'A219', type: 'lesson' as const },
  { id: 'f3', day: 5, start_time: '10:25', end_time: '11:10', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'f4', day: 5, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'f5', day: 5, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 'f6', day: 5, start_time: '15:25', end_time: '16:20', subject: 'House/Team Challenge', class_name: 'Mixed', room: 'A327/A219', type: 'tutor' as const },
  { id: 'f7', day: 5, start_time: '16:20', end_time: '19:00', subject: 'Commute Home', class_name: 'Bus', room: '-', type: 'break' as const },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Zhang San',
    year_group: 'Y10',
    class_name: 'Y10/Ma/B',
    is_tutor_group: false,
    house_points: 12,
    notes: 'Strong in algebra, needs help with geometry.',
  },
  {
    id: 's2',
    name: 'Li Si',
    year_group: 'Y12',
    class_name: 'Y12/Ma/A',
    is_tutor_group: false,
    house_points: 8,
    notes: 'Very diligent, excellent calculus skills.',
  },
  {
    id: 's3',
    name: 'Wang Wu',
    year_group: 'Y9',
    class_name: 'Y9-Song',
    is_tutor_group: true,
    house_points: 15,
    notes: 'Tutor group student. Participates well in class discussions.',
  },
  {
    id: 's4',
    name: 'Chen Liu',
    year_group: 'Y8',
    class_name: 'Y8/Ma/C',
    is_tutor_group: false,
    house_points: 5,
    notes: 'Needs to focus more on homework completion.',
  },
];

export const MOCK_IDEAS: Idea[] = [
  {
    id: 'i1',
    title: 'Interactive Geometry Tool',
    content: 'A web app for students to visualize 3D shapes and their properties in real-time.',
    category: 'startup',
    priority: 'high',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'i2',
    title: 'AI Math Tutor Bot',
    content: 'LLM based assistant that helps students solve word problems step-by-step.',
    category: 'startup',
    priority: 'medium',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'i3',
    title: 'Curriculum Mapping Tool',
    content: 'Aligning IGCSE with local math standards for international schools in China.',
    category: 'work',
    priority: 'low',
    status: 'processed',
    created_at: new Date().toISOString(),
  },
];

export const MOCK_TEACHING_UNITS: TeachingUnit[] = [
  {
    id: 'u1',
    year_group: 'Y10',
    title: 'Quadratic Equations',
    teaching_plan: '1. Introduction to quadratics. 2. Factoring. 3. Completing the square. 4. Quadratic formula.',
    worksheet_url: 'https://drive.google.com/file/d/example-worksheet',
    homework_url: 'https://drive.google.com/file/d/example-homework',
    core_vocabulary: ['Parabola', 'Vertex', 'Discriminant', 'Roots', 'Coefficient'],
    typical_examples: [
      { question: 'Solve x^2 - 5x + 6 = 0', solution: '(x-2)(x-3)=0, so x=2 or x=3' },
      { question: 'Find the vertex of y = x^2 + 4x + 7', solution: 'x = -b/2a = -4/2 = -2. y = (-2)^2 + 4(-2) + 7 = 3. Vertex is (-2, 3)' }
    ],
    prep_material_template: 'Focus on the visual representation of the parabola. Use Desmos to show how changing coefficients affects the graph.',
    ai_prompt_template: 'Act as a bilingual math teacher. Create 5 challenging problems on quadratic equations for Year 10 students, including one real-world application involving projectile motion.'
  },
  {
    id: 'u2',
    year_group: 'Y12',
    title: 'Calculus: Differentiation',
    teaching_plan: '1. Limits. 2. First principles. 3. Power rule. 4. Product and quotient rules.',
    worksheet_url: 'https://drive.google.com/file/d/example-calc-ws',
    homework_url: 'https://drive.google.com/file/d/example-calc-hw',
    core_vocabulary: ['Derivative', 'Gradient', 'Tangent', 'Normal', 'Inflection Point'],
    typical_examples: [
      { question: 'Differentiate f(x) = 3x^4 - 2x^2 + 5', solution: "f'(x) = 12x^3 - 4x" },
      { question: 'Find the equation of the tangent to y=x^2 at x=3', solution: "dy/dx = 2x. At x=3, m=6. Point is (3,9). y-9 = 6(x-3) => y = 6x-9" }
    ],
    prep_material_template: 'Emphasize the concept of instantaneous rate of change. Use the water tank analogy.',
    ai_prompt_template: 'Explain the chain rule to a Year 12 student using a composite function example from physics, like displacement as a function of time.'
  }
];
export const MOCK_SCHOOL_EVENTS: SchoolEvent[] = [
  {
    id: 'e1',
    title: 'Whole School Assembly',
    date: '2026-03-02',
    category: 'school-wide',
    description: 'General announcements for the upcoming semester.',
    is_action_required: false
  },
  {
    id: 'e2',
    title: 'Parent-Teacher Consultations',
    date: '2026-03-05',
    category: 'personal',
    description: 'Direct meetings with parents of Y10 students.',
    is_action_required: true
  },
  {
    id: 'e3',
    title: 'House Sports Day',
    date: '2026-03-10',
    category: 'house',
    description: 'Inter-house swimming competition.',
    is_action_required: false
  },
  {
    id: 'e4',
    title: 'International Food Festival',
    date: '2026-03-15',
    category: 'event',
    description: 'Cultural celebration and food stalls.',
    is_action_required: false
  }
];

export const MOCK_SOPS: SOP[] = [
  {
    id: 'sop1',
    category: 'Communication',
    title: 'Parent-Teacher Meeting',
    content: '1. Review student grades. 2. Prepare specific examples of work. 3. Listen to parent concerns first.',
  },
  {
    id: 'sop2',
    category: 'Teaching',
    title: 'Exam Preparation',
    content: '1. Create mock exam based on syllabus. 2. Print copies. 3. Prepare marking scheme.',
  },
  {
    id: 'sop3',
    category: 'Tutor',
    title: 'Student Incident Report',
    content: '1. Calm the student. 2. Record facts. 3. Inform Head of House.',
  },
  {
    id: 'sop4',
    category: 'Emergency',
    title: '紧急情况处理 (Emergency Support)',
    content: 'USLT & HOY support: upperoncall@harrowhaikou.cn. Use if help is needed or students missing. Subject: "Missing *** from A219" or "Need support @A219C".',
  },
];
