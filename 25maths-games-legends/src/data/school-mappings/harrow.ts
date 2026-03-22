/**
 * Harrow Haikou — CIE 0580 Year-by-Year KP Mapping
 *
 * This maps which KPs are taught in each year at Harrow Haikou.
 * Other schools can have their own mapping file.
 * The game uses this to filter which missions a student sees per grade.
 */

export interface SchoolMapping {
  id: string;
  name: { zh: string; en: string };
  board: string;         // 'cie'
  grades: GradeMapping[];
}

export interface GradeMapping {
  grade: number;         // 7, 8, 9, 10, 11
  name: { zh: string; en: string };
  topicIds: string[];    // Which syllabus topics are covered this year
}

export const HARROW_HAIKOU: SchoolMapping = {
  id: 'harrow-haikou',
  name: { zh: '哈罗海口', en: 'Harrow Haikou' },
  board: 'cie',
  grades: [
    {
      grade: 7,
      name: { zh: 'Year 7 — 基础奠基', en: 'Year 7 — Foundation' },
      topicIds: [
        // Number basics
        '1.1',   // Types of number (N, Z, Q, R, primes, squares, HCF/LCM)
        '1.3',   // Powers and roots
        '1.4',   // Fractions, decimals, percentages
        '1.5',   // Ordering
        '1.6',   // Four operations
        // Algebra intro
        '2.1',   // Introduction to algebra
        // Geometry intro
        '4.1',   // Geometrical terms
        '4.6',   // Angles (basic: on lines, in triangles)
        // Mensuration intro
        '5.1',   // Units of measure
        '5.2',   // Area and perimeter
        // Statistics intro
        '9.1',   // Classifying data
        '9.3',   // Mean, median, mode (basic)
      ]
    },
    {
      grade: 8,
      name: { zh: 'Year 8 — 能力拓展', en: 'Year 8 — Expansion' },
      topicIds: [
        // Number
        '1.2',   // Sets & Venn diagrams
        '1.7',   // Indices I
        '1.8',   // Standard form
        '1.11',  // Ratio and proportion
        '1.13',  // Percentages
        '1.15',  // Time
        '1.16',  // Money
        // Algebra
        '2.2',   // Algebraic manipulation (expand, factorise, collect terms)
        '2.5',   // Equations (linear only: kp-2.5-01 to 05)
        // Coordinate geometry
        '3.1',   // Coordinates
        '3.2',   // Drawing linear graphs
        '3.3',   // Gradient
        '3.5',   // y = mx + c
        // Geometry
        '4.2',   // Constructions
        '4.3',   // Scale drawings & bearings
        '4.5',   // Symmetry
        // Mensuration
        '5.3',   // Circles (circumference, area)
        '5.4',   // Surface area & volume (prisms, cylinders)
        // Statistics
        '9.2',   // Interpreting data
        '9.4',   // Charts & diagrams (bar, pie, stem-leaf)
        // Probability
        '8.1',   // Basic probability
      ]
    },
    {
      grade: 9,
      name: { zh: 'Year 9 — 策略深化', en: 'Year 9 — Deepening' },
      topicIds: [
        // Number
        '1.9',   // Estimation
        '1.12',  // Rates (speed, distance, time)
        // Algebra
        '2.4',   // Indices II
        '2.6',   // Inequalities
        '2.7',   // Sequences
        '2.9',   // Graphs in practical situations
        // Coordinate geometry
        '3.6',   // Parallel lines
        // Geometry
        '4.4',   // Similarity & congruence
        // Trigonometry
        '6.1',   // Pythagoras
        '6.2',   // Right-angled triangles (SOH CAH TOA)
        // Transformations
        '7.1',   // Transformations (translate, reflect, rotate, enlarge)
        '7.2',   // Vectors in 2D
        // Statistics
        '9.5',   // Scatter diagrams
        // Probability
        '8.2',   // Relative & expected frequencies
        '8.3',   // Combined events
        // Mensuration
        '5.5',   // Compound shapes
      ]
    },
    {
      grade: 10,
      name: { zh: 'Year 10 — 赤壁之战', en: 'Year 10 — Red Cliffs' },
      topicIds: [
        // Number (Extended)
        '1.10',  // Limits of accuracy
        '1.17',  // Exponential growth & decay
        // Algebra (Extended)
        '2.3',   // Algebraic fractions
        '2.5',   // Equations (quadratic, simultaneous: kp-2.5-06 to 13)
        '2.8',   // Proportion (direct & inverse)
        '2.10',  // Graphs of functions
        '2.11',  // Sketching curves
        // Coordinate geometry (Extended)
        '3.4',   // Length & midpoint
        '3.7',   // Perpendicular lines
        // Geometry (Extended)
        '4.7',   // Circle theorems
        // Trigonometry (Extended)
        '6.3',   // Exact trig values
        '6.5',   // Sine/cosine rule
        // Probability (Extended)
        '8.4',   // Conditional probability
        // Statistics (Extended)
        '9.6',   // Cumulative frequency
        '9.7',   // Histograms
      ]
    },
    {
      grade: 11,
      name: { zh: 'Year 11 — 北伐总攻', en: 'Year 11 — Final Campaign' },
      topicIds: [
        // Extended algebra
        '2.12',  // Differentiation
        '2.13',  // Functions (composite, inverse)
        // Extended number
        '1.18',  // Surds
        // Extended geometry
        '4.8',   // Constructions & loci
        // Extended trigonometry
        '6.4',   // Trigonometric functions (graphs)
        '6.6',   // 3D trigonometry
        // Extended vectors
        '7.3',   // Magnitude
        '7.4',   // Vector geometry
        // REVISION — all previous topics revisited
      ]
    },
  ]
};
