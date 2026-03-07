import { TimetableEntry, Student, Idea, SOP, TeachingUnit, SchoolEvent, Goal, WorkLog, ClassProfile, LessonRecord, Project, KahootItem } from './types';
import { KAHOOT_SEED_ITEMS } from './constants-kahoot';
// Note: learning_objectives, lessons, core_vocabulary removed from TeachingUnit; completed_lesson_ids removed from ClassProfile

export const MOCK_PROJECTS: Project[] = [];

export const MOCK_KAHOOT_ITEMS: KahootItem[] = KAHOOT_SEED_ITEMS;

export const MOCK_LESSON_RECORDS: LessonRecord[] = [];

export const MOCK_WORK_LOGS: WorkLog[] = [
  {
    id: 'wl1',
    timestamp: '2026-03-01 09:15',
    content: '帮Leo Deng在企业微信申请补办ID卡',
    category: 'tutor',
    tags: ['ID Card', 'Tutor Affairs']
  },
  {
    id: 'wl2',
    timestamp: '2026-03-01 14:30',
    content: '与Y12/Ma/A讨论IA选题方向',
    category: 'teaching',
    tags: ['IA', 'Y12']
  }
];

export const MOCK_TIMETABLE: TimetableEntry[] = [
  // --- Daily Routines (Mon-Fri) ---
  ...[1, 2, 3, 4, 5].flatMap(day => {
    const entries: (TimetableEntry | null)[] = [
      { id: `morning-${day}`, day, start_time: '05:20', end_time: '06:20', subject: 'Morning Routine', class_name: 'Home', room: '-', type: 'break' as const },
      { id: `commute-in-${day}`, day, start_time: '06:20', end_time: '07:35', subject: 'School Bus', class_name: 'Inbound', room: '-', type: 'break' as const },
      day !== 1 ? { id: `tutor-time-${day}`, day, start_time: '07:45', end_time: '08:20', subject: 'Tutor Time', class_name: 'Y9-Song', room: 'A219', type: 'tutor' as const } : null,
      { id: `lunch-${day}`, day, start_time: '12:50', end_time: '13:35', subject: 'Lunch (USL)', class_name: '-', room: 'Canteen', type: 'break' as const },
      { id: `afternoon-tt-${day}`, day, start_time: '13:35', end_time: '13:50', subject: 'Afternoon TT', class_name: 'Y9-Song', room: 'A219', type: 'tutor' as const },
    ];
    return entries.filter((e): e is TimetableEntry => e !== null);
  }),

  // --- Monday ---
  { id: 'm-flag', day: 1, start_time: '07:35', end_time: '08:20', subject: 'Flag Raising', class_name: 'Y9-Song', room: 'A327', type: 'tutor' as const },
  { id: 'm1', day: 1, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y11/Ma/B', class_id: 'c4', unit_id: 'u-y11-1', room: 'A219', type: 'lesson' as const, topic: 'Quadratic Functions', is_prepared: true },
  { id: 'm2', day: 1, start_time: '11:15', end_time: '12:00', subject: 'Mathematics', class_name: 'Y7/Ma/B', class_id: 'c5', unit_id: 'u-y7-1', room: 'A219', type: 'lesson' as const, topic: 'Fractions', is_prepared: false },
  { id: 'm3', day: 1, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y10/Ma/B', class_id: 'c1', unit_id: 'u1', room: 'A219', type: 'lesson' as const, topic: 'Probability', is_prepared: true },
  { id: 'm4', day: 1, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y8/Ma/C', class_id: 'c3', unit_id: 'u-y8-1', room: 'A219', type: 'lesson' as const, topic: 'Algebraic Expressions', is_prepared: true },
  { id: 'm-dept', day: 1, start_time: '15:30', end_time: '16:20', subject: 'Math Department Meeting', class_name: 'Staff', room: 'A218', type: 'meeting' as const },
  { id: 'm-staff', day: 1, start_time: '16:30', end_time: '17:20', subject: 'US Staff / Whole School Meeting', class_name: 'Staff', room: 'Auditorium', type: 'meeting' as const },
  { id: 'm6', day: 1, start_time: '17:20', end_time: '19:00', subject: 'School Bus', class_name: 'Outbound', room: '-', type: 'break' as const },

  // --- Tuesday ---
  { id: 't1', day: 2, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y11/Ma/B', class_id: 'c4', unit_id: 'u-y11-1', room: 'A219', type: 'lesson' as const },
  { id: 't2', day: 2, start_time: '09:10', end_time: '09:55', subject: 'Mathematics', class_name: 'Y8/Ma/C', class_id: 'c3', unit_id: 'u-y8-1', room: 'A219', type: 'lesson' as const },
  { id: 't3', day: 2, start_time: '09:55', end_time: '10:20', subject: 'Duty (执勤)', class_name: 'Staff', room: 'Playground (操场)', type: 'duty' as const },
  { id: 't4', day: 2, start_time: '11:15', end_time: '12:00', subject: 'Mathematics', class_name: 'Y7/Ma/B', class_id: 'c5', unit_id: 'u-y7-1', room: 'A219', type: 'lesson' as const },
  { id: 't5', day: 2, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y10/Ma/B', class_id: 'c1', unit_id: 'u1', room: 'A219', type: 'lesson' as const },
  { id: 't6', day: 2, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y12/Ma/A', class_id: 'c2', unit_id: 'u-y12-1', room: 'A219', type: 'lesson' as const },
  { id: 't-tutor', day: 2, start_time: '14:40', end_time: '15:25', subject: 'Tutor Meeting', class_name: 'Staff', room: 'A219', type: 'meeting' as const },
  { id: 't7', day: 2, start_time: '16:20', end_time: '19:00', subject: 'School Bus', class_name: 'Outbound', room: '-', type: 'break' as const },

  // --- Wednesday ---
  { id: 'w1', day: 3, start_time: '10:25', end_time: '11:10', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 'w2', day: 3, start_time: '11:15', end_time: '12:00', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'w3', day: 3, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y12/Ma/A', room: 'A219', type: 'lesson' as const },
  { id: 'w4', day: 3, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'w5', day: 3, start_time: '14:40', end_time: '15:25', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'w6', day: 3, start_time: '16:20', end_time: '19:00', subject: 'School Bus', class_name: 'Outbound', room: '-', type: 'break' as const },

  // --- Thursday ---
  { id: 'th1', day: 4, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'th2', day: 4, start_time: '09:55', end_time: '10:20', subject: 'Duty (执勤)', class_name: 'Staff', room: 'Cafe (咖啡厅)', type: 'duty' as const },
  { id: 'th3', day: 4, start_time: '10:25', end_time: '11:10', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'th4', day: 4, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 'th5', day: 4, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'th-ea', day: 4, start_time: '15:25', end_time: '16:20', subject: 'Maths EA', class_name: 'Staff', room: 'A219', type: 'lesson' as const },
  { id: 'th6', day: 4, start_time: '16:20', end_time: '19:00', subject: 'School Bus', class_name: 'Outbound', room: '-', type: 'break' as const },

  // --- Friday ---
  { id: 'f1', day: 5, start_time: '08:20', end_time: '09:05', subject: 'Mathematics', class_name: 'Y10/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'f2', day: 5, start_time: '09:10', end_time: '09:55', subject: 'Mathematics', class_name: 'Y12/Ma/A', room: 'A219', type: 'lesson' as const },
  { id: 'f3', day: 5, start_time: '10:25', end_time: '11:10', subject: 'Mathematics', class_name: 'Y11/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'f4', day: 5, start_time: '12:05', end_time: '12:50', subject: 'Mathematics', class_name: 'Y7/Ma/B', room: 'A219', type: 'lesson' as const },
  { id: 'f5', day: 5, start_time: '13:50', end_time: '14:35', subject: 'Mathematics', class_name: 'Y8/Ma/C', room: 'A219', type: 'lesson' as const },
  { id: 'f6', day: 5, start_time: '15:25', end_time: '16:20', subject: 'House/Team Challenge', class_name: 'Mixed', room: 'A327/A219', type: 'tutor' as const },
  { id: 'f7', day: 5, start_time: '16:20', end_time: '19:00', subject: 'School Bus', class_name: 'Outbound', room: '-', type: 'break' as const },
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
    weaknesses: [
      { topic: 'Geometry', level: 'high', notes: 'Struggles with circle theorems.' },
      { topic: 'Trigonometry', level: 'medium', notes: 'Confuses sin and cos in non-right triangles.' }
    ],
    status_records: [
      { id: 'sr1', date: '2026-02-15', content: 'In the quiz on quadratic equations, Zhang San showed a clear understanding of factoring.', category: 'academic' },
      { id: 'sr2', date: '2026-02-20', content: 'Participated actively in the group discussion about parabolas.', category: 'report-material' }
    ],
    requests: [
      { id: 'req1', date: '2026-02-25', content: 'Requested extra practice problems for completing the square.', status: 'pending' }
    ]
  },
  {
    id: 's2',
    name: 'Li Si',
    year_group: 'Y12',
    class_name: 'Y12/Ma/A',
    is_tutor_group: false,
    house_points: 8,
    notes: 'Very diligent, excellent calculus skills.',
    weaknesses: [
      { topic: 'Integration', level: 'low', notes: 'Occasional errors with integration by parts.' }
    ],
    status_records: [
      { id: 'sr3', date: '2026-02-18', content: 'Li Si is consistently performing at a high level in differentiation.', category: 'academic' }
    ]
  },
  {
    id: 's3',
    name: 'Wang Wu',
    year_group: 'Y9',
    class_name: 'Y9-Song',
    is_tutor_group: true,
    house_points: 15,
    notes: 'Tutor group student. Participates well in class discussions.',
    weaknesses: [
      { topic: 'Fractions', level: 'medium', notes: 'Needs more practice with mixed numbers.' }
    ]
  },
  {
    id: 's4',
    name: 'Chen Liu',
    year_group: 'Y8',
    class_name: 'Y8/Ma/C',
    is_tutor_group: false,
    house_points: 5,
    notes: 'Needs to focus more on homework completion.',
    weaknesses: [
      { topic: 'Ratios', level: 'high', notes: 'Fundamental misunderstanding of proportional sharing.' }
    ]
  },
];

export const MOCK_CLASSES: ClassProfile[] = [
  {
    id: 'c1',
    name: 'Y10/Ma/B',
    year_group: 'Year 10',
    description: 'A motivated group of Year 10 students focusing on IGCSE Mathematics.',
    current_unit_id: 'u1',
    student_ids: ['s1']
  },
  {
    id: 'c2',
    name: 'Y12/Ma/A',
    year_group: 'Year 12',
    description: 'Advanced Year 12 class working on Pure Mathematics.',
    current_unit_id: 'u-y12-1',
    student_ids: ['s2']
  },
  {
    id: 'c3',
    name: 'Y8/Ma/C',
    year_group: 'Year 8',
    description: 'Year 8 Mathematics class.',
    current_unit_id: 'u-y8-1',
    student_ids: ['s4']
  },
  {
    id: 'c4',
    name: 'Y11/Ma/B',
    year_group: 'Year 11',
    description: 'Year 11 Mathematics class.',
    current_unit_id: 'u-y11-1',
    student_ids: []
  },
  {
    id: 'c5',
    name: 'Y7/Ma/B',
    year_group: 'Year 7',
    description: 'Year 7 Mathematics class.',
    current_unit_id: 'u-y7-1',
    student_ids: []
  }
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

export const SYLLABUS: Record<string, string[]> = {
  'Year 7': [
    'Unit 1: Multiplication of Fractions',
    'Unit 2: Position and Direction',
    'Unit 3: Division of Fraction',
    'Unit 4: Ratio',
    'Unit 5: Circle',
    'Unit 6: Percentage',
    'Unit 7: Pie Diagram',
    'Unit 8: Negative Number',
    'Unit 9: Percentage',
    'Unit 10: Cylinders and Cones',
    'Unit 11: Ratio and Proportion',
    'Unit 12: Linear Sequences',
    'Unit 13: Probability',
    'Unit 14: Constructions',
    'Unit 15: Review'
  ],
  'Year 8': [
    'Unit 1: Review of Numbers',
    'Unit 2: Rational Numbers, Factors and Primes',
    'Unit 3: Algebraic Formula',
    'Unit 4: Inequalties and Inequations',
    'Unit 5: Introduction to Pythagoras\' Theorem',
    'Unit 6: Intersecting Lines and Parallel Lines',
    'Unit 7: Further Algebra',
    'Unit 8: Co-ordinates and Plotting Linear Graphs',
    'Unit 9: Further Statistics'
  ],
  'Year 9': [
    'Unit 1: Working with Irrational Numbers',
    'Unit 2: Working with Expressions',
    'Unit 3: Algebraic Functions',
    'Unit 4: Mastery of Angles',
    'Unit 5: Practice with Constructions',
    'Unit 6: Congruence and Similarity',
    'Unit 7: Pythagoras Theorem',
    'Unit 8: 2D Shape',
    'Unit 9: Percentages',
    'Unit 10: Statistical Sampling',
    'Unit 11: Graphical Representation of Statistical Data',
    'Unit 12: Algebraic Fractions'
  ],
  'Year 10': [
    'Unit 1: Real Numbers',
    'Unit 2: Quadratic Equations',
    'Unit 3: Functions',
    'Unit 4: Further Trigonometry',
    'Unit 5: Circles',
    'Unit 6: Definitions and Theorems',
    'Unit 7: Transformations',
    'Unit 8: Probability',
    'Unit 9: 3D Geometry'
  ],
  'Year 11': [
    'Unit 1: Estimation & Bounds',
    'Unit 2: Set Notation & Venn Diagrams',
    'Unit 3: Simultaneous Equations',
    'Unit 4: Quadratic Sequences',
    'Unit 5: Differentiation',
    'Unit 6: Further Trigonometry',
    'Unit 7: Graphs of Trigonometric Functions',
    'Unit 8: Regions & Inequalities',
    'Unit 9: Vectors',
    'Unit 10: Functions'
  ],
  'Year 12': [
    'Pure 1 - 1. Algebraic Expressions',
    'Pure 1 - 2. Quadratics',
    'Pure 1 - 3. Equations and Inequalities',
    'Pure 1 - 4. Graphs and Transformations',
    'Pure 1 - 5. Straight Line Graphs',
    'Pure 1 - 6. Trigonometric Ratios',
    'Pure 1 - 7. Radians',
    'Pure 1 - 8. Differentiation',
    'Pure 1 - 9. Integration',
    'Pure 2 - 1. Algebraic Method',
    'Pure 2 - 2. Coordinate Geometry in the (x,y) plane',
    'Pure 2 - 3. Exponentials and Logarithms',
    'Pure 2 - 4. The Binomial Expansion',
    'Pure 2 - 5. Sequences and Series',
    'Pure 2 - 6. Trigonometric Identities and Equations',
    'Pure 2 - 7. Differentiation',
    'Pure 2 - 8. Integration'
  ]
};

export const MOCK_TEACHING_UNITS: TeachingUnit[] = [
  {
    id: 'u-y7-1',
    year_group: 'Year 7',
    title: 'Multiplication of Fractions',
    sub_units: [],
    typical_examples: [
      { question: 'Calculate 2/3 * 4/5', solution: 'Multiply numerators: 2*4=8. Multiply denominators: 3*5=15. Result: 8/15' },
      { question: 'Calculate 3 * 1/4', solution: '3 is 3/1. 3/1 * 1/4 = 3/4' }
    ],
    worksheet_url: 'https://drive.google.com/file/d/y7-u1-ws',
    homework_url: 'https://drive.google.com/file/d/y7-u1-hw',
    online_practice_url: 'https://www.ixl.com/math/grade-7/multiply-fractions',
    kahoot_url: 'https://create.kahoot.it/details/fraction-multiplication/123',
    vocab_practice_url: 'https://quizlet.com/888/fractions-vocab',
    prep_material_template: 'Use area models to demonstrate multiplication. Ensure students understand why the product of two proper fractions is smaller than both.',
    ai_prompt_template: 'Create a set of 10 word problems for Year 7 students involving multiplication of fractions in real-life contexts like cooking or measurements.',
    teaching_summary: 'Students found the area model very helpful. Next time, spend more time on simplifying the results.'
  },
  {
    id: 'u-y8-1',
    year_group: 'Year 8',
    title: 'Review of Numbers',
    sub_units: [],
    typical_examples: [{ question: 'Calculate 12 * 13', solution: '156' }],
    prep_material_template: 'Focus on common misconceptions in arithmetic.',
    ai_prompt_template: 'Generate a review quiz for Year 8 numbers.'
  },
  {
    id: 'u1',
    year_group: 'Year 10',
    title: 'Quadratic Equations',
    sub_units: [],
    typical_examples: [
      { question: 'Solve x^2 - 5x + 6 = 0', solution: '(x-2)(x-3)=0, so x=2 or x=3' },
      { question: 'Find the vertex of y = x^2 + 4x + 7', solution: 'x = -b/2a = -4/2 = -2. y = (-2)^2 + 4(-2) + 7 = 3. Vertex is (-2, 3)' }
    ],
    worksheet_url: 'https://drive.google.com/file/d/example-worksheet',
    homework_url: 'https://drive.google.com/file/d/example-homework',
    prep_material_template: 'Focus on the visual representation of the parabola. Use Desmos to show how changing coefficients affects the graph.',
    ai_prompt_template: 'Act as a bilingual math teacher. Create 5 challenging problems on quadratic equations for Year 10 students, including one real-world application involving projectile motion.'
  },
  {
    id: 'u-y11-1',
    year_group: 'Year 11',
    title: 'Estimation & Bounds',
    sub_units: [],
    typical_examples: [{ question: 'Find the bounds for 5.4 rounded to 1dp.', solution: 'LB: 5.35, UB: 5.45' }],
    prep_material_template: 'Use real-life measurement examples.',
    ai_prompt_template: 'Create a lesson on bounds for Year 11.'
  },
  {
    id: 'u-y12-1',
    year_group: 'Year 12',
    title: 'Pure 1 - 1. Algebraic Expressions',
    sub_units: [],
    typical_examples: [
      { question: 'Simplify (2x^2 y^3)^4', solution: '16x^8 y^12' },
      { question: 'Rationalise the denominator of 5 / (3 - √2)', solution: '5(3 + √2) / 7' }
    ],
    prep_material_template: 'Review IGCSE algebra basics. Ensure students are comfortable with basic index laws before introducing fractional indices.',
    ai_prompt_template: 'Create a worksheet with 10 progressively harder questions on rationalising denominators, including cases with a binomial denominator.'
  },
  {
    id: 'u-y12-2',
    year_group: 'Year 12',
    title: 'Pure 1 - 2. Quadratics',
    sub_units: [],
    typical_examples: [
      { question: 'Find the roots of x^2 + 5x + 6 = 0', solution: 'x = -2, x = -3' },
      { question: 'Find the range of values for k for which x^2 + kx + 9 = 0 has no real roots', solution: 'k^2 - 36 < 0 => -6 < k < 6' }
    ],
    prep_material_template: 'Use Desmos to demonstrate how changing the coefficients a, b, and c affects the shape and position of the parabola.',
    ai_prompt_template: 'Generate a quiz on using the discriminant to determine the nature of roots for quadratic equations.'
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

export const MOCK_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Launch 25maths MVP',
    category: 'startup',
    progress: 65,
    status: 'in-progress',
    deadline: '2026-06-01',
    image_url: 'https://picsum.photos/seed/startup/400/200'
  },
  {
    id: 'g2',
    title: 'Complete IGCSE Curriculum Map',
    category: 'work',
    progress: 40,
    status: 'in-progress',
    deadline: '2026-04-15',
    image_url: 'https://picsum.photos/seed/curriculum/400/200'
  },
  {
    id: 'g3',
    title: 'Travel to Iceland',
    category: 'dream',
    progress: 20,
    status: 'in-progress',
    deadline: '2027-01-01',
    image_url: 'https://picsum.photos/seed/iceland/400/200'
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
