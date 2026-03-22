import type { Mission, BilingualText } from '../types';

/* ── Shared helpers ── */

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ── Generator type registry ── */

export type GeneratorType =
  | 'SIMPLE_EQ_RANDOM'
  | 'SIMPLE_EQ_ADD_RANDOM'
  | 'INDICES_RANDOM'
  | 'ANGLES_RANDOM'
  | 'ARITHMETIC_RANDOM'
  | 'AREA_RECT_RANDOM'
  | 'AREA_TRAP_RANDOM'
  | 'PROBABILITY_SIMPLE_RANDOM'
  | 'PROBABILITY_IND_RANDOM'
  | 'PYTHAGORAS_RANDOM'
  | 'PERCENTAGE_RANDOM'
  | 'LINEAR_RANDOM'
  | 'SIMULTANEOUS_RANDOM'
  | 'RATIO_RANDOM'
  | 'SIMILARITY_RANDOM'
  | 'STATISTICS_MEAN_RANDOM'
  | 'TRIGONOMETRY_RANDOM'
  | 'QUADRATIC_RANDOM'
  | 'ROOTS_RANDOM'
  | 'DERIVATIVE_RANDOM'
  | 'INTEGRATION_RANDOM'
  | 'VOLUME_RANDOM'
  | 'FUNC_VAL_RANDOM'
  | 'STATISTICS_MEDIAN_RANDOM'
  | 'HCF_RANDOM'
  | 'LCM_RANDOM'
  | 'INTEGER_ADD_RANDOM'
  | 'FRAC_ADD_RANDOM'
  | 'FRAC_MUL_RANDOM'
  | 'FACTOR_TREE_RANDOM'
  | 'PRIME_RANDOM'
  | 'SQUARE_CUBE_RANDOM'
  | 'SQUARE_ROOT_RANDOM'
  | 'SUBSTITUTION_RANDOM'
  | 'PERIMETER_RECT_RANDOM'
  | 'PERCENTAGE_OF_RANDOM'
  | 'ESTIMATION_ROUND_RANDOM'
  | 'ANGLES_TRIANGLE_RANDOM'
  | 'ANGLES_POINT_RANDOM'
  | 'SEQUENCE_Y7_RANDOM'
  | 'STATISTICS_RANGE_RANDOM'
  | 'AREA_TRIANGLE_RANDOM'
  | 'FACTORS_LIST_RANDOM'
  | 'INTEGER_MUL_RANDOM'
  | 'FDP_CONVERT_RANDOM'
  | 'BODMAS_RANDOM'
  | 'SIMPLIFY_RANDOM'
  | 'STATISTICS_MODE_RANDOM'
  | 'SIMPLE_EQ_TWOSTEP_RANDOM'
  | 'COORDINATES_RANDOM'
  | 'RATIO_Y7_RANDOM'
  | 'MIXED_IMPROPER_RANDOM'
  | 'EXPAND_RANDOM'
  | 'FACTORISE_RANDOM'
  | 'INEQUALITY_RANDOM'
  | 'STD_FORM_RANDOM'
  | 'SPEED_RANDOM'
  | 'CIRCLE_Y8_RANDOM'
  | 'VOLUME_Y8_RANDOM'
  | 'PERCENTAGE_INTEREST_RANDOM'
  | 'PARALLEL_ANGLES_RANDOM'
  | 'SYMMETRY_RANDOM'
  | 'SIMULTANEOUS_Y8_RANDOM'
  | 'RATIO_Y8_RANDOM';

/** Adaptive difficulty tier: 1=easy, 2=medium(default), 3=hard */
export type DifficultyTier = 1 | 2 | 3;

// Module-level tier for generators to read (set before each generation call)
let _currentTier: DifficultyTier = 2;

const GENERATOR_MAP: Record<GeneratorType, (t: Mission) => Mission> = {
  SIMPLE_EQ_RANDOM: generateSimpleEqMission,
  SIMPLE_EQ_ADD_RANDOM: generateAddEqMission,
  INDICES_RANDOM: generateIndicesMission,
  ANGLES_RANDOM: generateAnglesMission,
  ARITHMETIC_RANDOM: generateArithmeticMission,
  AREA_RECT_RANDOM: generateAreaRectMission,
  AREA_TRAP_RANDOM: generateAreaTrapMission,
  PROBABILITY_SIMPLE_RANDOM: generateProbSimpleMission,
  PROBABILITY_IND_RANDOM: generateProbIndMission,
  PYTHAGORAS_RANDOM: generatePythagorasMission,
  PERCENTAGE_RANDOM: generatePercentageMission,
  LINEAR_RANDOM: generateLinearMission,
  SIMULTANEOUS_RANDOM: generateSimultaneousMission,
  RATIO_RANDOM: generateRatioMission,
  SIMILARITY_RANDOM: generateSimilarityMission,
  STATISTICS_MEAN_RANDOM: generateStatsMeanMission,
  TRIGONOMETRY_RANDOM: generateTrigonometryMission,
  QUADRATIC_RANDOM: generateQuadraticMission,
  ROOTS_RANDOM: generateRootsMission,
  DERIVATIVE_RANDOM: generateDerivativeMission,
  INTEGRATION_RANDOM: generateIntegrationMission,
  VOLUME_RANDOM: generateVolumeMission,
  FUNC_VAL_RANDOM: generateFuncValMission,
  STATISTICS_MEDIAN_RANDOM: generateStatsMedianMission,
  FACTOR_TREE_RANDOM: generateFactorTreeMission,
  PRIME_RANDOM: generatePrimeMission,
  HCF_RANDOM: generateHcfMission,
  LCM_RANDOM: generateLcmMission,
  INTEGER_ADD_RANDOM: generateIntegerAddMission,
  FRAC_ADD_RANDOM: generateFracAddMission,
  FRAC_MUL_RANDOM: generateFracMulMission,
  SQUARE_CUBE_RANDOM: generateSquareCubeMission,
  SQUARE_ROOT_RANDOM: generateSquareRootMission,
  SUBSTITUTION_RANDOM: generateSubstitutionMission,
  PERIMETER_RECT_RANDOM: generatePerimeterRectMission,
  PERCENTAGE_OF_RANDOM: generatePercentageOfMission,
  ESTIMATION_ROUND_RANDOM: generateEstimationRoundMission,
  ANGLES_TRIANGLE_RANDOM: generateAnglesTriangleMission,
  ANGLES_POINT_RANDOM: generateAnglesPointMission,
  SEQUENCE_Y7_RANDOM: generateSequenceY7Mission,
  STATISTICS_RANGE_RANDOM: generateStatsRangeMission,
  AREA_TRIANGLE_RANDOM: generateAreaTriangleMission,
  FACTORS_LIST_RANDOM: generateFactorsListMission,
  INTEGER_MUL_RANDOM: generateIntegerMulMission,
  FDP_CONVERT_RANDOM: generateFdpConvertMission,
  BODMAS_RANDOM: generateBodmasMission,
  SIMPLIFY_RANDOM: generateSimplifyMission,
  STATISTICS_MODE_RANDOM: generateStatsModeMission,
  SIMPLE_EQ_TWOSTEP_RANDOM: generateTwoStepEqMission,
  COORDINATES_RANDOM: generateCoordinatesMission,
  RATIO_Y7_RANDOM: generateRatioY7Mission,
  MIXED_IMPROPER_RANDOM: generateMixedImproperMission,
  EXPAND_RANDOM: generateExpandMission,
  FACTORISE_RANDOM: generateFactoriseMission,
  INEQUALITY_RANDOM: generateInequalityMission,
  STD_FORM_RANDOM: generateStdFormMission,
  SPEED_RANDOM: generateSpeedMission,
  CIRCLE_Y8_RANDOM: generateCircleY8Mission,
  VOLUME_Y8_RANDOM: generateVolumeY8Mission,
  PERCENTAGE_INTEREST_RANDOM: generatePercentageInterestMission,
  PARALLEL_ANGLES_RANDOM: generateParallelAnglesMission,
  SYMMETRY_RANDOM: generateSymmetryMission,
  SIMULTANEOUS_Y8_RANDOM: generateSimultaneousY8Mission,
  RATIO_Y8_RANDOM: generateRatioY8Mission,
};

/** Dispatch to the right generator. Optional tier controls number difficulty. */
export function generateMission(template: Mission, tier: DifficultyTier = 2): Mission {
  const genType = template.data?.generatorType as GeneratorType | undefined;
  if (!genType || !GENERATOR_MAP[genType]) return template;
  _currentTier = tier;
  return GENERATOR_MAP[genType](template);
}

/** Get current tier — called by generators */
function getTier(): DifficultyTier { return _currentTier; }

/**
 * SIMPLE_EQ (multiplication): ax = result
 * Generator only updates data fields + tutorialSteps.
 * Story/title/description are templates with {a}, {result} — interpolated at render time.
 */
export function generateSimpleEqMission(template: Mission): Mission {
  const tier = getTier();
  const aPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7, 8, 9], 3: [3, 5, 7, 8, 9, 11, 12, 15] };
  const xPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15], 3: [5, 8, 10, 12, 15, 18, 20, 25] };
  const a = pickRandom(aPools[tier]);
  const x = pickRandom(xPools[tier]);
  const result = a * x;

  const tutorialEquationSteps = [
    { tex: `${a}x = ${result}`, annotation: { zh: '原方程', en: 'Original equation' } },
    { tex: `\\frac{${a}x}{${a}} = \\frac{${result}}{${a}}`, annotation: { zh: `两边÷${a}`, en: `÷${a} both sides` } },
    { tex: `x = ${x}`, annotation: { zh: '求解', en: 'Solution' } },
  ];

  return {
    ...template,
    // title: preserved (never replaced)
    // story: preserved (template with {a}, {result} — interpolated at render)
    // description: preserved (template — interpolated at render)
    data: { ...template.data, x, a, result, left: `${a}x`, right: `${result}`, generatorType: 'SIMPLE_EQ_RANDOM', tutorialEquationSteps },
  };
}

/**
 * SIMPLE_EQ (addition): x + a = result
 * Generator only updates data fields + tutorialSteps.
 * Story/title/description are templates with {a}, {result} — interpolated at render time.
 */
export function generateAddEqMission(template: Mission): Mission {
  const tier = getTier();
  const aPools = { 1: [3, 4, 5, 6], 2: [3, 4, 5, 6, 7, 8, 9, 11, 13, 15], 3: [7, 9, 11, 13, 15, 18, 21, 25] };
  const xPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20], 3: [8, 10, 12, 15, 18, 20, 25, 30] };
  const a = pickRandom(aPools[tier]);
  const x = pickRandom(xPools[tier]);
  const result = x + a;

  const tutorialEquationSteps = [
    { tex: `x + ${a} = ${result}`, annotation: { zh: '原方程', en: 'Original equation' } },
    { tex: `x + ${a} - ${a} = ${result} - ${a}`, annotation: { zh: `两边-${a}`, en: `-${a} both sides` } },
    { tex: `x = ${x}`, annotation: { zh: '求解', en: 'Solution' } },
  ];

  return {
    ...template,
    data: { ...template.data, x, a, result, left: `x+${a}`, right: `${result}`, generatorType: 'SIMPLE_EQ_ADD_RANDOM', tutorialEquationSteps },
  };
}

/* ══════════════════════════════════════════════════════════
   INDICES generator: a^e1 × a^e2 = a^x  or  a^e1 / a^e2 = a^x
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   ══════════════════════════════════════════════════════════ */

export function generateIndicesMission(template: Mission): Mission {
  const tier = getTier();
  const basePools = { 1: [2, 3], 2: [2, 3, 5], 3: [2, 3, 5, 7] };
  const base = pickRandom(basePools[tier]);
  // Follow template: if template has op='div', stay div; otherwise stay mul
  // Don't randomize op — it must match the story context
  const op = template.data?.op === 'div' ? 'div' : 'mul';
  let e1: number, e2: number;
  const eRanges = { 1: [2, 3] as const, 2: [2, 5] as const, 3: [3, 8] as const };
  if (op === 'div') {
    e1 = randInt(Math.max(eRanges[tier][0] + 1, 4), eRanges[tier][1] + 1);
    e2 = randInt(eRanges[tier][0], e1 - 1);
  } else {
    e1 = randInt(eRanges[tier][0], eRanges[tier][1]);
    e2 = randInt(eRanges[tier][0], eRanges[tier][1]);
  }
  const ans = op === 'div' ? e1 - e2 : e1 + e2;
  const sym = op === 'div' ? '\\div' : '\\times';

  const description: BilingualText = {
    zh: `计算 $${base}^{${e1}} ${sym} ${base}^{${e2}} = ${base}^x$，求 $x$。`,
    en: `Calculate $${base}^{${e1}} ${sym} ${base}^{${e2}} = ${base}^x$, find $x$.`,
  };

  const narrator = pickRandom(['曹操', '孙权', '关羽']);
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：什么是指数(index/power)?\n$2^{3}$ 表示 $2 \\times 2 \\times 2 = 8$\n右上角的小数字告诉你要乘多少次。\n\n底数(base)是被乘的数，指数(index)是乘的次数。`,
        en: `${narrator}: "What is an index (power)?\n$2^{3}$ means $2 \\times 2 \\times 2 = 8$\nThe small number on top tells you how many times to multiply.\n\nBase = the number being multiplied. Index = how many times."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：看这道题：$${base}^{${e1}} ${sym} ${base}^{${e2}} = ${base}^{x}$\n底数是 $${base}$，两个指数分别是 $${e1}$ 和 $${e2}$。`,
        en: `${narrator}: "Look at this expression: $${base}^{${e1}} ${sym} ${base}^{${e2}} = ${base}^{x}$\nThe base is $${base}$, and the two powers are $${e1}$ and $${e2}$."`,
      },
      highlightField: 'x',
    },
    {
      text: op === 'div' ? {
        zh: `${narrator}：指数除法法则：$a^{m} \\div a^{n} = a^{m-n}$\n底数不变，指数相减。`,
        en: `${narrator}: "Index law for division: $a^{m} \\div a^{n} = a^{m-n}$\nThe base stays the same, subtract the powers."`,
      } : {
        zh: `${narrator}：指数乘法法则：$a^{m} \\times a^{n} = a^{m+n}$\n底数不变，指数相加。`,
        en: `${narrator}: "Index law for multiplication: $a^{m} \\times a^{n} = a^{m+n}$\nThe base stays the same, add the powers."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：代入数值：$x = ${e1} ${op === 'div' ? '-' : '+'} ${e2}$`,
        en: `${narrator}: "Substitute the numbers: $x = ${e1} ${op === 'div' ? '-' : '+'} ${e2}$"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：计算：$${e1} ${op === 'div' ? '-' : '+'} ${e2} = ${ans}$`,
        en: `${narrator}: "Calculate: $${e1} ${op === 'div' ? '-' : '+'} ${e2} = ${ans}$"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：答案：$x = ${ans}$`,
        en: `${narrator}: "Answer: $x = ${ans}$"`,
      },
      highlightField: 'x',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, base, e1, e2, op: op === 'div' ? 'div' : undefined, generatorType: 'INDICES_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   ANGLES generator: supplementary (180) or complementary (90)
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   ══════════════════════════════════════════════════════════ */

export function generateAnglesMission(template: Mission): Mission {
  const tier = getTier();
  const total = template.data?.total || 180;
  const suppRanges = { 1: [30, 150] as const, 2: [20, 160] as const, 3: [10, 170] as const };
  const compRanges = { 1: [20, 70] as const, 2: [10, 80] as const, 3: [5, 85] as const };
  const range = total === 90 ? compRanges[tier] : suppRanges[tier];
  const angle = randInt(range[0], range[1]);
  const ans = total - angle;
  const kind = total === 90 ? { zh: '余角', en: 'complementary' } : { zh: '补角', en: 'supplementary' };

  const description: BilingualText = {
    zh: `计算${kind.zh}：$${total} - ${angle} = x$。`,
    en: `Calculate ${kind.en} angle: $${total} - ${angle} = x$.`,
  };

  return {
    ...template,
    description,
    data: { ...template.data, angle, total, ans, generatorType: 'ANGLES_RANDOM' },
  };
}

/* ══════════════════════════════════════════════════════════
   ARITHMETIC sequence generator: a_n = a1 + (n-1)d
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   ══════════════════════════════════════════════════════════ */

export function generateArithmeticMission(template: Mission): Mission {
  const tier = getTier();
  const a1Pools = { 1: [50, 80, 100], 2: [50, 80, 100, 150, 200, 300], 3: [200, 500, 800] };
  const dPools = { 1: [5, 8, 10], 2: [5, 8, 10, 15, 20, 25, 30, 50], 3: [15, 25, 50, 75] };
  const nRanges = { 1: [3, 6] as const, 2: [5, 15] as const, 3: [10, 20] as const };
  const a1 = pickRandom(a1Pools[tier]);
  const d = pickRandom(dPools[tier]);
  const n = randInt(nRanges[tier][0], nRanges[tier][1]);
  const ans = a1 + (n - 1) * d;

  const description: BilingualText = {
    zh: `求第 ${n} 项。$a_n = a_1 + (n-1)d$`,
    en: `Find term ${n}. $a_n = a_1 + (n-1)d$`,
  };

  const narrator = pickRandom(['诸葛亮', '赵云', '曹操']);
  const tutorialSteps = [
    { text: { zh: `${narrator}：等差数列，首项 ${a1}，公差 ${d}，求第 ${n} 项。`, en: `${narrator}: "Arithmetic sequence: a1=${a1}, d=${d}, find term ${n}."` }, highlightField: 'ans' },
    { text: { zh: `${narrator}：公式：$a_n = ${a1} + (${n}-1) \\times ${d} = ${a1} + ${(n-1)*d} = ?$`, en: `${narrator}: "Formula: $a_n = ${a1} + (${n}-1) \\times ${d} = ${a1} + ${(n-1)*d} = ?$"` }, highlightField: 'ans' },
    { text: { zh: `${narrator}：所以 a_${n} = ${ans}！`, en: `${narrator}: "So a_${n} = ${ans}!"` }, highlightField: 'ans' },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, a1, d, n, generatorType: 'ARITHMETIC_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   AREA (rectangular) generator
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   ══════════════════════════════════════════════════════════ */

export function generateAreaRectMission(template: Mission): Mission {
  const tier = getTier();
  const lengthPools = { 1: [5, 8, 10], 2: [8, 10, 15, 20, 25, 30, 35, 40], 3: [20, 35, 50, 80] };
  const widthPools = { 1: [3, 5, 7], 2: [5, 8, 10, 15, 20, 25, 30], 3: [15, 25, 40, 60] };
  const length = tier === 2 ? randInt(8, 40) : pickRandom(lengthPools[tier]);
  const width = tier === 2 ? randInt(5, 30) : pickRandom(widthPools[tier]);
  const narrator = pickRandom(['刘备', '曹操', '孙权']);

  const description: BilingualText = {
    zh: `计算营地面积。`,
    en: `Calculate the camp area.`,
  };

  const area = length * width;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要算面积？\n扎营之前总得知道这块地有多大吧？帐篷能搭几个？练兵场够不够用？\n面积就是告诉你——这块地到底有多少"空间"。\n\n你可以想象：在地上铺满 $1 \\times 1$ 的小方块，数一数一共铺了多少块。`,
        en: `${narrator}: "Why calculate area?\nBefore setting up camp, you need to know how big the ground is, right? How many tents fit? Is the drill yard big enough?\nArea tells you — exactly how much 'space' this plot has.\n\nImagine covering the ground with $1 \\times 1$ tiles and counting them all."`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：长方形面积的算法超简单\n不用真的一块块数小方块——直接用：\n$$\\text{面积} = \\text{长} \\times \\text{宽}$$\n\n为什么？因为长告诉你一排能放几块，宽告诉你有几排。一乘就得到总数！`,
        en: `${narrator}: "The rectangle area formula is super simple\nNo need to actually count tiles — just use:\n$$\\text{Area} = \\text{length} \\times \\text{width}$$\n\nWhy? Length tells you how many fit in one row, width tells you how many rows. Multiply and you get the total!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：从题目找出长和宽\n长 = $${length}$，宽 = $${width}$\n\n代进去：面积 $= ${length} \\times ${width}$`,
        en: `${narrator}: "Find the length and width from the problem\nLength = $${length}$, width = $${width}$\n\nPlug in: Area $= ${length} \\times ${width}$"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：算一下\n$${length} \\times ${width} = ${area}$\n\n就是这么简单——一步乘法就搞定了！`,
        en: `${narrator}: "Calculate\n$${length} \\times ${width} = ${area}$\n\nThat simple — one multiplication and you're done!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：答案\n面积 = $${area}$ 平方单位\n\n这块地能铺 ${area} 个小方块那么大！`,
        en: `${narrator}: "Answer\nArea = $${area}$ square units\n\nThis plot is as big as ${area} little tiles!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：验算\n面积 $${area}$ 肯定比长 $${length}$ 和宽 $${width}$ 都大？✓ 对的\n反算：$${area} \\div ${length} = ${width}$ ✓ 刚好等于宽\n\n营地面积确认无误，可以开始搭帐篷了！`,
        en: `${narrator}: "Verify\nArea $${area}$ is definitely bigger than both length $${length}$ and width $${width}$? ✓ Yes\nReverse: $${area} \\div ${length} = ${width}$ ✓ Exactly the width\n\nCamp area confirmed — start pitching tents!"`,
      },
      highlightField: 'area',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, length, width, generatorType: 'AREA_RECT_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   AREA (trapezoid) generator
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   ══════════════════════════════════════════════════════════ */

export function generateAreaTrapMission(template: Mission): Mission {
  const tier = getTier();
  const aPools = { 1: [3, 5, 8], 2: null, 3: [10, 15, 20] };
  const bOffsets = { 1: [2, 5], 2: null, 3: [5, 15] };
  const hPools = { 1: [3, 5, 7], 2: null, 3: [8, 12, 18] };
  let a = tier === 2 ? randInt(5, 20) : pickRandom(aPools[tier]!);
  let b = tier === 2 ? randInt(a + 2, a + 20) : a + pickRandom(bOffsets[tier]!);
  let h = tier === 2 ? randInt(4, 15) : pickRandom(hPools[tier]!);
  // Ensure (a+b)*h is even so area is integer
  if (((a + b) * h) % 2 !== 0) h += 1;
  const narrator = pickRandom(['赵云', '关羽']);

  const description: BilingualText = {
    zh: `计算梯形面积：$(a+b)h/2$。`,
    en: `Calculate trapezoid area: $(a+b)h/2$.`,
  };

  const sumAB = a + b;
  const areaVal = (a + b) * h / 2;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学梯形面积？\n城墙上有很多不规则的区域——不是正方形，不是长方形，而是一边长一边短的奇怪形状。\n那就是梯形！上面窄（上底），下面宽（下底），像个"倒着的梯子"。\n\n学会算梯形面积，就能搞定很多现实中不规则的地块！`,
        en: `${narrator}: "Why learn trapezoid area?\nCity walls have many irregular sections — not square, not rectangular, but with one side longer than the other.\nThat's a trapezoid! Narrow on top, wide at the bottom, like an upside-down step.\n\nLearn trapezoid area, and you can handle all sorts of irregular plots in real life!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：梯形面积的公式——为什么除以 2？\n$$\\text{面积} = \\frac{(\\text{上底} + \\text{下底}) \\times \\text{高}}{2}$$\n\n把两个一模一样的梯形"拼"在一起，刚好变成一个平行四边形！\n平行四边形面积 = (上底+下底) × 高，梯形只占一半，所以除以 2。\n这个小窍门记住了，梯形面积就不会错！`,
        en: `${narrator}: "The trapezoid formula — why divide by 2?\n$$\\text{Area} = \\frac{(\\text{top} + \\text{bottom}) \\times \\text{height}}{2}$$\n\nFlip and join two identical trapezoids — they form a parallelogram!\nParallelogram area = (top + bottom) × height, trapezoid is half, so divide by 2.\nRemember this trick and you'll never get it wrong!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：从题目中找出三个数\n上底 $a = ${a}$，下底 $b = ${b}$，高 $h = ${h}$\n\n三个数都找到了——就像找齐三味药材，接下来就是"炼丹"了！`,
        en: `${narrator}: "Find the three numbers from the problem\nTop $a = ${a}$, bottom $b = ${b}$, height $h = ${h}$\n\nAll three found — like gathering three ingredients, now it's time to 'brew the potion'!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：第一步——上底加下底\n$${a} + ${b} = ${sumAB}$\n\n把两条平行边加起来——就像量两条城墙合起来有多长。这是为下一步做准备！`,
        en: `${narrator}: "Step 1 — add top + bottom\n$${a} + ${b} = ${sumAB}$\n\nAdd the two parallel sides — like measuring two walls combined. This prepares for the next step!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：第二步——乘以高，再除以 2\n$\\frac{${sumAB} \\times ${h}}{2} = \\frac{${sumAB * h}}{2} = ${areaVal}$\n\n乘高得出平行四边形的面积，除以 2 就是梯形的面积。两步搞定！`,
        en: `${narrator}: "Step 2 — multiply by height, then halve\n$\\frac{${sumAB} \\times ${h}}{2} = \\frac{${sumAB * h}}{2} = ${areaVal}$\n\nMultiply by height for the parallelogram area, halve it for the trapezoid. Two steps done!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：答案\n面积 = $${areaVal}$\n\n验算：面积应该比 $${a} \\times ${h} = ${a * h}$（小长方形）大，\n比 $${b} \\times ${h} = ${b * h}$（大长方形）小。\n$${a * h} < ${areaVal} < ${b * h}$ ✓ 夹在中间，完美合理！做得漂亮！`,
        en: `${narrator}: "Answer\nArea = $${areaVal}$\n\nVerify: area should be bigger than $${a} \\times ${h} = ${a * h}$ (small rectangle),\nand smaller than $${b} \\times ${h} = ${b * h}$ (big rectangle).\n$${a * h} < ${areaVal} < ${b * h}$ ✓ Sandwiched perfectly! Brilliantly done!"`,
      },
      highlightField: 'area',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, a, b, h, generatorType: 'AREA_TRAP_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   PROBABILITY (simple) generator: P = target/total
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   ══════════════════════════════════════════════════════════ */

export function generateProbSimpleMission(template: Mission): Mission {
  const tier = getTier();
  const totalPools = { 1: [10, 12, 20], 2: [20, 30, 36, 40, 50, 52, 60, 80, 100], 3: [60, 80, 100, 200] };
  const targetPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 8, 10, 12, 15], 3: [7, 11, 13, 17, 19] };
  const total = pickRandom(totalPools[tier]);
  let target = pickRandom(targetPools[tier]);
  // Ensure target ≤ total
  if (target > total) target = Math.min(...targetPools[tier].filter(t => t <= total));
  const narrator = '诸葛亮';

  const description: BilingualText = {
    zh: `随机观一象，抽中吉兆的概率是多少？`,
    en: `What is the probability of an auspicious omen?`,
  };

  const p = target / total;
  const pDisplay = Math.round(p * 10000) / 10000;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要概率？\n想象一下：袋子里有 $${total}$ 个球，你闭着眼睛摸一个。\n能摸到你想要的那种球吗？概率就是回答"有多大可能"的数学工具。\n战场上也一样——不确定性无处不在，算清概率才能做最聪明的决定。`,
        en: `${narrator}: "Why do we need probability?\nImagine a bag with $${total}$ balls. You reach in blindfolded.\nWill you grab the one you want? Probability is the maths tool that answers 'how likely is it?'\nOn the battlefield too — uncertainty is everywhere. Calculate probability to make the smartest decision."`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：概率的核心思想，只有一句话：\n$$P = \\frac{\\text{我想要的结果数}}{\\text{所有可能的结果数}}$$\n就像摸球：想要的球有几个 ÷ 总共几个球。\n概率的值在 $0$ 到 $1$ 之间：$0$ = 绝不可能，$1$ = 一定发生。`,
        en: `${narrator}: "The core idea of probability fits in one sentence:\n$$P = \\frac{\\text{outcomes I want}}{\\text{all possible outcomes}}$$\nLike drawing balls: how many I want ÷ total balls.\nProbability ranges from $0$ to $1$: $0$ = impossible, $1$ = certain."`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：第一步——从题目里找"总数"\n题目说总共有多少种可能？仔细读一遍……\n找到了！总结果数 = $${total}$\n（这就是分母——放在分数线下面的数）`,
        en: `${narrator}: "Step 1 — find the 'total' from the problem\nHow many possible outcomes does the problem describe? Read carefully...\nFound it! Total outcomes = $${total}$\n(This goes on the bottom of the fraction — the denominator)"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：第二步——从题目里找"想要的数"\n我们想要的那种结果有几个？\n找到了！想要的结果数 = $${target}$\n（这就是分子——放在分数线上面的数）\n你做得很好，信息都找齐了！`,
        en: `${narrator}: "Step 2 — find the 'wanted count' from the problem\nHow many of the outcomes are the ones we want?\nFound it! Wanted outcomes = $${target}$\n(This goes on top of the fraction — the numerator)\nGreat job — you've found all the information!"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：现在套公式，慢慢来：\n$P = \\frac{\\text{想要的}}{\\text{总数}} = \\frac{${target}}{${total}}$\n\n接下来算这个除法：$${target} \\div ${total} = ${pDisplay}$`,
        en: `${narrator}: "Now plug into the formula, nice and slow:\n$P = \\frac{\\text{wanted}}{\\text{total}} = \\frac{${target}}{${total}}$\n\nNow do the division: $${target} \\div ${total} = ${pDisplay}$"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：答案出来了！\n概率 $P = ${pDisplay}$\n\n换个说法：每 $${total}$ 次里大约有 $${target}$ 次能成功。\n恭喜你，概率计算完成！`,
        en: `${narrator}: "We have the answer!\nProbability $P = ${pDisplay}$\n\nIn other words: roughly $${target}$ times out of every $${total}$ tries.\nCongratulations — probability calculated!"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：最后检查一下，确保没算错：\n① $0 \\leq ${pDisplay} \\leq 1$? ✓ 概率在合理范围内\n② 想要的 $${target}$ 不超过总数 $${total}$? ✓ 没有多出来\n全部正确！你现在已经学会了最基础的概率计算，了不起！`,
        en: `${narrator}: "Let's double-check to make sure:\n① $0 \\leq ${pDisplay} \\leq 1$? ✓ Probability is in valid range\n② Wanted $${target}$ doesn't exceed total $${total}$? ✓ Nothing extra\nAll correct! You've now mastered the most basic probability calculation — well done!"`,
      },
      highlightField: 'p',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, total, target, generatorType: 'PROBABILITY_SIMPLE_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   PROBABILITY (independent events) generator: P = p1 × p2
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   ══════════════════════════════════════════════════════════ */

export function generateProbIndMission(template: Mission): Mission {
  const tier = getTier();
  const pPools = { 1: [0.5, 0.5], 2: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8], 3: [0.1, 0.2, 0.3, 0.7, 0.8, 0.9] };
  const p1 = pickRandom(pPools[tier]);
  const p2 = pickRandom(pPools[tier]);
  const narrator = '周瑜';

  const description: BilingualText = {
    zh: `计算独立事件同时发生的概率：$P(A \\cap B) = P(A) \\times P(B)$。`,
    en: `Calculate prob of independent events: $P(A \\cap B) = P(A) \\times P(B)$.`,
  };

  const ans = p1 * p2;
  const ansDisplay = Math.round(ans * 100) / 100;
  const minP = Math.min(p1, p2);
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要算"同时发生"的概率？\n想象你同时派两个探子去打探消息。每个人能不能成功是各自的事。\n但你关心的是：两个人**都**成功的可能性有多大？\n这就是独立事件的组合概率——战场决策的关键。`,
        en: `${narrator}: "Why do we need to calculate 'both happening' probability?\nImagine sending two spies on separate missions. Each one's success is their own affair.\nBut what you care about is: how likely is it that BOTH succeed?\nThis is combined probability of independent events — the key to battlefield decisions."`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：什么是"独立"？\n独立 = 互不影响。第一个人成不成功，完全不影响第二个人。\n生活例子：抛两次硬币——第一次正面朝上，不会让第二次更容易或更难。\n判断方法很简单：两件事之间有没有因果关系？没有 = 独立。`,
        en: `${narrator}: "What does 'independent' mean?\nIndependent = no influence. Whether the first person succeeds has zero effect on the second.\nReal-life example: flip a coin twice — heads on the first flip doesn't make the second flip easier or harder.\nSimple test: is there a cause-and-effect link? No link = independent."`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：从题目中提取已知信息：\n第一个事件成功概率 → $P_1 = ${p1}$\n第二个事件成功概率 → $P_2 = ${p2}$\n这两个数就是我们的起点，别担心，接下来只需要一步乘法！`,
        en: `${narrator}: "Extract the given information from the problem:\nFirst event success probability → $P_1 = ${p1}$\nSecond event success probability → $P_2 = ${p2}$\nThese two numbers are our starting point. Don't worry — we just need one multiplication!"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：为什么是"乘"？\n直觉：如果第一件事成功的可能是一半($0.5$)，第二件也是一半($0.5$)，\n两个都成功就是"一半的一半"= $0.25$（四分之一）。\n"一半的一半"就是乘法！这就是乘法法则的本质：\n$$P(\\text{都成功}) = P_1 \\times P_2$$`,
        en: `${narrator}: "Why do we MULTIPLY?\nIntuition: if the first event has a half chance ($0.5$), and the second also has a half ($0.5$),\nboth succeeding is 'half of a half' = $0.25$ (a quarter).\n'Half of a half' IS multiplication! That's the essence of the multiplication rule:\n$$P(\\text{both}) = P_1 \\times P_2$$"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：代入计算，一步一步来：\n$P = P_1 \\times P_2$\n$P = ${p1} \\times ${p2}$\n$P = ${ansDisplay}$`,
        en: `${narrator}: "Substitute and calculate, step by step:\n$P = P_1 \\times P_2$\n$P = ${p1} \\times ${p2}$\n$P = ${ansDisplay}$"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：答案\n两个事件同时发生的概率 = $${ansDisplay}$\n\n做到这里你已经很棒了！`,
        en: `${narrator}: "Answer\nProbability of both events happening = $${ansDisplay}$\n\nYou've done brilliantly getting this far!"`,
      },
      highlightField: 'p',
    },
    {
      text: {
        zh: `${narrator}：验算——用常识检查：\n两件事**同时**发生，应该比任何一件**单独**发生更难，对吗？\n$${ansDisplay} \\leq ${minP}$? ✓ 确实更小！\n$0 \\leq ${ansDisplay} \\leq 1$? ✓ 在合理范围内\n完美！你已经掌握了独立事件的组合概率！`,
        en: `${narrator}: "Verify — use common sense:\nBOTH events happening should be HARDER than either one alone, right?\n$${ansDisplay} \\leq ${minP}$? ✓ Indeed smaller!\n$0 \\leq ${ansDisplay} \\leq 1$? ✓ Within valid range\nPerfect! You've mastered combined probability of independent events!"`,
      },
      highlightField: 'p',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, p1, p2, generatorType: 'PROBABILITY_IND_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   PYTHAGORAS generator: uses integer triples
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   Template data determines mode: has 'c' → find-leg, has 'b' → find-hypotenuse.
   ══════════════════════════════════════════════════════════ */

const PYTHAGOREAN_TRIPLES: [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17],
  [7, 24, 25], [9, 12, 15], [12, 16, 20], [9, 40, 41],
];

const PYTHAGOREAN_TRIPLES_EXTRA: [number, number, number][] = [
  [20, 21, 29], [11, 60, 61],
];

export function generatePythagorasMission(template: Mission): Mission {
  const tier = getTier();
  const triplePools = {
    1: PYTHAGOREAN_TRIPLES.slice(0, 3),
    2: PYTHAGOREAN_TRIPLES,
    3: [...PYTHAGOREAN_TRIPLES, ...PYTHAGOREAN_TRIPLES_EXTRA],
  };
  const [triA, triB, triC] = pickRandom(triplePools[tier]);
  // Template data determines mode: if template has 'c' key, it's find-leg; if 'b' key, find-hypotenuse
  const findC = !('c' in (template.data || {}));
  const narrator = pickRandom(['关羽', '赵云']);

  let description: BilingualText;
  let data: Record<string, unknown>;

  if (findC) {
    description = {
      zh: `求云梯长度 $c = \\sqrt{${triA}^2 + ${triB}^2}$。`,
      en: `Find ladder length $c = \\sqrt{${triA}^2 + ${triB}^2}$.`,
    };
    // Clean slate — don't spread template.data to avoid c leaking from template
    data = { a: triA, b: triB, generatorType: 'PYTHAGORAS_RANDOM' };
  } else {
    description = {
      zh: `求地道深度 $a = \\sqrt{${triC}^2 - ${triB}^2}$。`,
      en: `Find depth $a = \\sqrt{${triC}^2 - ${triB}^2}$.`,
    };
    // Clean slate — only include fields checkCorrectness needs
    data = { a: triB, c: triC, generatorType: 'PYTHAGORAS_RANDOM' };
  }

  const ans = findC ? triC : triA;
  const tutorialSteps = findC ? [
    { text: { zh: `${narrator}：为什么需要勾股定理？\n攻城要架云梯——城墙高 $${triA}$，梯子底部离城墙 $${triB}$。\n梯子要多长才够得到？不能太短（够不到），也不能带太长的（搬不动）。\n勾股定理就是专门算这种"直角三角形"问题的！`, en: `${narrator}: "Why do we need the Pythagorean theorem?\nTo siege a wall, you need a ladder — wall height $${triA}$, ladder base $${triB}$ from wall.\nHow long must the ladder be? Not too short (can't reach), not too long (can't carry).\nThe Pythagorean theorem is made for this kind of right-angle problem!"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：勾股定理说的是什么？\n在有一个直角的三角形里，两条短边的平方加起来 = 最长边的平方。\n写成公式：$a^{2} + b^{2} = c^{2}$\n\n$a$、$b$ 是两条短边（直角旁边的），$c$ 是最长边（对面的斜边）。`, en: `${narrator}: "What does the theorem say?\nIn a triangle with a right angle, the two short sides squared add up to the longest side squared.\nAs a formula: $a^{2} + b^{2} = c^{2}$\n\n$a$, $b$ are the two short sides (next to the right angle), $c$ is the longest (the hypotenuse)."` }, highlightField: 'c' },
    { text: { zh: `${narrator}：从题目里找数字\n$a = ${triA}$（城墙高度），$b = ${triB}$（离墙距离）\n要求的是 $c$（云梯长度）\n\n信息齐了，开始算！`, en: `${narrator}: "Find the numbers from the problem\n$a = ${triA}$ (wall height), $b = ${triB}$ (distance from wall)\nWe need $c$ (ladder length)\n\nAll info ready — let's calculate!"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：先算平方\n$${triA}^{2} = ${triA} \\times ${triA} = ${triA * triA}$\n$${triB}^{2} = ${triB} \\times ${triB} = ${triB * triB}$\n\n加起来：$${triA * triA} + ${triB * triB} = ${triA * triA + triB * triB}$\n\n所以 $c^{2} = ${triA * triA + triB * triB}$`, en: `${narrator}: "First, calculate the squares\n$${triA}^{2} = ${triA} \\times ${triA} = ${triA * triA}$\n$${triB}^{2} = ${triB} \\times ${triB} = ${triB * triB}$\n\nAdd them: $${triA * triA} + ${triB * triB} = ${triA * triA + triB * triB}$\n\nSo $c^{2} = ${triA * triA + triB * triB}$"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：开平方根——"反向操作"\n$c^{2} = ${triA * triA + triB * triB}$，什么数乘以自己等于 ${triA * triA + triB * triB}？\n$c = \\sqrt{${triA * triA + triB * triB}} = ${triC}$\n\n云梯长度 = $${triC}$！`, en: `${narrator}: "Take the square root — the 'reverse operation'\n$c^{2} = ${triA * triA + triB * triB}$, what number times itself equals ${triA * triA + triB * triB}?\n$c = \\sqrt{${triA * triA + triB * triB}} = ${triC}$\n\nLadder length = $${triC}$!"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：答案 $c = ${triC}$\n\n验算：$${triA}^{2} + ${triB}^{2} = ${triA * triA} + ${triB * triB} = ${triA * triA + triB * triB}$\n$${triC}^{2} = ${triC * triC}$ ✓ 完全吻合！\n\n云梯准备好了，攻城吧！`, en: `${narrator}: "Answer: $c = ${triC}$\n\nVerify: $${triA}^{2} + ${triB}^{2} = ${triA * triA} + ${triB * triB} = ${triA * triA + triB * triB}$\n$${triC}^{2} = ${triC * triC}$ ✓ Perfect match!\n\nLadder ready — charge the walls!"` }, highlightField: 'c' },
  ] : [
    { text: { zh: `${narrator}：为什么需要勾股定理？\n挖地道攻城！地面距离知道是 $${triB}$，斜着的隧道长 $${triC}$。\n但地道要挖多深？这就需要勾股定理来算。`, en: `${narrator}: "Why do we need the Pythagorean theorem?\nDigging a tunnel to breach the wall! Ground distance is $${triB}$, tunnel length $${triC}$.\nBut how deep must we dig? The Pythagorean theorem will tell us."` }, highlightField: 'c' },
    { text: { zh: `${narrator}：勾股定理：$a^{2} + b^{2} = c^{2}$\n$c$ 是最长边（隧道），$a$ 和 $b$ 是两条短边。\n这次我们知道 $c$ 和一条短边，要求另一条。\n\n变一下形：$b^{2} = c^{2} - a^{2}$（把已知的移过去）`, en: `${narrator}: "Pythagorean theorem: $a^{2} + b^{2} = c^{2}$\n$c$ is the longest side (tunnel), $a$ and $b$ are the two shorter sides.\nThis time we know $c$ and one short side — find the other.\n\nRearrange: $b^{2} = c^{2} - a^{2}$ (move the known side across)"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：从题目找数字\n隧道长 $c = ${triC}$，地面距离 $a = ${triB}$\n求深度 $b = ?$\n\n代进去算！`, en: `${narrator}: "Find the numbers\nTunnel length $c = ${triC}$, ground distance $a = ${triB}$\nFind depth $b = ?$\n\nLet's substitute and calculate!"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：先算平方，再做减法\n$c^{2} = ${triC} \\times ${triC} = ${triC * triC}$\n$a^{2} = ${triB} \\times ${triB} = ${triB * triB}$\n$b^{2} = ${triC * triC} - ${triB * triB} = ${triC * triC - triB * triB}$`, en: `${narrator}: "Square first, then subtract\n$c^{2} = ${triC} \\times ${triC} = ${triC * triC}$\n$a^{2} = ${triB} \\times ${triB} = ${triB * triB}$\n$b^{2} = ${triC * triC} - ${triB * triB} = ${triC * triC - triB * triB}$"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：开平方根\n$b = \\sqrt{${triC * triC - triB * triB}} = ${triA}$\n\n地道深度 = $${triA}$！`, en: `${narrator}: "Take the square root\n$b = \\sqrt{${triC * triC - triB * triB}} = ${triA}$\n\nTunnel depth = $${triA}$!"` }, highlightField: 'c' },
    { text: { zh: `${narrator}：答案 $b = ${triA}$\n\n验算：$${triA}^{2} + ${triB}^{2} = ${triA * triA} + ${triB * triB} = ${triA * triA + triB * triB}$\n$${triC}^{2} = ${triC * triC}$ ✓ 完美！\n\n地道挖通了，出其不意！`, en: `${narrator}: "Answer: $b = ${triA}$\n\nVerify: $${triA}^{2} + ${triB}^{2} = ${triA * triA} + ${triB * triB} = ${triA * triA + triB * triB}$\n$${triC}^{2} = ${triC * triC}$ ✓ Perfect!\n\nTunnel complete — surprise attack!"` }, highlightField: 'c' },
  ];

  return { ...template, description, data, tutorialSteps };
}

/* ══════════════════════════════════════════════════════════
   PERCENTAGE generator: result = initial × (1+rate)^years
   Story is now a template on the mission — generator only updates data + description + tutorialSteps.
   Template data.rate sign determines mode: negative → discount, positive → tax.
   ══════════════════════════════════════════════════════════ */

export function generatePercentageMission(template: Mission): Mission {
  const tier = getTier();
  const isDiscount = (template.data?.rate ?? 0) < 0;
  const initialPools = { 1: [100, 200, 500], 2: [200, 500, 800, 1000, 1500, 2000, 3000, 5000], 3: [2000, 5000, 8000] };
  const pctPools = { 1: [10, 20, 50], 2: [10, 15, 20, 25, 30, 40, 50], 3: [12, 15, 18, 22, 35] };
  const initial = pickRandom(initialPools[tier]);
  const pct = pickRandom(pctPools[tier]);
  const rate = isDiscount ? -pct / 100 : pct / 100;
  const result = initial * (1 + rate);
  const narrator = '曹操';

  const description: BilingualText = isDiscount
    ? { zh: `计算折后价：$${initial} \\times (1 - ${pct}\\%)$`, en: `Calculate discounted price: $${initial} \\times (1 - ${pct}\\%)$` }
    : { zh: `计算总额：$${initial} \\times (1 + ${pct}\\%)$`, en: `Calculate total: $${initial} \\times (1 + ${pct}\\%)$` };

  const decimal = pct / 100;
  const multiplier = isDiscount ? 1 - decimal : 1 + decimal;
  const changeAmount = initial * decimal;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：百分比是什么意思？\n很简单——"百分之${pct}"就是"每 100 份里取 ${pct} 份"。\n生活中到处都是：商店打折、考试得分、税率……\n${isDiscount ? '今天我们算的是打折——原价便宜了多少。' : '今天我们算的是涨价——原来的基础上多了多少。'}`,
        en: `${narrator}: "What does percentage mean?\nSimple — '${pct} percent' means 'take ${pct} out of every 100'.\nIt's everywhere in life: shop discounts, exam scores, tax rates...\n${isDiscount ? 'Today we\'re calculating a discount — how much cheaper.' : 'Today we\'re calculating an increase — how much more.'}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：从题目里找信息\n原来的值 = $${initial}$\n${isDiscount ? '减少' : '增加'} $${pct}\\%$\n\n接下来分三步走，慢慢来！`,
        en: `${narrator}: "Find the information from the problem\nOriginal value = $${initial}$\n${isDiscount ? 'Decrease' : 'Increase'} by $${pct}\\%$\n\nThree steps ahead — nice and easy!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——把百分比变成小数\n怎么变？除以 100 就行（小数点往左挪两位）\n$${pct}\\% = ${pct} \\div 100 = ${decimal}$\n\n这个 $${decimal}$ 就是"变化的比例"。`,
        en: `${narrator}: "Step 1 — turn the percentage into a decimal\nHow? Just divide by 100 (move decimal point two places left)\n$${pct}\\% = ${pct} \\div 100 = ${decimal}$\n\nThis $${decimal}$ is the 'rate of change'."`,
      },
      highlightField: 'ans',
    },
    {
      text: isDiscount ? {
        zh: `${narrator}：第二步——算变化了多少\n减少 $${decimal}$ 意味着保留了 $1 - ${decimal} = ${multiplier}$\n\n换个说法：原来有 100%，去掉 ${pct}%，还剩 ${pct === 50 ? '一半' : (100 - pct) + '%'}。\n所以新值 = 原值 $\\times ${multiplier}$`,
        en: `${narrator}: "Step 2 — calculate the change\nDecrease by $${decimal}$ means keeping $1 - ${decimal} = ${multiplier}$\n\nAnother way: had 100%, remove ${pct}%, left with ${100 - pct}%.\nSo new value = original $\\times ${multiplier}$"`,
      } : {
        zh: `${narrator}：第二步——算变化了多少\n增加 $${decimal}$ 意味着变成了 $1 + ${decimal} = ${multiplier}$\n\n换个说法：原来 100%，加上 ${pct}%，一共 ${100 + pct}%。\n所以新值 = 原值 $\\times ${multiplier}$`,
        en: `${narrator}: "Step 2 — calculate the change\nIncrease by $${decimal}$ means becoming $1 + ${decimal} = ${multiplier}$\n\nAnother way: had 100%, add ${pct}%, total ${100 + pct}%.\nSo new value = original $\\times ${multiplier}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第三步——算出最终结果\n$${initial} \\times ${multiplier} = ${result}$`,
        en: `${narrator}: "Step 3 — calculate the final result\n$${initial} \\times ${multiplier} = ${result}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案 = $${result}$\n\n验算：变化量 $= ${initial} \\times ${decimal} = ${changeAmount}$\n${isDiscount ? `$${initial} - ${changeAmount} = ${result}$` : `$${initial} + ${changeAmount} = ${result}$`} ✓\n\n百分比就是这么简单！做得好！`,
        en: `${narrator}: "Answer = $${result}$\n\nVerify: change = $${initial} \\times ${decimal} = ${changeAmount}$\n${isDiscount ? `$${initial} - ${changeAmount} = ${result}$` : `$${initial} + ${changeAmount} = ${result}$`} ✓\n\nPercentages are that simple! Great job!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, initial, pct, rate, years: 1, generatorType: 'PERCENTAGE_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   LINEAR generator: y = mx + c from two points
   ══════════════════════════════════════════════════════════ */

export function generateLinearMission(template: Mission): Mission {
  const tier = getTier();
  const mPools = { 1: [1, 2, -1, -2], 2: [1, 2, 3, -1, -2, -3], 3: [-4, -3, -2, 2, 3, 4, 5] };
  const cPools = { 1: [0, 1, 2, 3, -1], 2: [-5, -3, -1, 0, 1, 3, 5], 3: [-8, -5, -3, 3, 5, 7, 10] };
  const m = pickRandom(mPools[tier]);
  const c = pickRandom(cPools[tier]);
  const x1 = pickRandom([-2, -1, 0, 1, 2, 3]);
  const x2 = x1 + pickRandom([1, 2, 3]);
  const y1 = m * x1 + c;
  const y2 = m * x2 + c;

  const narrator = pickRandom(['诸葛亮', '曹操']);
  const description: BilingualText = {
    zh: `求经过 A(${x1}, ${y1}) 和 B(${x2}, ${y2}) 的直线方程 $y = mx + c$。`,
    en: `Find the equation $y = mx + c$ through A(${x1}, ${y1}) and B(${x2}, ${y2}).`,
  };

  // Build substitution string for c calculation: y1 = m*x1 + c → c = y1 - m*x1
  const mTimesX1 = m * x1;
  const cExpr = mTimesX1 >= 0
    ? `${y1} - ${mTimesX1}`
    : `${y1} - (${mTimesX1})`;

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学直线方程？\n你看，行军路线、粮草涨价、人口增长——很多东西的变化都是"匀速"的。\n直线方程 $y = mx + c$ 就是用来描述这种"匀速变化"的万能工具。\n学会了它，就能预测未来的趋势！`,
        en: `${narrator}: "Why learn the equation of a line?\nThink about it — march routes, rising grain prices, population growth — many things change at a steady rate.\nThe line equation $y = mx + c$ is the universal tool for describing this 'steady change'.\nLearn it, and you can predict future trends!"`,
      },
      highlightField: 'm',
    },
    {
      text: {
        zh: `${narrator}：什么是斜率 $m$？\n你走上坡路——坡越陡，走一步横向距离上升越多，对吧？\n斜率就是衡量"陡不陡"的数：\n$$m = \\frac{\\text{上升了多少}}{\\text{往前走了多少}} = \\frac{y \\text{ 的变化}}{x \\text{ 的变化}}$$\n正数 = 上坡，负数 = 下坡，零 = 平路。`,
        en: `${narrator}: "What is slope $m$?\nImagine walking uphill — the steeper it is, the more you rise for each step forward, right?\nSlope measures exactly this 'steepness':\n$$m = \\frac{\\text{rise}}{\\text{run}} = \\frac{\\text{change in } y}{\\text{change in } x}$$\nPositive = uphill, negative = downhill, zero = flat."`,
      },
      highlightField: 'm',
    },
    {
      text: {
        zh: `${narrator}：从题目找出两个点\n题目给了我们两个坐标：\n点 A = $(${x1}, ${y1})$ → $x_1 = ${x1}$，$y_1 = ${y1}$\n点 B = $(${x2}, ${y2})$ → $x_2 = ${x2}$，$y_2 = ${y2}$\n\n有了两个点，斜率就能算出来！`,
        en: `${narrator}: "Find the two points from the problem\nWe're given two coordinates:\nPoint A = $(${x1}, ${y1})$ → $x_1 = ${x1}$, $y_1 = ${y1}$\nPoint B = $(${x2}, ${y2})$ → $x_2 = ${x2}$, $y_2 = ${y2}$\n\nWith two points, we can calculate the slope!"`,
      },
      highlightField: 'm',
    },
    {
      text: {
        zh: `${narrator}：算斜率，一步步来\n上升了多少？$y_2 - y_1 = ${y2} - (${y1}) = ${y2 - y1}$\n往前走了多少？$x_2 - x_1 = ${x2} - (${x1}) = ${x2 - x1}$\n\n斜率 $m = \\frac{${y2 - y1}}{${x2 - x1}} = ${m}$\n\n${m > 0 ? '正数，说明是上坡趋势！' : m < 0 ? '负数，说明是下坡趋势！' : '零，说明是平路！'}`,
        en: `${narrator}: "Calculate slope step by step\nRise: $y_2 - y_1 = ${y2} - (${y1}) = ${y2 - y1}$\nRun: $x_2 - x_1 = ${x2} - (${x1}) = ${x2 - x1}$\n\nSlope $m = \\frac{${y2 - y1}}{${x2 - x1}} = ${m}$\n\n${m > 0 ? 'Positive — uphill trend!' : m < 0 ? 'Negative — downhill trend!' : 'Zero — flat!'}"`,
      },
      highlightField: 'm',
    },
    {
      text: {
        zh: `${narrator}：什么是截距 $c$？\n$c$ 就是"起点"——当 $x = 0$ 的时候，$y$ 是多少。\n想象一条路从原点出发，$c$ 就是出发点的高度。\n\n现在 $m$ 已经知道了，只剩 $c$ 要找。用一个已知的点就能算出来！`,
        en: `${narrator}: "What is intercept $c$?\n$c$ is the 'starting point' — when $x = 0$, what is $y$?\nImagine a road from the origin, $c$ is the starting height.\n\nWe already know $m$, only $c$ is left. We can find it using any known point!"`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：把点 A 代入方程求 $c$\n$y = mx + c$ 里，把 $m = ${m}$，$x = ${x1}$，$y = ${y1}$ 代进去：\n$${y1} = ${m} \\times (${x1}) + c$\n$${y1} = ${mTimesX1} + c$\n$c = ${cExpr} = ${c}$\n\n$c$ 也找到了！你做得太好了！`,
        en: `${narrator}: "Substitute point A into the equation to find $c$\nIn $y = mx + c$, put $m = ${m}$, $x = ${x1}$, $y = ${y1}$:\n$${y1} = ${m} \\times (${x1}) + c$\n$${y1} = ${mTimesX1} + c$\n$c = ${cExpr} = ${c}$\n\n$c$ found too! You're doing brilliantly!"`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：答案\n$$y = ${m}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}$$\n这就是这条直线的方程！有了它，给任何 $x$ 都能算出对应的 $y$。`,
        en: `${narrator}: "Answer\n$$y = ${m}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}$$\nThis is the equation of the line! With it, give any $x$ and you can find the matching $y$."`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：验算——用点 B 检查\n把 B$(${x2}, ${y2})$ 代回方程：\n$y = ${m} \\times (${x2}) ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = ${m * x2} ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = ${y2}$ ✓\n和点 B 的 $y$ 坐标一致！\n\n恭喜！直线方程学会了，未来的趋势你说了算！`,
        en: `${narrator}: "Verify — check with point B\nSubstitute B$(${x2}, ${y2})$ back:\n$y = ${m} \\times (${x2}) ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = ${m * x2} ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = ${y2}$ ✓\nMatches point B's $y$ coordinate!\n\nCongratulations! You've mastered line equations — you're the one predicting the trends now!"`,
      },
      highlightField: 'c',
    },
  ];

  return {
    ...template,
    description,
    data: { points: [[x1, y1], [x2, y2]], x1, y1, x2, y2, generatorType: 'LINEAR_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SIMULTANEOUS generator: two linear equations
   ══════════════════════════════════════════════════════════ */

export function generateSimultaneousMission(template: Mission): Mission {
  const tier = getTier();
  // Generate solution first, then build equations
  const xyPools = { 1: [-2, -1, 1, 2], 2: [-3, -2, -1, 1, 2, 3, 4, 5], 3: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] };
  const coeffPools = { 1: [1, 2], 2: [1, 2, 3, -1], 3: [1, 2, 3, -1, -2] };
  const x = pickRandom(xyPools[tier]);
  const y = pickRandom(xyPools[tier]);
  const a1 = pickRandom(coeffPools[tier]);
  const b1 = pickRandom(tier === 2 ? [1, 2, -1] : coeffPools[tier]);
  const a2 = pickRandom(tier === 2 ? [1, -1, 2] : coeffPools[tier]);
  const b2 = pickRandom(coeffPools[tier]);
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;

  // Ensure the system has unique solution (det ≠ 0)
  const det = a1 * b2 - a2 * b1;
  if (det === 0) return generateSimultaneousMission(template); // retry

  const narrator = pickRandom(['周瑜', '诸葛亮']);
  const description: BilingualText = {
    zh: `解联立方程：$${a1}x + ${b1}y = ${c1}$，$${a2}x + ${b2}y = ${c2}$`,
    en: `Solve: $${a1}x + ${b1}y = ${c1}$, $${a2}x + ${b2}y = ${c2}$`,
  };

  // Compute elimination intermediate values for tutorial
  const elimMul1 = Math.abs(b2);
  const elimMul2 = Math.abs(b1);
  const newA1 = a1 * elimMul1;
  const newB1 = b1 * elimMul1;
  const newC1 = c1 * elimMul1;
  const newA2 = a2 * elimMul2;
  const newB2 = b2 * elimMul2;
  const newC2 = c2 * elimMul2;
  const elimA = newA1 - newA2;
  const elimC = newC1 - newC2;

  const tutorialSteps = [
    { text: { zh: `${narrator}：什么是联立方程?\n两个方程包含两个未知数，需要同时求解。`, en: `${narrator}: "What are simultaneous equations?\nTwo equations with two unknowns — solve both at the same time."` }, highlightField: 'x' },
    { text: { zh: `${narrator}：写出两个方程：\n方程1: $${a1}x + ${b1}y = ${c1}$\n方程2: $${a2}x + ${b2}y = ${c2}$`, en: `${narrator}: "Write the two equations:\nEq1: $${a1}x + ${b1}y = ${c1}$\nEq2: $${a2}x + ${b2}y = ${c2}$"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：目标：让一个变量的系数相同，这样就能消去它。\n我们选择消去 $y$。`, en: `${narrator}: "Goal: make the coefficient of one variable the same in both equations, so we can eliminate it.\nLet's eliminate $y$."` }, highlightField: 'x' },
    { text: { zh: `${narrator}：方程1 乘以 $${elimMul1}$: $${newA1}x + ${newB1}y = ${newC1}$\n方程2 乘以 $${elimMul2}$: $${newA2}x + ${newB2}y = ${newC2}$`, en: `${narrator}: "Multiply Eq1 by $${elimMul1}$: $${newA1}x + ${newB1}y = ${newC1}$\nMultiply Eq2 by $${elimMul2}$: $${newA2}x + ${newB2}y = ${newC2}$"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：两式相减，$y$ 消去：\n$${elimA}x = ${elimC}$\n$x = ${elimC} \\div ${elimA} = ${x}$`, en: `${narrator}: "Subtract one from the other, $y$ disappears:\n$${elimA}x = ${elimC}$\n$x = ${elimC} \\div ${elimA} = ${x}$"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：把 $x = ${x}$ 代回方程1：\n$${a1} \\times ${x} + ${b1}y = ${c1}$\n$${b1}y = ${c1 - a1 * x}$\n$y = ${y}$`, en: `${narrator}: "Substitute $x = ${x}$ back into Eq1:\n$${a1} \\times ${x} + ${b1}y = ${c1}$\n$${b1}y = ${c1 - a1 * x}$\n$y = ${y}$"` }, highlightField: 'y' },
    { text: { zh: `${narrator}：答案：$x = ${x}$，$y = ${y}$!`, en: `${narrator}: "Answer: $x = ${x}$, $y = ${y}$!"` }, highlightField: 'x' },
  ];

  return {
    ...template,
    description,
    data: { eq1: [a1, b1, c1], eq2: [a2, b2, c2], x, y, generatorType: 'SIMULTANEOUS_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   RATIO generator: a:b = x:y, given one value find the other
   ══════════════════════════════════════════════════════════ */

export function generateRatioMission(template: Mission): Mission {
  const tier = getTier();
  const ratios: [number, number][] = [[2, 3], [2, 5], [3, 4], [3, 5], [3, 7], [4, 5], [1, 3], [1, 4]];
  const [a, b] = pickRandom(ratios);
  const multiplierPools = { 1: [10, 20, 50], 2: [50, 100, 150, 200, 300, 500], 3: [200, 500, 800, 1000] };
  const multiplier = pickRandom(multiplierPools[tier]);

  const narrator = pickRandom(['曹操', '刘备']);
  const description: BilingualText = {
    zh: `比例 $${a}:${b}$，已知前项为 ${a * multiplier}，求后项。`,
    en: `Ratio $${a}:${b}$, first term is ${a * multiplier}, find second term.`,
  };

  const knownValue = a * multiplier;
  const answerValue = b * multiplier;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：什么是比例?\n比例是比较两个量的方式。\n$${a}:${b}$ 意思是"每 $${a}$ 份的一种，就有 $${b}$ 份的另一种"。`,
        en: `${narrator}: "What is a ratio?\nA ratio compares two quantities.\n$${a}:${b}$ means 'for every $${a}$ of one, there are $${b}$ of the other'."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：已知信息：\n比例是 $${a}:${b}$\n前项的实际值 = $${knownValue}$\n求后项的实际值。`,
        en: `${narrator}: "Given information:\nRatio is $${a}:${b}$\nFirst term actual value = $${knownValue}$\nFind the second term."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：找倍率(scale factor)\n$${knownValue} \\div ${a} = ${multiplier}$——每一份代表 $${multiplier}$。`,
        en: `${narrator}: "Find the scale factor\n$${knownValue} \\div ${a} = ${multiplier}$ — each part is worth $${multiplier}$."`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：用倍率乘以另一个比例份数：$${b} \\times ${multiplier} = ${answerValue}$`,
        en: `${narrator}: "Multiply the other ratio part by the scale factor: $${b} \\times ${multiplier} = ${answerValue}$"`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：答案：后项 = $${answerValue}$`,
        en: `${narrator}: "Answer: second term = $${answerValue}$"`,
      },
      highlightField: 'y',
    },
  ];

  return {
    ...template,
    description,
    data: { a, b, generatorType: 'RATIO_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SIMILARITY generator: proportional sides
   ══════════════════════════════════════════════════════════ */

export function generateSimilarityMission(template: Mission): Mission {
  const tier = getTier();
  const sidePools = {
    1: { a: [2, 3, 4, 6, 8, 12], b: [4, 6, 8, 12, 16, 24], c: [3, 4, 6, 8, 10, 12] },
    2: { a: [3, 4, 5, 6, 8, 10], b: [6, 8, 10, 12, 15, 20], c: [4, 5, 6, 7, 9, 12] },
    3: { a: [5, 8, 10, 15, 20, 25], b: [10, 16, 20, 30, 40, 50], c: [6, 8, 12, 15, 20, 25] },
  };
  const a = pickRandom(sidePools[tier].a);
  const b = pickRandom(sidePools[tier].b);
  const c = pickRandom(sidePools[tier].c);
  const correctX = (a / b) * c;

  // Ensure clean answer
  if (correctX !== Math.round(correctX * 100) / 100) return generateSimilarityMission(template);

  const narrator = pickRandom(['关羽', '赵云']);
  const description: BilingualText = {
    zh: `相似三角形：边 ${a} 对应边 ${b}，边 ${c} 对应 $x$。`,
    en: `Similar triangles: side ${a} corresponds to ${b}, side ${c} corresponds to $x$.`,
  };

  const scaleFactor = a / b;
  const tutorialSteps = [
    { text: { zh: `${narrator}：什么是"相似"?\n形状相同，大小不同。对应边的比例相同。`, en: `${narrator}: "What does 'similar' mean?\nSame shape, different size. Corresponding sides have the same ratio."` }, highlightField: 'x' },
    { text: { zh: `${narrator}：求比例系数(scale factor)：\n$\\frac{${a}}{${b}} = ${scaleFactor}$`, en: `${narrator}: "Find the scale factor:\n$\\frac{${a}}{${b}} = ${scaleFactor}$"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：找出需要求的边：\n已知第二个三角形的对应边 = $${c}$\n我们要求 $x$。`, en: `${narrator}: "Identify which side we need:\nThe corresponding side in the second triangle = $${c}$\nWe need to find $x$."` }, highlightField: 'x' },
    { text: { zh: `${narrator}：计算：\n$x = ${c} \\times ${scaleFactor} = ${correctX}$`, en: `${narrator}: "Calculate:\n$x = ${c} \\times ${scaleFactor} = ${correctX}$"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：答案：$x = ${correctX}$!`, en: `${narrator}: "Answer: $x = ${correctX}$!"` }, highlightField: 'x' },
  ];

  return {
    ...template,
    description,
    data: { a, b, c, generatorType: 'SIMILARITY_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   STATISTICS (mean) generator
   ══════════════════════════════════════════════════════════ */

export function generateStatsMeanMission(template: Mission): Mission {
  const tier = getTier();
  const countPools = { 1: [5], 2: [5, 6, 7, 8], 3: [8, 9, 10] };
  const valRanges = { 1: [5, 20] as const, 2: [10, 50] as const, 3: [20, 100] as const };
  const count = pickRandom(countPools[tier]);
  const values = Array.from({ length: count }, () => randInt(valRanges[tier][0], valRanges[tier][1]));
  const sum = values.reduce((s, v) => s + v, 0);
  const mean = sum / count;

  const narrator = pickRandom(['曹操', '诸葛亮']);
  const description: BilingualText = {
    zh: `求数据 ${values.join(', ')} 的平均值。`,
    en: `Find the mean of ${values.join(', ')}.`,
  };

  const meanRounded = Math.round(mean * 100) / 100;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：平均数是什么意思？\n想象 ${count} 个士兵站成一排，战力各不相同。\n主公问："咱们的兵整体水平怎么样？"\n你总不能把每个人的数字都报一遍吧？\n\n平均数就是：假如把所有人的战力"匀一匀"，每人能分到多少。\n一个数就能代表整体！`,
        en: `${narrator}: "What does the mean tell us?\nImagine ${count} soldiers in a line, each with different strength.\nThe lord asks: 'How strong is our army overall?'\nYou can't read out every single number!\n\nThe mean is: if we shared everyone's strength equally, how much would each get?\nOne number represents the whole group!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：数一数有多少个数\n$${values.join(', ')}$\n\n数一下……一共 $${count}$ 个数。这就是我们要除以的数。`,
        en: `${narrator}: "Count how many numbers there are\n$${values.join(', ')}$\n\nCount them... $${count}$ numbers in total. This is what we'll divide by."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：先把它们全部加起来\n$${values.join(' + ')} = ${sum}$\n\n这是所有人的战力总和——先"堆"成一大堆。`,
        en: `${narrator}: "First, add them all up\n$${values.join(' + ')} = ${sum}$\n\nThis is everyone's strength combined — pile it all together first."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：然后平均分——除以人数\n$\\frac{${sum}}{${count}} = ${meanRounded}$\n\n就像分饭：总量 ${sum}，${count} 个人分，每人 ${meanRounded}。`,
        en: `${narrator}: "Then share equally — divide by the count\n$\\frac{${sum}}{${count}} = ${meanRounded}$\n\nLike sharing food: total ${sum}, ${count} people, each gets ${meanRounded}."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n平均数 = $${meanRounded}$\n\n做得好！两步就搞定：先加后除。`,
        en: `${narrator}: "Answer\nMean = $${meanRounded}$\n\nGreat job! Just two steps: add first, then divide."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——用常识检查\n平均数应该在最小和最大之间，对不对？\n最小 = $${minVal}$，最大 = $${maxVal}$\n$${minVal} \\leq ${meanRounded} \\leq ${maxVal}$ ✓ 没问题！\n\n反算：$${meanRounded} \\times ${count} = ${meanRounded * count}$${meanRounded * count === sum ? ' = ' + sum + ' ✓ 完美！' : ' ≈ ' + sum + ' ✓ 合理！'}`,
        en: `${narrator}: "Verify — use common sense\nThe mean should be between the smallest and largest, right?\nMin = $${minVal}$, Max = $${maxVal}$\n$${minVal} \\leq ${meanRounded} \\leq ${maxVal}$ ✓ All good!\n\nReverse check: $${meanRounded} \\times ${count} = ${meanRounded * count}$${meanRounded * count === sum ? ' = ' + sum + ' ✓ Perfect!' : ' ≈ ' + sum + ' ✓ Makes sense!'}"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { values, mode: 'mean', generatorType: 'STATISTICS_MEAN_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   TRIGONOMETRY generator: tan, sin, or tan_inv
   Reads template data.func to decide mode.
   ══════════════════════════════════════════════════════════ */

export function generateTrigonometryMission(template: Mission): Mission {
  const tier = getTier();
  const func = template.data?.func as string | undefined;
  const narrator = pickRandom(['甘宁', '乐进', '赵云']);

  if (func === 'sin') {
    // sin mode: opposite / sin(angle) = hypotenuse → input c
    const angle = pickRandom([30, 45, 60]);
    const sinVal = angle === 30 ? 0.5 : angle === 45 ? Math.SQRT2 / 2 : Math.sqrt(3) / 2;
    // Pick opposite so hyp is clean-ish
    const oppPoolsTier = {
      1: angle === 30 ? [3, 4, 5, 6] : [3, 4, 5, 6],
      2: angle === 30 ? [3, 4, 5, 6, 8, 10, 50] : [3, 4, 5, 6, 8, 10],
      3: [8, 10, 12, 15, 20],
    };
    const opposite = pickRandom(oppPoolsTier[tier]);
    const hyp = opposite / sinVal;

    const description: BilingualText = {
      zh: `已知角 $${angle}^\\circ$，对边 ${opposite}，求斜边 $c$。`,
      en: `Given angle $${angle}^\\circ$, opposite ${opposite}, find hypotenuse $c$.`,
    };
    const sinValRounded = Math.round(sinVal * 10000) / 10000;
    const hypRounded = Math.round(hyp * 10000) / 10000;
    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：三角函数——直角三角形的万能工具\nSOH-CAH-TOA 口诀：\nSin = 对边/斜边，Cos = 邻边/斜边，Tan = 对边/邻边`,
          en: `${narrator}: "Trig functions — the ultimate tool for right triangles\nSOH-CAH-TOA:\nSin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent"`,
        },
        highlightField: 'c',
      },
      {
        text: {
          zh: `${narrator}：这里用 $\\sin$，因为已知对边 = ${opposite}，要求斜边 $c$`,
          en: `${narrator}: "We use $\\sin$ because we know the opposite = ${opposite} and need hypotenuse $c$"`,
        },
        highlightField: 'c',
      },
      {
        text: {
          zh: `${narrator}：写出等式：$\\sin(${angle}^\\circ) = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{${opposite}}{c}$`,
          en: `${narrator}: "Write the equation: $\\sin(${angle}^\\circ) = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{${opposite}}{c}$"`,
        },
        highlightField: 'c',
      },
      {
        text: {
          zh: `${narrator}：变形求 $c$：$c = \\frac{${opposite}}{\\sin(${angle}^\\circ)}$`,
          en: `${narrator}: "Rearrange for $c$: $c = \\frac{${opposite}}{\\sin(${angle}^\\circ)}$"`,
        },
        highlightField: 'c',
      },
      {
        text: {
          zh: `${narrator}：代入计算：$c = \\frac{${opposite}}{${sinValRounded}} = ${hypRounded}$`,
          en: `${narrator}: "Calculate: $c = \\frac{${opposite}}{${sinValRounded}} = ${hypRounded}$"`,
        },
        highlightField: 'c',
      },
      {
        text: {
          zh: `${narrator}：所以斜边 $c = ${hypRounded}$!`,
          en: `${narrator}: "So the hypotenuse $c = ${hypRounded}$!"`,
        },
        highlightField: 'c',
      },
    ];
    return { ...template, description, data: { angle, opposite, func: 'sin', generatorType: 'TRIGONOMETRY_RANDOM' }, tutorialSteps };
  }

  if (func === 'tan_inv') {
    // tan_inv mode: atan2(opposite, adjacent) → input angle
    const pairs: [number, number][] = [[1, 1], [3, 3], [5, 5], [10, 10], [30, 30], [100, 100],
      [1, Math.round(Math.tan(Math.PI / 6) * 1000) / 1000 > 0 ? 1 : 1], // fallback
    ];
    // Use known-angle combos for clean results
    const knownAngles: { opp: number; adj: number; angle: number }[] = [
      { opp: 1, adj: 1, angle: 45 }, { opp: 3, adj: 3, angle: 45 }, { opp: 5, adj: 5, angle: 45 },
      { opp: 8, adj: 8, angle: 45 }, { opp: 10, adj: 10, angle: 45 }, { opp: 15, adj: 15, angle: 45 },
      { opp: 20, adj: 20, angle: 45 }, { opp: 50, adj: 50, angle: 45 }, { opp: 100, adj: 100, angle: 45 },
    ];
    const chosen = pickRandom(knownAngles);

    const description: BilingualText = {
      zh: `已知对边 ${chosen.opp}，邻边 ${chosen.adj}，求角度 $\\theta$。`,
      en: `Given opposite ${chosen.opp}, adjacent ${chosen.adj}, find angle $\\theta$.`,
    };
    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：三角函数——直角三角形的万能工具\nSOH-CAH-TOA 口诀：\nSin = 对边/斜边，Cos = 邻边/斜边，Tan = 对边/邻边`,
          en: `${narrator}: "Trig functions — the ultimate tool for right triangles\nSOH-CAH-TOA:\nSin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent"`,
        },
        highlightField: 'angle',
      },
      {
        text: {
          zh: `${narrator}：已知对边和邻边，可以用 $\\tan$ 来求角度`,
          en: `${narrator}: "Given opposite and adjacent sides, we can use $\\tan$ to find the angle"`,
        },
        highlightField: 'angle',
      },
      {
        text: {
          zh: `${narrator}：$\\tan(\\theta) = \\frac{\\text{opposite}}{\\text{adjacent}} = \\frac{${chosen.opp}}{${chosen.adj}}$`,
          en: `${narrator}: "$\\tan(\\theta) = \\frac{\\text{opposite}}{\\text{adjacent}} = \\frac{${chosen.opp}}{${chosen.adj}}$"`,
        },
        highlightField: 'angle',
      },
      {
        text: {
          zh: `${narrator}：用反正切(arctan)求角度：$\\theta = \\tan^{-1}\\left(\\frac{${chosen.opp}}{${chosen.adj}}\\right) = \\tan^{-1}(${chosen.opp / chosen.adj})$`,
          en: `${narrator}: "Use inverse tan (arctan) to find the angle: $\\theta = \\tan^{-1}\\left(\\frac{${chosen.opp}}{${chosen.adj}}\\right) = \\tan^{-1}(${chosen.opp / chosen.adj})$"`,
        },
        highlightField: 'angle',
      },
      {
        text: {
          zh: `${narrator}：所以 $\\theta = ${chosen.angle}^\\circ$!`,
          en: `${narrator}: "So $\\theta = ${chosen.angle}^\\circ$!"`,
        },
        highlightField: 'angle',
      },
    ];
    return { ...template, description, data: { opposite: chosen.opp, adjacent: chosen.adj, func: 'tan_inv', generatorType: 'TRIGONOMETRY_RANDOM' }, tutorialSteps };
  }

  // Default: tan mode — opposite / adjacent → input tan
  const tanOppPools = { 1: [3, 4, 5, 6], 2: [3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 20], 3: [8, 10, 12, 15, 20] };
  const tanAdjPools = { 1: [4, 5, 8, 10], 2: [4, 5, 8, 10, 12, 15, 16, 20, 25], 3: [5, 8, 10, 12, 15, 20, 25] };
  const opposite = pickRandom(tanOppPools[tier]);
  const adjacent = pickRandom(tanAdjPools[tier]);
  const tanVal = opposite / adjacent;

  const description: BilingualText = {
    zh: `求正切值 $\\tan(\\theta) = ${opposite} / ${adjacent}$。`,
    en: `Find $\\tan(\\theta) = ${opposite} / ${adjacent}$.`,
  };
  const tutorialSteps = [
    { text: { zh: `${narrator}：$\\tan(\\theta) = \\text{对边}/\\text{邻边}$`, en: `${narrator}: "$\\tan(\\theta) = \\text{opposite}/\\text{adjacent}$"` }, highlightField: 'tan' },
    { text: { zh: `${narrator}：$= ${opposite} / ${adjacent}$`, en: `${narrator}: "$= ${opposite} / ${adjacent}$"` }, highlightField: 'tan' },
    { text: { zh: `${narrator}：$\\tan(\\theta) = ${Math.round(tanVal * 10000) / 10000}$！`, en: `${narrator}: "$\\tan(\\theta) = ${Math.round(tanVal * 10000) / 10000}$!"` }, highlightField: 'tan' },
  ];
  return { ...template, description, data: { opposite, adjacent, generatorType: 'TRIGONOMETRY_RANDOM' }, tutorialSteps };
}

/* ══════════════════════════════════════════════════════════
   QUADRATIC generator: y = ax² + c from two points
   topic==='Calculus' → student finds x = p2[0] (vertex x)
   otherwise → student finds a and c
   ══════════════════════════════════════════════════════════ */

export function generateQuadraticMission(template: Mission): Mission {
  const tier = getTier();
  const isCal = template.topic === 'Calculus';
  const narrator = pickRandom(['周瑜', '诸葛亮']);

  if (isCal) {
    // Calculus mode: f(x) = ax² + bx, vertex at x = -b/(2a). Student enters x = p2[0].
    const calAPools = { 1: [-1], 2: [-3, -2, -1], 3: [-3, -2, -1] };
    const calBPools = { 1: [4, 6], 2: [4, 6, 8, 10, 12], 3: [4, 6, 8, 10, 12] };
    const a = pickRandom(calAPools[tier]);
    const b = pickRandom(calBPools[tier]);
    const vertexX = -b / (2 * a);
    // Ensure clean integer
    if (vertexX !== Math.round(vertexX)) return generateQuadraticMission(template);
    const vertexY = a * vertexX * vertexX + b * vertexX;

    const description: BilingualText = {
      zh: `求 $f(x)$ 达到最大值时的 $x$。`,
      en: `Find $x$ where $f(x)$ is maximum.`,
    };
    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：抛物线的顶点——曲线的最高/最低点\n顶点公式：$x = \\frac{-b}{2a}$`,
          en: `${narrator}: "The vertex — highest or lowest point on the curve\nVertex formula: $x = \\frac{-b}{2a}$"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：我们的函数是 $f(x) = ${a}x^{2} + ${b}x$，其中 $a = ${a}$，$b = ${b}$`,
          en: `${narrator}: "Our function is $f(x) = ${a}x^{2} + ${b}x$, where $a = ${a}$, $b = ${b}$"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：代入公式：$x = \\frac{-(${b})}{2 \\times (${a})}$`,
          en: `${narrator}: "Substitute into the formula: $x = \\frac{-(${b})}{2 \\times (${a})}$"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：计算分子：$-(${b}) = ${-b}$\n计算分母：$2 \\times (${a}) = ${2 * a}$\n所以 $x = \\frac{${-b}}{${2 * a}} = ${vertexX}$`,
          en: `${narrator}: "Numerator: $-(${b}) = ${-b}$\nDenominator: $2 \\times (${a}) = ${2 * a}$\nSo $x = \\frac{${-b}}{${2 * a}} = ${vertexX}$"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：答案 $x = ${vertexX}$! 顶点在 $x = ${vertexX}$ 处，此时 $f(${vertexX}) = ${vertexY}$`,
          en: `${narrator}: "Answer: $x = ${vertexX}$! The vertex is at $x = ${vertexX}$, where $f(${vertexX}) = ${vertexY}$"`,
        },
        highlightField: 'x',
      },
    ];
    return { ...template, description, data: { p1: [0, 0], p2: [vertexX, vertexY], generatorType: 'QUADRATIC_RANDOM' }, tutorialSteps };
  }

  // Functions mode: y = ax² + c, p1=[0,c], p2=[x2, a*x2²+c]. Student finds a and c.
  const funcAPools = { 1: [-1, 1], 2: [-3, -2, -1, 1, 2, 3], 3: [-3, -2, 2, 3, 4] };
  const funcCPools = { 1: [0, 1, 2], 2: [-5, -3, 0, 3, 5, 10], 3: [-10, -5, 5, 10] };
  const a = pickRandom(funcAPools[tier]);
  const c = pickRandom(funcCPools[tier]);
  const x2 = pickRandom([1, 2, 3, 4, 5]);
  const y2 = a * x2 * x2 + c;

  const description: BilingualText = {
    zh: `求抛物线 $y = ax^2 + c$ 的系数 $a$ 和 $c$。`,
    en: `Find coefficients $a$ and $c$ of $y = ax^2 + c$.`,
  };
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：抛物线 $y = ax^{2} + c$ 经过两个点，我们要求出系数 $a$ 和 $c$`,
        en: `${narrator}: "The parabola $y = ax^{2} + c$ passes through two points — we need to find coefficients $a$ and $c$"`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：代入第一个点 $(0, ${c})$\n$y = a \\times 0^{2} + c = c$，所以 $c = ${c}$\n（$x=0$ 时 $a$ 项消失，只剩 $c$！）`,
        en: `${narrator}: "Substitute first point $(0, ${c})$\n$y = a \\times 0^{2} + c = c$, so $c = ${c}$\n(When $x=0$, the $a$ term vanishes — only $c$ remains!)"`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：现在知道 $c = ${c}$，代入第二个点 $(${x2}, ${y2})$`,
        en: `${narrator}: "Now we know $c = ${c}$, substitute the second point $(${x2}, ${y2})$"`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：$${y2} = a \\times ${x2}^{2} + ${c}$，解出 $a$`,
        en: `${narrator}: "$${y2} = a \\times ${x2}^{2} + ${c}$, solve for $a$"`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：$a = \\frac{${y2} - ${c}}{${x2}^{2}} = \\frac{${y2 - c}}{${x2 * x2}} = ${a}$`,
        en: `${narrator}: "$a = \\frac{${y2} - ${c}}{${x2}^{2}} = \\frac{${y2 - c}}{${x2 * x2}} = ${a}$"`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：答案：$a = ${a}$，$c = ${c}$!`,
        en: `${narrator}: "Answer: $a = ${a}$, $c = ${c}$!"`,
      },
      highlightField: 'c',
    },
  ];
  return { ...template, description, data: { p1: [0, c], p2: [x2, y2], generatorType: 'QUADRATIC_RANDOM' }, tutorialSteps };
}

/* ══════════════════════════════════════════════════════════
   ROOTS generator: ax² + bx + c = 0 from factored form
   Student enters either root x
   ══════════════════════════════════════════════════════════ */

export function generateRootsMission(template: Mission): Mission {
  const tier = getTier();
  const rootPools = { 1: [-3, -2, -1, 1, 2, 3], 2: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 3: [-8, -5, -3, 3, 5, 7, 8] };
  const r1 = pickRandom(rootPools[tier]);
  let r2 = pickRandom(rootPools[tier]);
  // Avoid r1 === r2 for variety (but it's not wrong)
  if (r1 === r2) r2 = r1 + pickRandom([1, 2, -1, -2]);
  // a=1: (x - r1)(x - r2) = x² - (r1+r2)x + r1*r2
  const a = 1;
  const b = -(r1 + r2);
  const c = r1 * r2;
  // Verify discriminant >= 0 (always true for real roots from factored form)
  const narrator = pickRandom(['周瑜', '曹仁', '诸葛亮']);

  const description: BilingualText = {
    zh: `求方程 $x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0$ 的一个根。`,
    en: `Find a root of $x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0$.`,
  };
  const eqStr = `x^{2} ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0`;
  const factorStr = `(x ${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})(x ${r2 >= 0 ? '-' : '+'}${Math.abs(r2)}) = 0`;
  const tutorialSteps = [
    { text: { zh: `${narrator}：什么是"求根"?\n找到让方程等于零的 $x$ 值。`, en: `${narrator}: "What does 'finding roots' mean?\nFinding the values of $x$ that make the equation equal zero."` }, highlightField: 'x' },
    { text: { zh: `${narrator}：方程是：\n$${eqStr}$`, en: `${narrator}: "The equation is:\n$${eqStr}$"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：方法：因式分解\n把方程写成 $(x - r_1)(x - r_2) = 0$ 的形式。\n我们需要两个数，乘积 = $${c}$，相加 = $${-b}$。`, en: `${narrator}: "Method: factorize\nWrite the equation as $(x - r_1)(x - r_2) = 0$.\nWe need two numbers that multiply to give $${c}$ and add to give $${-b}$."` }, highlightField: 'x' },
    { text: { zh: `${narrator}：这两个数是 $${r1}$ 和 $${r2}$：\n验证：$${r1} \\times ${r2} = ${r1 * r2}$ (= $${c}$)\n验证：$${r1} + ${r2} = ${r1 + r2}$ (= $${-b}$)`, en: `${narrator}: "The two numbers are $${r1}$ and $${r2}$:\nCheck: $${r1} \\times ${r2} = ${r1 * r2}$ (= $${c}$)\nCheck: $${r1} + ${r2} = ${r1 + r2}$ (= $${-b}$)"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：所以 $${factorStr}$\n意味着 $x = ${r1}$ 或 $x = ${r2}$`, en: `${narrator}: "So $${factorStr}$\nThis means $x = ${r1}$ or $x = ${r2}$"` }, highlightField: 'x' },
    { text: { zh: `${narrator}：答案：$x = ${r1}$ 或 $x = ${r2}$!`, en: `${narrator}: "Answer: $x = ${r1}$ or $x = ${r2}$!"` }, highlightField: 'x' },
  ];
  return { ...template, description, data: { a, b, c, generatorType: 'ROOTS_RANDOM' }, tutorialSteps };
}

/* ══════════════════════════════════════════════════════════
   DERIVATIVE generator
   func='3x^2-3': critical point → input x (data.x)
   default (x^2): slope at point → input k = 2*data.x
   ══════════════════════════════════════════════════════════ */

export function generateDerivativeMission(template: Mission): Mission {
  const tier = getTier();
  const func = template.data?.func as string | undefined;
  const narrator = pickRandom(['姜维', '诸葛亮', '刘禅']);

  if (func === '3x^2-3') {
    // f(x) = x³ - 3x → f'(x) = 3x² - 3 = 0 → x² = 1 → x = 1 (x>0)
    // Always x=1 for this function form (critical point at x=1)
    const x = 1;
    const description: BilingualText = {
      zh: `求 $f'(x) = 3x^2 - 3 = 0$ 的正根 $x$。`,
      en: `Find positive root $x$ of $f'(x) = 3x^2 - 3 = 0$.`,
    };
    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：导数等于零的点就是函数的极值点 -- 最高或最低点`,
          en: `${narrator}: "Points where the derivative equals zero are extrema — the highest or lowest points"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：我们要解 $f'(x) = 3x^{2} - 3 = 0$`,
          en: `${narrator}: "We need to solve $f'(x) = 3x^{2} - 3 = 0$"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：移项：$3x^{2} = 3$`,
          en: `${narrator}: "Rearrange: $3x^{2} = 3$"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：两边除以 3：$x^{2} = 1$，开方得 $x = 1$（取正值）`,
          en: `${narrator}: "Divide both sides by 3: $x^{2} = 1$, take the square root: $x = 1$ (positive value)"`,
        },
        highlightField: 'x',
      },
      {
        text: {
          zh: `${narrator}：答案 $x = ${x}$! 这就是函数的极值点`,
          en: `${narrator}: "Answer: $x = ${x}$! This is the extremum of the function"`,
        },
        highlightField: 'x',
      },
    ];
    return { ...template, description, data: { x, func: '3x^2-3', generatorType: 'DERIVATIVE_RANDOM' }, tutorialSteps };
  }

  // Default: y = x², slope k = 2x at point x
  const xPools = { 1: [1, 2, 3], 2: [1, 2, 3, 4, 5, -1, -2, -3], 3: [-5, -3, 3, 5, 7, 8] };
  const x = pickRandom(xPools[tier]);
  const k = 2 * x;
  const y = x * x;

  const description: BilingualText = {
    zh: `求 $y = x^2$ 在 $x = ${x}$ 处的切线斜率 $k$。`,
    en: `Find tangent slope $k$ of $y = x^2$ at $x = ${x}$.`,
  };
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：导数——函数在某一点的"变化速度"\n对于 $y = x^{2}$，导数公式：$y' = 2x$`,
        en: `${narrator}: "Derivative — the 'rate of change' at a point\nFor $y = x^{2}$, derivative formula: $y' = 2x$"`,
      },
      highlightField: 'k',
    },
    {
      text: {
        zh: `${narrator}：我们要求 $x = ${x}$ 处的斜率`,
        en: `${narrator}: "We need to find the slope at $x = ${x}$"`,
      },
      highlightField: 'k',
    },
    {
      text: {
        zh: `${narrator}：代入公式：$k = 2 \\times ${x}$`,
        en: `${narrator}: "Substitute into the formula: $k = 2 \\times ${x}$"`,
      },
      highlightField: 'k',
    },
    {
      text: {
        zh: `${narrator}：计算：$k = ${k}$`,
        en: `${narrator}: "Calculate: $k = ${k}$"`,
      },
      highlightField: 'k',
    },
    {
      text: {
        zh: `${narrator}：答案 $k = ${k}$! 在 $x = ${x}$ 处，曲线的倾斜程度是 ${k}`,
        en: `${narrator}: "Answer: $k = ${k}$! At $x = ${x}$, the steepness of the curve is ${k}"`,
      },
      highlightField: 'k',
    },
  ];
  return { ...template, description, data: { x, func: 'x^2', generatorType: 'DERIVATIVE_RANDOM' }, tutorialSteps };
}

/* ══════════════════════════════════════════════════════════
   INTEGRATION generator: definite integral
   func='x': ∫ x dx = 0.5*(u²-l²)
   func='3x^2': ∫ 3x² dx = u³-l³
   else: ∫ 2x dx = u²-l²
   ══════════════════════════════════════════════════════════ */

export function generateIntegrationMission(template: Mission): Mission {
  const tier = getTier();
  const func = template.data?.func as string;
  const narrator = pickRandom(['邓艾', '钟会', '诸葛亮']);

  const lowerPools = { 1: [0, 1], 2: [0, 1, 2], 3: [0, 2] };
  const upperOffsets = { 1: [2, 3], 2: [2, 3, 4, 5], 3: [5, 6, 8] };

  if (func === 'x') {
    const lower = pickRandom(lowerPools[tier]);
    const upper = lower + pickRandom(upperOffsets[tier]);
    const area = 0.5 * (upper * upper - lower * lower);

    const description: BilingualText = {
      zh: `求 $\\int_{${lower}}^{${upper}} x\\,dx$。`,
      en: `Find $\\int_{${lower}}^{${upper}} x\\,dx$.`,
    };
    const fUpper = 0.5 * upper * upper;
    const fLower = 0.5 * lower * lower;
    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：积分——求 $y = x$ 从 $x = ${lower}$ 到 $x = ${upper}$ 的曲线下面积`,
          en: `${narrator}: "Integration — find area under $y = x$ from $x = ${lower}$ to $x = ${upper}$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：反导数（原函数）是什么? $\\int x\\,dx = \\frac{x^{2}}{2}$`,
          en: `${narrator}: "What is the antiderivative? $\\int x\\,dx = \\frac{x^{2}}{2}$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：代入上下限：$F(${upper}) - F(${lower})$`,
          en: `${narrator}: "Substitute the limits: $F(${upper}) - F(${lower})$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：计算 $F(${upper}) = \\frac{${upper}^{2}}{2} = ${fUpper}$，$F(${lower}) = \\frac{${lower}^{2}}{2} = ${fLower}$`,
          en: `${narrator}: "Calculate $F(${upper}) = \\frac{${upper}^{2}}{2} = ${fUpper}$, $F(${lower}) = \\frac{${lower}^{2}}{2} = ${fLower}$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：相减得到面积：$${fUpper} - ${fLower} = ${area}$!`,
          en: `${narrator}: "Subtract to get the area: $${fUpper} - ${fLower} = ${area}$!"`,
        },
        highlightField: 'area',
      },
    ];
    return { ...template, description, data: { lower, upper, func: 'x', generatorType: 'INTEGRATION_RANDOM' }, tutorialSteps };
  }

  if (func === '3x^2') {
    const lower = pickRandom(tier === 3 ? [0, 1, 2] : [0, 1]);
    const upper = lower + pickRandom(tier === 1 ? [1, 2] : tier === 2 ? [1, 2, 3] : [2, 3, 4]);
    const area = upper * upper * upper - lower * lower * lower;

    const description: BilingualText = {
      zh: `求 $\\int_{${lower}}^{${upper}} 3x^2\\,dx$。`,
      en: `Find $\\int_{${lower}}^{${upper}} 3x^2\\,dx$.`,
    };
    const fUpper = upper * upper * upper;
    const fLower = lower * lower * lower;
    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：积分——求 $y = 3x^{2}$ 从 $x = ${lower}$ 到 $x = ${upper}$ 的曲线下面积`,
          en: `${narrator}: "Integration — find area under $y = 3x^{2}$ from $x = ${lower}$ to $x = ${upper}$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：反导数（原函数）是什么? $\\int 3x^{2}\\,dx = x^{3}$`,
          en: `${narrator}: "What is the antiderivative? $\\int 3x^{2}\\,dx = x^{3}$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：代入上下限：$F(${upper}) - F(${lower})$`,
          en: `${narrator}: "Substitute the limits: $F(${upper}) - F(${lower})$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：计算 $F(${upper}) = ${upper}^{3} = ${fUpper}$，$F(${lower}) = ${lower}^{3} = ${fLower}$`,
          en: `${narrator}: "Calculate $F(${upper}) = ${upper}^{3} = ${fUpper}$, $F(${lower}) = ${lower}^{3} = ${fLower}$"`,
        },
        highlightField: 'area',
      },
      {
        text: {
          zh: `${narrator}：相减得到面积：$${fUpper} - ${fLower} = ${area}$!`,
          en: `${narrator}: "Subtract to get the area: $${fUpper} - ${fLower} = ${area}$!"`,
        },
        highlightField: 'area',
      },
    ];
    return { ...template, description, data: { lower, upper, func: '3x^2', generatorType: 'INTEGRATION_RANDOM' }, tutorialSteps };
  }

  // else: ∫ 2x dx = u² - l²
  const lower = pickRandom(lowerPools[tier]);
  const upper = lower + pickRandom(tier === 1 ? [2, 3] : tier === 2 ? [2, 3, 4] : [3, 4, 6]);
  const area = upper * upper - lower * lower;

  const description: BilingualText = {
    zh: `求 $\\int_{${lower}}^{${upper}} 2x\\,dx$。`,
    en: `Find $\\int_{${lower}}^{${upper}} 2x\\,dx$.`,
  };
  const fUpper = upper * upper;
  const fLower = lower * lower;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：积分——求 $y = 2x$ 从 $x = ${lower}$ 到 $x = ${upper}$ 的曲线下面积`,
        en: `${narrator}: "Integration — find area under $y = 2x$ from $x = ${lower}$ to $x = ${upper}$"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：反导数（"导数的反操作"）\n$\\int 2x\\,dx = x^{2}$`,
        en: `${narrator}: "Antiderivative ('reverse of differentiation')\n$\\int 2x\\,dx = x^{2}$"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：代入上下限：$F(${upper}) - F(${lower})$`,
        en: `${narrator}: "Substitute the limits: $F(${upper}) - F(${lower})$"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：计算 $F(${upper}) = ${upper}^{2} = ${fUpper}$，$F(${lower}) = ${lower}^{2} = ${fLower}$`,
        en: `${narrator}: "Calculate $F(${upper}) = ${upper}^{2} = ${fUpper}$, $F(${lower}) = ${lower}^{2} = ${fLower}$"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：相减得到面积：$${fUpper} - ${fLower} = ${area}$!`,
        en: `${narrator}: "Subtract to get the area: $${fUpper} - ${fLower} = ${area}$!"`,
      },
      highlightField: 'area',
    },
  ];
  return { ...template, description, data: { lower, upper, func: '2x', generatorType: 'INTEGRATION_RANDOM' }, tutorialSteps };
}

/* ══════════════════════════════════════════════════════════
   VOLUME generator: cylinder V = pi*r²*h (or cone V = 1/3*pi*r²*h)
   ══════════════════════════════════════════════════════════ */

export function generateVolumeMission(template: Mission): Mission {
  const tier = getTier();
  const mode = template.data?.mode as string | undefined;
  const isCone = mode === 'cone';
  const radiusPools = { 1: [2, 3, 4], 2: [2, 3, 4, 5, 6, 8, 10], 3: [6, 8, 10, 12] };
  const heightPools = { 1: [3, 5, 6], 2: [5, 6, 8, 10, 12, 15, 20], 3: [10, 15, 20, 25] };
  const radius = pickRandom(radiusPools[tier]);
  const height = pickRandom(heightPools[tier]);
  const pi = template.data?.pi || 3;
  const vol = isCone ? (1 / 3) * pi * radius * radius * height : pi * radius * radius * height;
  const narrator = pickRandom(['满宠', '曹操', '刘备']);

  const description: BilingualText = isCone
    ? { zh: `求圆锥体积 $V = \\frac{1}{3}\\pi r^2 h$（$\\pi=${pi}$）。`, en: `Find cone volume $V = \\frac{1}{3}\\pi r^2 h$ ($\\pi=${pi}$).` }
    : { zh: `求圆柱体积 $V = \\pi r^2 h$（$\\pi=${pi}$）。`, en: `Find cylinder volume $V = \\pi r^2 h$ ($\\pi=${pi}$).` };

  const baseArea = pi * radius * radius;
  const tutorialSteps = [
    { text: { zh: `${narrator}：半径 ${radius}，高 ${height}，$\\pi=${pi}$`, en: `${narrator}: "Radius ${radius}, height ${height}, $\\pi=${pi}$"` }, highlightField: 'v' },
    { text: { zh: `${narrator}：底面积 = $\\pi r^2 = ${pi} \\times ${radius}^2 = ${baseArea}$`, en: `${narrator}: "Base area = $\\pi r^2 = ${pi} \\times ${radius}^2 = ${baseArea}$"` }, highlightField: 'v' },
    { text: { zh: `${narrator}：$V = ${Math.round(vol * 100) / 100}$！`, en: `${narrator}: "$V = ${Math.round(vol * 100) / 100}$!"` }, highlightField: 'v' },
  ];

  return {
    ...template,
    description,
    data: { radius, height, pi, ...(isCone ? { mode: 'cone' } : {}), generatorType: 'VOLUME_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   FUNC_VAL generator
   If m defined: y = mx + b, input y
   Else: vertex t = -b/(2a), input t
   ══════════════════════════════════════════════════════════ */

export function generateFuncValMission(template: Mission): Mission {
  const tier = getTier();
  const hasM = template.data?.m !== undefined;
  const narrator = pickRandom(['夏侯惇', '曹操', '赵云']);

  if (hasM) {
    const mPools = { 1: [1, 2], 2: [1, 2, 3, -1, -2], 3: [-3, -2, 3, 4] };
    const bPools = { 1: [0, 1, 2], 2: [-5, -3, -1, 0, 1, 2, 4, 5, 8], 3: [-8, -5, 5, 8] };
    const xPools = { 1: [1, 2, 3], 2: [1, 2, 3, 4, 5, -1, -2], 3: [-3, -2, 4, 5] };
    const m = pickRandom(mPools[tier]);
    const b = pickRandom(bPools[tier]);
    const x = pickRandom(xPools[tier]);
    const y = m * x + b;

    const description: BilingualText = {
      zh: `求 $y = ${m}x ${b >= 0 ? '+' : ''}${b}$ 在 $x=${x}$ 处的值。`,
      en: `Find $y = ${m}x ${b >= 0 ? '+' : ''}${b}$ at $x=${x}$.`,
    };
    const bSign = b >= 0 ? '+ ' + b : '- ' + Math.abs(b);
    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：函数是什么？\n你可以把函数想象成一台机器——你往里面丢一个数($x$)，它就吐出另一个数($y$)。\n每次丢同一个数进去，出来的结果一定一样。\n今天这台机器的规则是：$y = ${m}x ${bSign}$`,
          en: `${narrator}: "What is a function?\nThink of it as a machine — you feed in a number ($x$), and it spits out another ($y$).\nSame input always gives the same output.\nToday's machine rule is: $y = ${m}x ${bSign}$"`,
        },
        highlightField: 'y',
      },
      {
        text: {
          zh: `${narrator}：题目问什么？\n当 $x = ${x}$ 时，$y$ 等于多少？\n就是说——把 $${x}$ 丢进机器里，看出来什么。`,
          en: `${narrator}: "What does the problem ask?\nWhen $x = ${x}$, what is $y$?\nIn other words — feed $${x}$ into the machine and see what comes out."`,
        },
        highlightField: 'y',
      },
      {
        text: {
          zh: `${narrator}：代入——把 $x$ 换成 $${x}$\n$y = ${m} \\times ${x} ${bSign}$\n\n就是把公式里所有的 $x$ 都换成 $${x}$，其他不动。`,
          en: `${narrator}: "Substitute — replace $x$ with $${x}$\n$y = ${m} \\times ${x} ${bSign}$\n\nJust swap every $x$ in the formula with $${x}$, keep everything else."`,
        },
        highlightField: 'y',
      },
      {
        text: {
          zh: `${narrator}：按顺序计算\n先算乘法：$${m} \\times ${x} = ${m * x}$\n再${b >= 0 ? '加' : '减'}：$${m * x} ${bSign} = ${y}$`,
          en: `${narrator}: "Calculate in order\nMultiply first: $${m} \\times ${x} = ${m * x}$\nThen ${b >= 0 ? 'add' : 'subtract'}: $${m * x} ${bSign} = ${y}$"`,
        },
        highlightField: 'y',
      },
      {
        text: {
          zh: `${narrator}：答案\n$y = ${y}$\n\n机器吐出来了！当 $x = ${x}$ 时，$y = ${y}$。`,
          en: `${narrator}: "Answer\n$y = ${y}$\n\nThe machine has spoken! When $x = ${x}$, $y = ${y}$."`,
        },
        highlightField: 'y',
      },
      {
        text: {
          zh: `${narrator}：验算\n把答案代回去：$${m} \\times ${x} ${bSign} = ${m * x} ${bSign} = ${y}$ ✓\n\n恭喜！你已经学会了"代入求值"——以后碰到任何函数都用这个方法！`,
          en: `${narrator}: "Verify\nPlug the answer back: $${m} \\times ${x} ${bSign} = ${m * x} ${bSign} = ${y}$ ✓\n\nCongratulations! You've learned 'substitution' — use this method for any function!"`,
        },
        highlightField: 'y',
      },
    ];
    return { ...template, description, data: { m, b, x, generatorType: 'FUNC_VAL_RANDOM' }, tutorialSteps };
  }

  // Vertex form: t = -b/(2a)
  const a = pickRandom([-3, -2, -1, 1, 2, 3]);
  const bCoeff = pickRandom([2, 4, 6, 8, 10, 12, -2, -4, -6]);
  const t = -bCoeff / (2 * a);
  if (t !== Math.round(t * 100) / 100) return generateFuncValMission(template);

  const description: BilingualText = {
    zh: `求 $f(x) = ${a}x^2 ${bCoeff >= 0 ? '+' : ''}${bCoeff}x$ 的顶点 $t$。`,
    en: `Find vertex $t$ of $f(x) = ${a}x^2 ${bCoeff >= 0 ? '+' : ''}${bCoeff}x$.`,
  };
  const negBCoeff = -bCoeff;
  const twoA = 2 * a;
  const fOfT = a * t * t + bCoeff * t;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要找顶点？\n抛物线像一座山（或一个碗）——顶点就是**最高点或最低点**。\n${a > 0 ? '这条抛物线开口朝上，顶点是最低点——比如山谷的谷底。' : '这条抛物线开口朝下，顶点是最高点——比如箭射出后飞到最高的那一瞬间。'}\n\n找到顶点，就知道"极限在哪里"——这在军事策略中极其重要！`,
        en: `${narrator}: "Why find the vertex?\nA parabola is like a mountain (or a bowl) — the vertex is the HIGHEST or LOWEST point.\n${a > 0 ? 'This parabola opens upward, so the vertex is the lowest point — like the bottom of a valley.' : 'This parabola opens downward, so the vertex is the highest point — like an arrow at its peak.'}\n\nFind the vertex, and you know 'where the limit is' — crucial for military strategy!"`,
      },
      highlightField: 't',
    },
    {
      text: {
        zh: `${narrator}：顶点公式\n对于 $f(x) = ax^2 + bx$，顶点的横坐标：\n$$t = \\frac{-b}{2a}$$\n\n这里 $a = ${a}$，$b = ${bCoeff}$。\n就是把这两个数代进去就行——两步搞定！`,
        en: `${narrator}: "The vertex formula\nFor $f(x) = ax^2 + bx$, the vertex's x-coordinate is:\n$$t = \\frac{-b}{2a}$$\n\nHere $a = ${a}$, $b = ${bCoeff}$.\nJust plug these two numbers in — two steps and done!"`,
      },
      highlightField: 't',
    },
    {
      text: {
        zh: `${narrator}：第一步——算分子 $-b$\n$-b = -(${bCoeff}) = ${negBCoeff}$\n\n就是把 $b$ 变成相反数。${bCoeff > 0 ? '正变负！' : '负变正！'}`,
        en: `${narrator}: "Step 1 — calculate the numerator $-b$\n$-b = -(${bCoeff}) = ${negBCoeff}$\n\nJust flip the sign of $b$. ${bCoeff > 0 ? 'Positive becomes negative!' : 'Negative becomes positive!'}"`,
      },
      highlightField: 't',
    },
    {
      text: {
        zh: `${narrator}：第二步——算分母 $2a$，然后相除\n$2a = 2 \\times ${a} = ${twoA}$\n\n$t = \\frac{${negBCoeff}}{${twoA}} = ${t}$`,
        en: `${narrator}: "Step 2 — calculate denominator $2a$, then divide\n$2a = 2 \\times ${a} = ${twoA}$\n\n$t = \\frac{${negBCoeff}}{${twoA}} = ${t}$"`,
      },
      highlightField: 't',
    },
    {
      text: {
        zh: `${narrator}：答案\n顶点横坐标 $t = ${t}$\n\n${a > 0 ? '这就是抛物线的最低点位置！' : '这就是抛物线的最高点位置！'}做得好！`,
        en: `${narrator}: "Answer\nVertex x-coordinate $t = ${t}$\n\n${a > 0 ? 'This is where the parabola hits its lowest point!' : 'This is where the parabola reaches its peak!'} Well done!"`,
      },
      highlightField: 't',
    },
    {
      text: {
        zh: `${narrator}：验算——代回原函数\n$f(${t}) = ${a} \\times (${t})^2 ${bCoeff >= 0 ? '+' : ''}${bCoeff} \\times (${t}) = ${fOfT}$\n\n在 $t$ 左右各取一个点：\n$f(${t - 1}) = ${a * (t - 1) * (t - 1) + bCoeff * (t - 1)}$，$f(${t + 1}) = ${a * (t + 1) * (t + 1) + bCoeff * (t + 1)}$\n两边都${a > 0 ? '更大' : '更小'} → $t = ${t}$ 确实是${a > 0 ? '最低点' : '最高点'} ✓`,
        en: `${narrator}: "Verify — substitute back into the function\n$f(${t}) = ${a} \\times (${t})^2 ${bCoeff >= 0 ? '+' : ''}${bCoeff} \\times (${t}) = ${fOfT}$\n\nCheck a point on each side:\n$f(${t - 1}) = ${a * (t - 1) * (t - 1) + bCoeff * (t - 1)}$, $f(${t + 1}) = ${a * (t + 1) * (t + 1) + bCoeff * (t + 1)}$\nBoth are ${a > 0 ? 'higher' : 'lower'} → $t = ${t}$ really is the ${a > 0 ? 'minimum' : 'maximum'} ✓"`,
      },
      highlightField: 't',
    },
  ];
  return { ...template, description, data: { a, b: bCoeff, generatorType: 'FUNC_VAL_RANDOM' }, tutorialSteps };
}

/* ══════════════════════════════════════════════════════════
   STATISTICS MEDIAN generator
   ══════════════════════════════════════════════════════════ */

export function generateStatsMedianMission(template: Mission): Mission {
  const tier = getTier();
  const countPools: Record<DifficultyTier, number[]> = { 1: [5], 2: [5, 7], 3: [7, 9] };
  const valRanges: Record<DifficultyTier, [number, number]> = { 1: [3, 20], 2: [5, 50], 3: [10, 100] };
  const count = pickRandom(countPools[tier]);
  // Use integers for Y7 (simpler than decimals)
  const values = Array.from({ length: count }, () => randInt(valRanges[tier][0], valRanges[tier][1]));
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted[mid]; // odd count, so exact middle

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';
  const description: BilingualText = {
    zh: `求数据 $${sorted.join(', ')}$ 的中位数。`,
    en: `Find the median of $${sorted.join(', ')}$.`,
  };

  // Build position markers for visual
  const posLabels = sorted.map((v, i) => i === mid ? `**[${v}]**` : `${v}`);
  const posLabelsEn = posLabels;

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学中位数？\n想象 ${count} 个士兵按身高从矮到高站成一排。\n站在**正中间**的那个人的身高，就是中位数。\n\n为什么不直接用平均数？因为平均数容易被"极端值"带偏——\n队伍里混进一个两米的巨人，平均身高一下子被拉高了。\n但中位数稳如泰山——巨人再高，中间那个人还是那个人！`,
        en: `${narrator}: "Why learn the median?\nImagine ${count} soldiers lined up by height, shortest to tallest.\nThe height of the person standing in the EXACT MIDDLE is the median.\n\nWhy not use the mean? Because the mean gets pulled by extreme values —\na 2-metre giant sneaks in, the average shoots up.\nBut the median stays rock-solid — the middle person is still the same!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——从小到大"站队"\n原始数据：$${values.join(', ')}$\n\n让它们排好队：$${sorted.join(', ')}$\n\n排好了！就像让士兵从矮到高站整齐。\n这一步是**最关键的**——不排队就找不到真正的中间！`,
        en: `${narrator}: "Step 1 — line them up smallest to largest\nOriginal data: $${values.join(', ')}$\n\nGet them in order: $${sorted.join(', ')}$\n\nAll lined up! Like soldiers sorted by height.\nThis step is **crucial** — without sorting, you can't find the true middle!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第二步——找正中间的位置\n一共 ${count} 个数，中间是第几个？\n$(${count} + 1) \\div 2 = ${(count + 1) / 2}$\n\n所以中间是第 $${mid + 1}$ 个。口诀很简单：**总数加 1，除以 2**！`,
        en: `${narrator}: "Step 2 — find the middle position\nThere are ${count} numbers — which position is the middle?\n$(${count} + 1) \\div 2 = ${(count + 1) / 2}$\n\nSo the middle is position $${mid + 1}$. Easy formula: **total + 1, divide by 2**!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第三步——数到那个位置\n$${sorted.join(', ')}$\n\n从左边开始数：${sorted.slice(0, mid).map((v, i) => `第${i+1}个是${v}`).join('，')}……\n第 ${mid + 1} 个是 $${median}$！← 就是它——队伍的正中心！`,
        en: `${narrator}: "Step 3 — count to that position\n$${sorted.join(', ')}$\n\nCount from the left: ${sorted.slice(0, mid).map((v, i) => `${i+1}st is ${v}`).join(', ')}...\nPosition ${mid + 1} is $${median}$! ← That's it — the exact centre of the line!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n中位数 = $${median}$\n\n排队 → 找位置 → 数过去，三步搞定！你做得太棒了！`,
        en: `${narrator}: "Answer\nMedian = $${median}$\n\nSort → find position → count there. Three steps and done! You're amazing!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——两边数一数\n比 $${median}$ 小的有 ${mid} 个：$${sorted.slice(0, mid).join(', ')}$\n比 $${median}$ 大的有 ${mid} 个：$${sorted.slice(mid + 1).join(', ')}$\n两边一样多 ✓ 它确实站在正中间！\n\n小贴士：如果数据个数是**偶数**，要取中间两个的平均值哦——以后会学到！`,
        en: `${narrator}: "Verify — count both sides\nSmaller than $${median}$: ${mid} values — $${sorted.slice(0, mid).join(', ')}$\nLarger than $${median}$: ${mid} values — $${sorted.slice(mid + 1).join(', ')}$\nEqual on both sides ✓ It really is in the exact middle!\n\nTip: if there's an EVEN number of values, average the two middle ones — you'll learn that later!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { values: sorted, mode: 'median', generatorType: 'STATISTICS_MEDIAN_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   HCF generator: find highest common factor of two numbers
   ══════════════════════════════════════════════════════════ */

function gcdCalc(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function primeFactors(n: number): Map<number, number> {
  const factors = new Map<number, number>();
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.set(d, (factors.get(d) || 0) + 1);
      n /= d;
    }
    d++;
  }
  if (n > 1) factors.set(n, (factors.get(n) || 0) + 1);
  return factors;
}

function formatFactorization(n: number): string {
  const factors = primeFactors(n);
  const parts: string[] = [];
  for (const [base, exp] of [...factors.entries()].sort((a, b) => a[0] - b[0])) {
    parts.push(exp === 1 ? `${base}` : `${base}^{${exp}}`);
  }
  return parts.join(' \\times ');
}

/** Short division: finds common prime factors step by step */
function shortDivision(a: number, b: number): { steps: { prime: number; quotientA: number; quotientB: number }[]; bottomA: number; bottomB: number } {
  const steps: { prime: number; quotientA: number; quotientB: number }[] = [];
  let curA = a, curB = b;
  let d = 2;
  while (d <= Math.min(curA, curB)) {
    if (curA % d === 0 && curB % d === 0) {
      curA /= d;
      curB /= d;
      steps.push({ prime: d, quotientA: curA, quotientB: curB });
      // don't increment d — same prime might divide again
    } else {
      d++;
    }
  }
  return { steps, bottomA: curA, bottomB: curB };
}

/* ══════════════════════════════════════════════════════════
   PRIME generator: is a number prime or not?
   ══════════════════════════════════════════════════════════ */

function isPrimeCheck(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

export function generatePrimeMission(template: Mission): Mission {
  const tier = getTier();
  // Mix of primes and non-primes for variety
  const primePools: Record<DifficultyTier, number[]> = { 1: [2, 3, 5, 7, 11, 13], 2: [17, 19, 23, 29, 31, 37], 3: [41, 43, 47, 53, 59, 61, 67, 71] };
  const compositePools: Record<DifficultyTier, number[]> = { 1: [4, 6, 8, 9, 10, 12, 14, 15], 2: [16, 18, 20, 21, 22, 24, 25, 26, 27, 28], 3: [33, 35, 39, 49, 51, 55, 57, 63, 65, 69] };

  // 50% chance prime, 50% composite
  const usePrime = pickRandom([true, false]);
  const n = usePrime ? pickRandom(primePools[tier]) : pickRandom(compositePools[tier]);
  const result = isPrimeCheck(n);

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '\u8bf8\u845b\u4eae';

  const description: BilingualText = {
    zh: `$${n}$ \u662f\u8d28\u6570\u5417\uff1f\uff08\u662f = 1\uff0c\u5426 = 0\uff09`,
    en: `Is $${n}$ prime? (yes = 1, no = 0)`,
  };

  // Compute stop point for "when to stop" explanation
  const stopBase = Math.floor(Math.sqrt(n));
  const stopNext = stopBase + 1;

  // Find first factor (for composite numbers)
  let firstFactor = 0;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { firstFactor = d; break; }
  }

  // Build detailed trial division table with remainders
  const trialTable: string[] = [];
  const trialTableEn: string[] = [];
  for (let d = 2; d <= stopBase; d++) {
    const quotient = Math.floor(n / d);
    const remainder = n % d;
    if (remainder === 0) {
      trialTable.push(`${n} \u00f7 ${d} = ${quotient}\uff0c\u4f59\u6570 0 \u2192 \u2713 \u6574\u9664\u4e86\uff01`);
      trialTableEn.push(`${n} \u00f7 ${d} = ${quotient}, remainder 0 \u2192 \u2713 Divides!`);
      break;
    } else {
      trialTable.push(`${n} \u00f7 ${d} = ${quotient} \u4f59 ${remainder} \u2192 \u2717`);
      trialTableEn.push(`${n} \u00f7 ${d} = ${quotient} r ${remainder} \u2192 \u2717`);
    }
  }
  if (result) {
    trialTable.push(`\uff08${stopNext}\u00d7${stopNext}=${stopNext*stopNext} > ${n}\uff0c\u505c\u6b62\uff09`);
    trialTableEn.push(`(${stopNext}\u00d7${stopNext}=${stopNext*stopNext} > ${n}, stop)`);
  }

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：先搞懂一个词——"整除"\n$12 \\div 3 = 4$，没有余数 → 整除 ✓\n$12 \\div 5 = 2$ 余 $2$，有余数 → 不整除 ✗\n\n整除 = 除得刚刚好，一点不剩！`,
        en: `${narrator}: "First understand one word — 'divides evenly'\n$12 \\div 3 = 4$, no remainder → divides ✓\n$12 \\div 5 = 2$ r $2$, has remainder → doesn't divide ✗\n\nDivides evenly = nothing left over!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：什么是质数？\n除了 $1$ 和它自己，没有别的数能整除它——就像精锐亲卫：只效忠天子和自己。\n\n$7 \\div 2$ ✗，$7 \\div 3$ ✗ → 只有 $1$ 和 $7$ 能整除 → 质数\n$6 \\div 2 = 3$ ✓ → 有别的因数 → 不是质数`,
        en: `${narrator}: "What is a prime?\nNothing else divides it except $1$ and itself — like elite guards: only answer to the emperor.\n\n$7 \\div 2$ ✗, $7 \\div 3$ ✗ → only $1$ and $7$ work → prime\n$6 \\div 2 = 3$ ✓ → has other factors → not prime"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：两个特殊情况\n• $1$ 不是质数——"$1$ 和自己"不是两个不同的数\n• $2$ 是唯一的偶数质数——所有其他偶数都能被 $2$ 整除\n\n所以除了 $2$，所有质数都是奇数！`,
        en: `${narrator}: "Two special cases\n• $1$ is NOT prime — '1 and itself' aren't two different numbers\n• $2$ is the ONLY even prime — all other evens are divisible by $2$\n\nSo except $2$, all primes are odd!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：怎么判断 $${n}$？从 $2$ 开始逐个试除\n不用试到 $${n}$！试到 $\\sqrt{${n}}$ 就够了。\n\n$${stopBase}\\times${stopBase}=${stopBase*stopBase}$${stopBase*stopBase <= n ? ` \\leq ${n}` : ` > ${n}`}，$${stopNext}\\times${stopNext}=${stopNext*stopNext} > ${n}$\n所以只要试到 $${stopBase}$ 就够了！`,
        en: `${narrator}: "How to check $${n}$? Try dividing from $2$ up\nNo need to go to $${n}$! Up to $\\sqrt{${n}}$ is enough.\n\n$${stopBase}\\times${stopBase}=${stopBase*stopBase}$${stopBase*stopBase <= n ? ` \\leq ${n}` : ` > ${n}`}, $${stopNext}\\times${stopNext}=${stopNext*stopNext} > ${n}$\nSo we only need to test up to $${stopBase}$!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：逐个试除 $${n}$\n${trialTable.join('\n')}`,
        en: `${narrator}: "Try dividing $${n}$ one by one\n${trialTableEn.join('\n')}"`,
      },
      highlightField: 'ans',
    },
    ...(result ? [
      {
        text: {
          zh: `${narrator}：全部除不尽！$${n}$ 是质数 ✓\n除了 $1$ 和 $${n}$，没有别的数能整除它。\n\n精锐亲卫，只效忠天子和自己！`,
          en: `${narrator}: "None divide evenly! $${n}$ IS prime ✓\nOnly $1$ and $${n}$ divide it.\n\nElite guard — answers only to the emperor and himself!"`,
        },
        highlightField: 'ans',
      },
    ] : [
      {
        text: {
          zh: `${narrator}：找到了！$${n} \\div ${firstFactor} = ${n/firstFactor}$，整除了！\n$${n} = ${firstFactor} \\times ${n/firstFactor}$——能被拆开，说明有别的"上级"。\n\n$${n}$ 不是质数（是合数）✗`,
          en: `${narrator}: "Found it! $${n} \\div ${firstFactor} = ${n/firstFactor}$, divides evenly!\n$${n} = ${firstFactor} \\times ${n/firstFactor}$ — can be split, meaning other 'commanders' exist.\n\n$${n}$ is NOT prime (it's composite) ✗"`,
        },
        highlightField: 'ans',
      },
    ]),
    {
      text: {
        zh: `${narrator}：答案\n$${n}$ ${result ? '是质数 → 答 $1$' : '不是质数 → 答 $0$'}`,
        en: `${narrator}: "Answer\n$${n}$ ${result ? 'IS prime → answer $1$' : 'is NOT prime → answer $0$'}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：必背——前 10 个质数\n$2, 3, 5, 7, 11, 13, 17, 19, 23, 29$\n\n个位数：$2, 3, 5, 7$（4个）\n十几：$11, 13, 17, 19$（4个）\n二十几：$23, 29$（2个）\n\n后面做因数树会用到！做得漂亮！`,
        en: `${narrator}: "Must memorize — first 10 primes\n$2, 3, 5, 7, 11, 13, 17, 19, 23, 29$\n\nSingle digits: $2, 3, 5, 7$ (4)\nTeens: $11, 13, 17, 19$ (4)\nTwenties: $23, 29$ (2)\n\nYou'll need these for factor trees! Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n, isPrime: result, generatorType: 'PRIME_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   FACTOR_TREE generator: prime factorization of a single number
   ══════════════════════════════════════════════════════════ */

type FactorTreeNode = {
  value: number;
  isPrime?: boolean;
  children?: [FactorTreeNode, FactorTreeNode];
};

function buildFactorTree(n: number): FactorTreeNode {
  if (n <= 1) return { value: n, isPrime: true };
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      return {
        value: n,
        children: [
          { value: d, isPrime: true },
          buildFactorTree(n / d),
        ],
      };
    }
  }
  // n is prime
  return { value: n, isPrime: true };
}

function getTreeDepth(node: FactorTreeNode): number {
  if (!node.children) return 0;
  return 1 + Math.max(getTreeDepth(node.children[0]), getTreeDepth(node.children[1]));
}

function getLeaves(node: FactorTreeNode): number[] {
  if (!node.children) return [node.value];
  return [...getLeaves(node.children[0]), ...getLeaves(node.children[1])];
}

export function generateFactorTreeMission(template: Mission): Mission {
  const tier = getTier();
  const pools = {
    1: [12, 18, 20, 24, 28, 30],
    2: [36, 40, 42, 48, 54, 56, 60],
    3: [72, 84, 90, 96, 120, 180],
  };
  const n = pickRandom(pools[tier]);
  const tree = buildFactorTree(n);
  const leaves = getLeaves(tree);
  const depth = getTreeDepth(tree);
  const primeCount = leaves.length;
  const factorization = formatFactorization(n);

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[：:]/)?.[0]) || '军师';

  const description: BilingualText = {
    zh: `把 $${n}$ 拆成质数的乘积，一共有几个质因数？（重复的也算）`,
    en: `Break $${n}$ into prime factors — how many prime factors total? (count repeats)`,
  };

  // Build step-by-step factorization process for hints
  const factSteps: string[] = [];
  const factStepsEn: string[] = [];
  let remaining = n;
  let d = 2;
  while (d * d <= remaining) {
    if (remaining % d === 0) {
      factSteps.push(`${remaining} ÷ ${d} = ${remaining / d}`);
      factStepsEn.push(`${remaining} ÷ ${d} = ${remaining / d}`);
      remaining = remaining / d;
    } else {
      d++;
    }
  }
  if (remaining > 1) {
    factSteps.push(`${remaining} 是质数，停！`);
    factStepsEn.push(`${remaining} is prime, stop!`);
  }

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：${n} 个新兵要拆成最小的战斗单元——怎么拆？\n"最小单元"就是质数——只能被 $1$ 和自己整除的数。\n$2, 3, 5, 7, 11$ 都是质数。$4$ 不是（$4=2\\times2$），$6$ 不是（$6=2\\times3$）。`,
        en: `${narrator}: "${n} recruits need splitting into smallest units — how?\n'Smallest units' are primes — only divisible by $1$ and themselves.\n$2, 3, 5, 7, 11$ are primes. $4$ is not ($4=2\\times2$), $6$ is not ($6=2\\times3$)."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：画"因数树"——从 $${n}$ 开始一层层往下拆\n方法：从最小的质数 $2$ 开始试。\n能整除就拆成两个数，不能就试下一个质数（$3, 5, 7...$）。\n直到所有数都是质数为止！`,
        en: `${narrator}: "Draw a 'factor tree' — start with $${n}$, split layer by layer\nMethod: try the smallest prime $2$ first.\nDivides evenly? Split into two. Doesn't? Try the next prime ($3, 5, 7...$).\nStop when every number is prime!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：一步步拆 $${n}$\n${factSteps.join('\n')}`,
        en: `${narrator}: "Break down $${n}$ step by step\n${factStepsEn.join('\n')}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：看因数树的"叶子"——最底部不能再拆的数\n叶子们：$${leaves.join(', ')}$\n一共 $${primeCount}$ 个质因数。\n\n这些就是 $${n}$ 的"基本零件"！`,
        en: `${narrator}: "Look at the 'leaves' — bottom numbers that can't split further\nLeaves: $${leaves.join(', ')}$\nTotal: $${primeCount}$ prime factors.\n\nThese are $${n}$'s 'building blocks'!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${n} = ${factorization}$\n\n验算：$${leaves.join(' \\times ')} = ${n}$ ✓`,
        en: `${narrator}: "Answer\n$${n} = ${factorization}$\n\nVerify: $${leaves.join(' \\times ')} = ${n}$ ✓"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：神奇的事——不管怎么拆，最终结果都一样！\n这叫"算术基本定理"。试试从不同的数开始（比如先拆成 $6\\times6$ 而不是 $2\\times18$），叶子排出来一定相同。\n\n每个数的"质数配方"是唯一的——做得漂亮！`,
        en: `${narrator}: "Amazing fact — no matter how you split, the result is always the same!\nThis is the 'Fundamental Theorem of Arithmetic'. Try splitting differently (e.g. $6\\times6$ vs $2\\times18$) — the leaves are always identical.\n\nEvery number has a unique 'prime recipe' — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n, primeCount, tree, leaves, generatorType: 'FACTOR_TREE_RANDOM' },
    tutorialSteps,
  };
}

export function generateHcfMission(template: Mission): Mission {
  const tier = getTier();
  // Generate two numbers that have a non-trivial HCF
  const hcfPools = { 1: [2, 3, 4, 5, 6], 2: [4, 6, 8, 10, 12], 3: [6, 8, 12, 15, 18, 24] };
  const multPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7], 3: [3, 5, 7, 8, 9, 11] };

  const h = pickRandom(hcfPools[tier]);
  let m1 = pickRandom(multPools[tier]);
  let m2 = pickRandom(multPools[tier]);
  // Ensure m1 and m2 are coprime so HCF is exactly h
  while (gcdCalc(m1, m2) !== 1) {
    m2 = pickRandom(multPools[tier]);
  }
  const a = h * m1;
  const b = h * m2;

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[：:]/)?.[0]) || '军师';
  const description: BilingualText = {
    zh: `求 $${a}$ 和 $${b}$ 的最大公因数 (HCF)。`,
    en: `Find the Highest Common Factor (HCF) of $${a}$ and $${b}$.`,
  };

  const factA = formatFactorization(a);
  const factB = formatFactorization(b);

  // Helper: compute all factors of a number
  const factorsOf = (n: number): number[] => {
    const f: number[] = [];
    for (let i = 1; i <= n; i++) { if (n % i === 0) f.push(i); }
    return f;
  };
  const factorsA = factorsOf(a);
  const factorsB = factorsOf(b);
  const commonFactors = factorsA.filter(f => factorsB.includes(f));

  // Phase 2: Short division
  const sd = shortDivision(a, b);
  const leftCol = sd.steps.map(s => s.prime);
  const hcfFromSD = leftCol.reduce((p, c) => p * c, 1);
  const lcmFromSD = hcfFromSD * sd.bottomA * sd.bottomB;


  // Build "try primes" explanation for a given step
  const tryPrimesHint = (stepIdx: number): { zh: string; en: string } => {
    const prevA = stepIdx === 0 ? a : sd.steps[stepIdx - 1].quotientA;
    const prevB = stepIdx === 0 ? b : sd.steps[stepIdx - 1].quotientB;
    const step = sd.steps[stepIdx];
    const zhLines: string[] = [];
    const enLines: string[] = [];
    // Show trying primes from 2 up to the one that works
    for (let p = 2; p <= step.prime; p++) {
      const divA = prevA % p === 0;
      const divB = prevB % p === 0;
      if (divA && divB) {
        zhLines.push(`${p} 能同时整除 ${prevA} 和 ${prevB}? ${prevA}/${p}=${prevA/p} ✓  ${prevB}/${p}=${prevB/p} ✓ -- 可以!`);
        enLines.push(`Does ${p} divide both ${prevA} and ${prevB}? ${prevA}/${p}=${prevA/p} ✓  ${prevB}/${p}=${prevB/p} ✓ -- Yes!`);
      } else {
        const reason = !divA ? `${prevA}/${p} 除不尽` : `${prevB}/${p} 除不尽`;
        const enReason = !divA ? `${prevA}/${p} not exact` : `${prevB}/${p} not exact`;
        zhLines.push(`${p} 能同时整除 ${prevA} 和 ${prevB}? ${reason} ✗`);
        enLines.push(`Does ${p} divide both ${prevA} and ${prevB}? ${enReason} ✗`);
      }
    }
    return { zh: zhLines.join('\n'), en: enLines.join('\n') };
  };

  // Dynamic short division steps (Phase 2)
  const sdTutorialSteps: { text: { zh: string; en: string }; hint?: { zh: string; en: string }; highlightField: string }[] = [];

  // Step: intro
  sdTutorialSteps.push({
    text: {
      zh: `${narrator}：方法二——短除法！一张图同时算 HCF 和 LCM\n把 $${a}$ 和 $${b}$ 并排写，找能同时整除两个数的质数，写在左边。`,
      en: `${narrator}: "Method 2 — short division! One diagram gives both HCF and LCM\nWrite $${a}$ and $${b}$ side by side, find a prime dividing both, write it on the left."`,
    },
    highlightField: 'ans',
  });

  const tph0 = tryPrimesHint(0);
  sdTutorialSteps.push({
    text: {
      zh: `${narrator}：找能同时整除 $${a}$ 和 $${b}$ 的最小质数\n${tph0.zh}`,
      en: `${narrator}: "Find the smallest prime dividing both $${a}$ and $${b}$\n${tph0.en}"`,
    },
    highlightField: 'ans',
  });

  if (sd.steps.length === 1) {
    sdTutorialSteps.push({
      text: {
        zh: `${narrator}：底部 $${sd.bottomA}$ 和 $${sd.bottomB}$ 互质（没有公因数了），停止！`,
        en: `${narrator}: "Bottom $${sd.bottomA}$ and $${sd.bottomB}$ are coprime (no common factor) — stop!"`,
      },
      highlightField: 'ans',
    });
  } else if (sd.steps.length === 2) {
    const tph1 = tryPrimesHint(1);
    sdTutorialSteps.push({
      text: {
        zh: `${narrator}：继续找 $${sd.steps[0].quotientA}$ 和 $${sd.steps[0].quotientB}$ 的公因数\n${tph1.zh}`,
        en: `${narrator}: "Continue — common factor of $${sd.steps[0].quotientA}$ and $${sd.steps[0].quotientB}$\n${tph1.en}"`,
      },
      highlightField: 'ans',
    });
    sdTutorialSteps.push({
      text: {
        zh: `${narrator}：底部 $${sd.bottomA}$ 和 $${sd.bottomB}$ 互质，停止！`,
        en: `${narrator}: "Bottom $${sd.bottomA}$ and $${sd.bottomB}$ are coprime — stop!"`,
      },
      highlightField: 'ans',
    });
  } else {
    const tph1 = tryPrimesHint(1);
    sdTutorialSteps.push({
      text: {
        zh: `${narrator}：继续找 $${sd.steps[0].quotientA}$ 和 $${sd.steps[0].quotientB}$ 的公因数\n${tph1.zh}`,
        en: `${narrator}: "Continue — common factor of $${sd.steps[0].quotientA}$ and $${sd.steps[0].quotientB}$\n${tph1.en}"`,
      },
      highlightField: 'ans',
    });
    sdTutorialSteps.push({
      text: {
        zh: `${narrator}：继续除，直到底部两数互质\n看左边的 SVG 图——所有步骤已完成！`,
        en: `${narrator}: "Keep dividing until bottom numbers are coprime\nSee the SVG diagram — all steps complete!"`,
      },
      highlightField: 'ans',
    });
  }

  sdTutorialSteps.push({
    text: {
      zh: `${narrator}：读 HCF = 左边那列全乘起来\n$${leftCol.join(' \\times ')} = ${hcfFromSD}$\n\n左边是两个数"共同能整除"的部分，乘起来 = HCF！`,
      en: `${narrator}: "Read HCF = multiply the left column\n$${leftCol.join(' \\times ')} = ${hcfFromSD}$\n\nLeft column = shared divisible parts, product = HCF!"`,
    },
    highlightField: 'ans',
  });

  sdTutorialSteps.push({
    text: {
      zh: `${narrator}：顺便——LCM = 左边 × 底部全乘起来\n$${leftCol.join(' \\times ')} \\times ${sd.bottomA} \\times ${sd.bottomB} = ${lcmFromSD}$\n\n左边 = 公共部分，底部 = 各自剩下的，合起来 = LCM！`,
      en: `${narrator}: "Bonus — LCM = left × bottom, all multiplied\n$${leftCol.join(' \\times ')} \\times ${sd.bottomA} \\times ${sd.bottomB} = ${lcmFromSD}$\n\nLeft = shared, bottom = remainders, combined = LCM!"`,
    },
    highlightField: 'ans',
  });

  const tutorialSteps = [
    // Phase 1: listing factors
    {
      text: {
        zh: `${narrator}：$${a}$ 人和 $${b}$ 人分成一样大的小队，每队最多几人？\n"能分" = 除得尽、没有余数（$12 \\div 3 = 4$ ✓，$12 \\div 5 = 2.4$ ✗）。\n先用最简单的方法——挨个试！`,
        en: `${narrator}: "$${a}$ and $${b}$ people into equal squads — max per squad?\n'Can split' = divides evenly ($12 \\div 3 = 4$ ✓, $12 \\div 5 = 2.4$ ✗).\nSimplest method first — test one by one!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${a}$ 的因数（能整除 $${a}$ 的数）\n${factorsA.map(f => `$${a} \\div ${f} = ${a/f}$ ✓`).join('，')}\n\n$${a}$ 的因数：$${factorsA.join(', ')}$`,
        en: `${narrator}: "Factors of $${a}$ (numbers that divide $${a}$ evenly)\n${factorsA.map(f => `$${a} \\div ${f} = ${a/f}$ ✓`).join(', ')}\n\nFactors of $${a}$: $${factorsA.join(', ')}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${b}$ 的因数\n${factorsB.map(f => `$${b} \\div ${f} = ${b/f}$ ✓`).join('，')}\n\n$${b}$ 的因数：$${factorsB.join(', ')}$`,
        en: `${narrator}: "Factors of $${b}$\n${factorsB.map(f => `$${b} \\div ${f} = ${b/f}$ ✓`).join(', ')}\n\nFactors of $${b}$: $${factorsB.join(', ')}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：找两边都有的——"公因数"\n$${a}$：$${factorsA.join(', ')}$\n$${b}$：$${factorsB.join(', ')}$\n\n都有的：$${commonFactors.join(', ')}$`,
        en: `${narrator}: "Find what's in BOTH lists — 'common factors'\n$${a}$: $${factorsA.join(', ')}$\n$${b}$: $${factorsB.join(', ')}$\n\nIn both: $${commonFactors.join(', ')}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：公因数里最大的 = $${h}$ → HCF!\n验算：$${a} \\div ${h} = ${a/h}$ ✓，$${b} \\div ${h} = ${b/h}$ ✓\n\n每队 $${h}$ 人，整编完成！`,
        en: `${narrator}: "Largest common factor = $${h}$ → HCF!\nVerify: $${a} \\div ${h} = ${a/h}$ ✓, $${b} \\div ${h} = ${b/h}$ ✓\n\n$${h}$ per squad — formation complete!"`,
      },
      highlightField: 'ans',
    },
    // Phase 2: Short division (dynamic steps)
    ...sdTutorialSteps,
    // Phase 3: Prime factorization
    {
      text: {
        zh: `${narrator}：方法三——质因数分解\n$${a} = ${factA}$\n$${b} = ${factB}$\n\n和短除法本质相同，只是画法不同。`,
        en: `${narrator}: "Method 3 — prime factorization\n$${a} = ${factA}$\n$${b} = ${factB}$\n\nSame idea as short division, different notation."`,
      },
      highlightField: 'ans',
    },
    {
      text: (() => {
        const fA = primeFactors(a);
        const fB = primeFactors(b);
        const lines: string[] = [];
        const enLines: string[] = [];
        for (const [p, expA] of fA) {
          const expB = fB.get(p);
          if (expB !== undefined) {
            const minExp = Math.min(expA, expB);
            lines.push(`$${p}$：$${a}$ 有 ${expA} 个，$${b}$ 有 ${expB} 个 → 取少的 = ${minExp} 个`);
            enLines.push(`$${p}$: $${a}$ has ${expA}, $${b}$ has ${expB} → take smaller = ${minExp}`);
          }
        }
        return { zh: `${narrator}：共有质数取少的 = HCF\n${lines.join('\n')}`, en: `${narrator}: "Common primes, take smaller count = HCF\n${enLines.join('\n')}"` };
      })(),
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：HCF = $${formatFactorization(h)} = ${h}$\n三种方法，同一个答案！\n验算：$${a} \\div ${h} = ${a/h}$ ✓，$${b} \\div ${h} = ${b/h}$ ✓`,
        en: `${narrator}: "HCF = $${formatFactorization(h)} = ${h}$\nThree methods, same answer!\nVerify: $${a} \\div ${h} = ${a/h}$ ✓, $${b} \\div ${h} = ${b/h}$ ✓"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：三种方法各有用处\n• 挨个试：最简单，适合初学\n• 短除法：最快，同时求 HCF 和 LCM，推荐做题用\n• 质因数分解：适合理解原理\n\n做得漂亮！`,
        en: `${narrator}: "Each method has its use\n• Test one by one: simplest, good for beginners\n• Short division: fastest, gives both HCF and LCM, best for exams\n• Prime factorization: best for understanding theory\n\nBrilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { numbers: [a, b], generatorType: 'HCF_RANDOM', sdA: a, sdB: b, sdSteps: sd.steps, sdBottomA: sd.bottomA, sdBottomB: sd.bottomB },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   LCM generator: find least common multiple of two numbers
   ══════════════════════════════════════════════════════════ */

export function generateLcmMission(template: Mission): Mission {
  const tier = getTier();
  const hcfPools = { 1: [2, 3, 4], 2: [2, 3, 4, 5, 6], 3: [4, 6, 8, 10, 12] };
  const multPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 7], 3: [3, 5, 7, 8, 11] };

  const h = pickRandom(hcfPools[tier]);
  let m1 = pickRandom(multPools[tier]);
  let m2 = pickRandom(multPools[tier]);
  while (gcdCalc(m1, m2) !== 1) {
    m2 = pickRandom(multPools[tier]);
  }
  const a = h * m1;
  const b = h * m2;
  const lcm = (a * b) / gcdCalc(a, b);

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[：:]/)?.[0]) || '军师';
  const description: BilingualText = {
    zh: `求 $${a}$ 和 $${b}$ 的最小公倍数 (LCM)。`,
    en: `Find the Least Common Multiple (LCM) of $${a}$ and $${b}$.`,
  };

  const factA = formatFactorization(a);
  const factB = formatFactorization(b);

  // Helper: list multiples up to lcm
  const multiplesA: number[] = [];
  for (let i = 1; i * a <= lcm; i++) multiplesA.push(i * a);
  const multiplesB: number[] = [];
  for (let i = 1; i * b <= lcm; i++) multiplesB.push(i * b);
  const commonMultiples = multiplesA.filter(m => multiplesB.includes(m));

  // Phase 2: Short division
  const sdL = shortDivision(a, b);
  const leftColL = sdL.steps.map(s => s.prime);
  const hcfFromSDL = leftColL.reduce((p, c) => p * c, 1);
  const lcmFromSDL = hcfFromSDL * sdL.bottomA * sdL.bottomB;

  const tryPrimesHintL = (stepIdx: number): { zh: string; en: string } => {
    const prevA = stepIdx === 0 ? a : sdL.steps[stepIdx - 1].quotientA;
    const prevB = stepIdx === 0 ? b : sdL.steps[stepIdx - 1].quotientB;
    const step = sdL.steps[stepIdx];
    const zhLines: string[] = [];
    const enLines: string[] = [];
    for (let p = 2; p <= step.prime; p++) {
      const divA = prevA % p === 0;
      const divB = prevB % p === 0;
      if (divA && divB) {
        zhLines.push(`${p} 能同时整除 ${prevA} 和 ${prevB}? ${prevA}/${p}=${prevA/p} ✓  ${prevB}/${p}=${prevB/p} ✓ -- 可以!`);
        enLines.push(`Does ${p} divide both ${prevA} and ${prevB}? ${prevA}/${p}=${prevA/p} ✓  ${prevB}/${p}=${prevB/p} ✓ -- Yes!`);
      } else {
        const reason = !divA ? `${prevA}/${p} 除不尽` : `${prevB}/${p} 除不尽`;
        const enReason = !divA ? `${prevA}/${p} not exact` : `${prevB}/${p} not exact`;
        zhLines.push(`${p} 能同时整除 ${prevA} 和 ${prevB}? ${reason} ✗`);
        enLines.push(`Does ${p} divide both ${prevA} and ${prevB}? ${enReason} ✗`);
      }
    }
    return { zh: zhLines.join('\n'), en: enLines.join('\n') };
  };

  const sdLcmSteps: { text: { zh: string; en: string }; hint?: { zh: string; en: string }; highlightField: string }[] = [];

  // Intro
  sdLcmSteps.push({
    text: {
      zh: `${narrator}：和 HCF 的短除法画法完全一样 -- 只是读结果不同`,
      en: `${narrator}: "Same short division diagram as HCF — just read the result differently"`,
    },
    highlightField: 'ans',
  });

  const tphL0 = tryPrimesHintL(0);
  sdLcmSteps.push({
    text: {
      zh: `${narrator}：找能同时整除 $${a}$ 和 $${b}$ 的最小质数\n${tphL0.zh}`,
      en: `${narrator}: "Find the smallest prime dividing both $${a}$ and $${b}$\n${tphL0.en}"`,
    },
    highlightField: 'ans',
  });

  if (sdL.steps.length === 1) {
    sdLcmSteps.push({
      text: {
        zh: `${narrator}：底部 $${sdL.bottomA}$ 和 $${sdL.bottomB}$ 互质，停止！`,
        en: `${narrator}: "Bottom $${sdL.bottomA}$ and $${sdL.bottomB}$ are coprime — stop!"`,
      },
      highlightField: 'ans',
    });
  } else if (sdL.steps.length === 2) {
    const tphL1 = tryPrimesHintL(1);
    sdLcmSteps.push({
      text: {
        zh: `${narrator}：继续找 $${sdL.steps[0].quotientA}$ 和 $${sdL.steps[0].quotientB}$ 的公因数\n${tphL1.zh}`,
        en: `${narrator}: "Continue — common factor of $${sdL.steps[0].quotientA}$ and $${sdL.steps[0].quotientB}$\n${tphL1.en}"`,
      },
      highlightField: 'ans',
    });
    sdLcmSteps.push({
      text: {
        zh: `${narrator}：底部 $${sdL.bottomA}$ 和 $${sdL.bottomB}$ 互质，停止！`,
        en: `${narrator}: "Bottom $${sdL.bottomA}$ and $${sdL.bottomB}$ are coprime — stop!"`,
      },
      highlightField: 'ans',
    });
  } else {
    const tphL1 = tryPrimesHintL(1);
    sdLcmSteps.push({
      text: {
        zh: `${narrator}：继续找 $${sdL.steps[0].quotientA}$ 和 $${sdL.steps[0].quotientB}$ 的公因数\n${tphL1.zh}`,
        en: `${narrator}: "Continue — common factor of $${sdL.steps[0].quotientA}$ and $${sdL.steps[0].quotientB}$\n${tphL1.en}"`,
      },
      highlightField: 'ans',
    });
    sdLcmSteps.push({
      text: {
        zh: `${narrator}：继续除，直到底部两数互质\n看左边的 SVG 图——所有步骤已完成！`,
        en: `${narrator}: "Keep dividing until bottom numbers are coprime\nSee the SVG diagram — all steps complete!"`,
      },
      highlightField: 'ans',
    });
  }

  sdLcmSteps.push({
    text: {
      zh: `${narrator}：LCM = 左边 × 底部全乘起来\n$${leftColL.join(' \\times ')} \\times ${sdL.bottomA} \\times ${sdL.bottomB} = ${lcmFromSDL}$\n\n左边 = 公共部分，底部 = 各自剩余，合起来 = LCM！`,
      en: `${narrator}: "LCM = left × bottom, all multiplied\n$${leftColL.join(' \\times ')} \\times ${sdL.bottomA} \\times ${sdL.bottomB} = ${lcmFromSDL}$\n\nLeft = shared, bottom = remainders, combined = LCM!"`,
    },
    highlightField: 'ans',
  });

  sdLcmSteps.push({
    text: {
      zh: `${narrator}：为什么？\n$${a} = ${factA}$，$${b} = ${factB}$\n左边（$${leftColL.join(' \\times ')}$）= 共有部分，底部（$${sdL.bottomA}, ${sdL.bottomB}$）= 独有部分。\n全乘 = 不重不漏包含所有质因数！`,
      en: `${narrator}: "Why?\n$${a} = ${factA}$, $${b} = ${factB}$\nLeft ($${leftColL.join(' \\times ')}$) = shared, bottom ($${sdL.bottomA}, ${sdL.bottomB}$) = unique.\nMultiply all = every prime factor covered, no double-counting!"`,
    },
    highlightField: 'ans',
  });

  const tutorialSteps = [
    // Phase 1: listing multiples
    {
      text: {
        zh: `${narrator}：先用最简单的方法——列出倍数，看哪个最先"撞上"\n倍数 = 用这个数 × 1, 2, 3, 4... 得到的数。`,
        en: `${narrator}: "Simplest method first — list multiples and see which matches first\nMultiples = multiply the number by 1, 2, 3, 4..."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${a}$ 的倍数\n$${multiplesA.join(', ')}$`,
        en: `${narrator}: "Multiples of $${a}$\n$${multiplesA.join(', ')}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${b}$ 的倍数\n$${multiplesB.join(', ')}$`,
        en: `${narrator}: "Multiples of $${b}$\n$${multiplesB.join(', ')}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：找两边都有的！\n$${a}$：$${multiplesA.join(', ')}$\n$${b}$：$${multiplesB.join(', ')}$\n\n都有的：$${commonMultiples.join(', ')}$——最小的是 $${lcm}$！`,
        en: `${narrator}: "Find what's in BOTH!\n$${a}$: $${multiplesA.join(', ')}$\n$${b}$: $${multiplesB.join(', ')}$\n\nIn both: $${commonMultiples.join(', ')}$ — smallest is $${lcm}$!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：LCM($${a}$, $${b}$) = $${lcm}$\n验算：$${lcm} \\div ${a} = ${lcm/a}$ ✓，$${lcm} \\div ${b} = ${lcm/b}$ ✓\n\n"同时能被两个数整除的最小数" = 最小公倍数 (LCM)！`,
        en: `${narrator}: "LCM($${a}$, $${b}$) = $${lcm}$\nCheck: $${lcm} \\div ${a} = ${lcm/a}$ ✓, $${lcm} \\div ${b} = ${lcm/b}$ ✓\n\n'Smallest number divisible by both' = Least Common Multiple (LCM)!"`,
      },
      highlightField: 'ans',
    },
    // Phase 2: Short division (dynamic steps)
    ...sdLcmSteps,
    // Phase 3: Prime factorization
    {
      text: {
        zh: `${narrator}：方法三——质因数分解\n$${a} = ${factA}$\n$${b} = ${factB}$`,
        en: `${narrator}: "Method 3 — prime factorization\n$${a} = ${factA}$\n$${b} = ${factB}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: (() => {
        const fA = primeFactors(a);
        const fB = primeFactors(b);
        const allPrimes = new Set([...fA.keys(), ...fB.keys()]);
        const lines: string[] = [];
        const enLines: string[] = [];
        for (const p of [...allPrimes].sort((x, y) => x - y)) {
          const expA = fA.get(p) || 0;
          const expB = fB.get(p) || 0;
          lines.push(`$${p}$：$${a}$ 有 ${expA} 个，$${b}$ 有 ${expB} 个 → 取多的 = ${Math.max(expA, expB)} 个`);
          enLines.push(`$${p}$: $${a}$ has ${expA}, $${b}$ has ${expB} → take larger = ${Math.max(expA, expB)}`);
        }
        return { zh: `${narrator}：和 HCF 正好相反！HCF 取少的，LCM 取多的\n${lines.join('\n')}`, en: `${narrator}: "Opposite of HCF! HCF takes smaller, LCM takes larger\n${enLines.join('\n')}"` };
      })(),
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：LCM = $${formatFactorization(lcm)} = ${lcm}$\n三种方法，同一个答案！\n验算：$${lcm} \\div ${a} = ${lcm/a}$ ✓，$${lcm} \\div ${b} = ${lcm/b}$ ✓`,
        en: `${narrator}: "LCM = $${formatFactorization(lcm)} = ${lcm}$\nThree methods, same answer!\nVerify: $${lcm} \\div ${a} = ${lcm/a}$ ✓, $${lcm} \\div ${b} = ${lcm/b}$ ✓"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：三种方法各有用处\n• 列倍数：最简单，适合初学\n• 短除法：最快，同时求 HCF 和 LCM，推荐做题用\n• 质因数分解：适合理解原理\n\n做得漂亮！`,
        en: `${narrator}: "Each method has its use\n• List multiples: simplest, good for beginners\n• Short division: fastest, gives both HCF and LCM, best for exams\n• Prime factorization: best for understanding theory\n\nBrilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { numbers: [a, b], generatorType: 'LCM_RANDOM', sdA: a, sdB: b, sdSteps: sdL.steps, sdBottomA: sdL.bottomA, sdBottomB: sdL.bottomB },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   INTEGER_ADD generator: positive/negative number addition/subtraction
   ══════════════════════════════════════════════════════════ */

export function generateIntegerAddMission(template: Mission): Mission {
  const tier = getTier();
  const posPools = { 1: [5, 10, 15, 20, 25, 30], 2: [10, 20, 30, 40, 50], 3: [25, 40, 55, 70, 85, 100] };
  const negPools = { 1: [-5, -10, -15, -20], 2: [-10, -20, -30, -40, -50], 3: [-25, -40, -55, -70, -85] };

  // Generate operation: positive+negative, negative+negative, or mixed
  const mode = pickRandom(['pos_neg', 'neg_neg', 'mixed'] as const);
  let a: number, b: number, op: string, answer: number;

  if (mode === 'pos_neg') {
    a = pickRandom(posPools[tier]);
    b = pickRandom(negPools[tier]);
    op = '+';
    answer = a + b;
  } else if (mode === 'neg_neg') {
    a = pickRandom(negPools[tier]);
    b = pickRandom(negPools[tier]);
    op = '+';
    answer = a + b;
  } else {
    a = pickRandom([...posPools[tier], ...negPools[tier]]);
    b = pickRandom(posPools[tier]);
    op = '-';
    answer = a - b;
  }

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[：:]/)?.[0]) || '军师';
  const bStr = b < 0 ? `(${b})` : `${b}`;
  const exprStr = `${a} ${op} ${bStr}`;

  const description: BilingualText = {
    zh: `计算 $${exprStr}$`,
    en: `Calculate $${exprStr}$`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学正负数加减？\n正数 = "有/得到"，负数 = "没有/失去"。\n想象一条数线：右边越来越多（正），左边越来越少（负）。\n\n加正数 = 往右走，加负数 = 往左走。学会了就能算盈亏！`,
        en: `${narrator}: "Why learn adding/subtracting with negatives?\nPositive = 'have/gain', Negative = 'don't have/lose'.\nImagine a number line: right = more (positive), left = less (negative).\n\nAdd positive = go right, add negative = go left. Master this for profit/loss!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：题目是 $${exprStr}$，一步步来`,
        en: `${narrator}: "The expression is $${exprStr}$, step by step"`,
      },
      highlightField: 'ans',
    },
    ...(op === '+' && a >= 0 && b < 0 ? [
      {
        text: {
          zh: `${narrator}：口袋有 $${a}$，花掉 $${Math.abs(b)}$\n加一个负数 = 减去它的绝对值。\n$${b}$ 的绝对值是 $${Math.abs(b)}$，所以"加 $${b}$" = "减 $${Math.abs(b)}$"。`,
          en: `${narrator}: "Have $${a}$, spend $${Math.abs(b)}$\nAdding a negative = subtracting its absolute value.\n$${b}$'s absolute value is $${Math.abs(b)}$, so 'add $${b}$' = 'subtract $${Math.abs(b)}$'."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：$${a} + (${b}) = ${a} - ${Math.abs(b)} = ${answer}$\n\n数线验算：从 $${a}$ 出发，往左走 $${Math.abs(b)}$ 步，到达 $${answer}$。`,
          en: `${narrator}: "$${a} + (${b}) = ${a} - ${Math.abs(b)} = ${answer}$\n\nNumber line: start at $${a}$, go left $${Math.abs(b)}$ steps, reach $${answer}$."`,
        },
        highlightField: 'ans',
      },
    ] : op === '+' && a < 0 && b < 0 ? [
      {
        text: {
          zh: `${narrator}：第一笔亏 $${Math.abs(a)}$，第二笔又亏 $${Math.abs(b)}$——两笔亏损叠加！\n两个都是负的 → 去掉负号加起来 → 结果取负号。`,
          en: `${narrator}: "First loss $${Math.abs(a)}$, second loss $${Math.abs(b)}$ — losses pile up!\nBoth negative → add the numbers → result is negative."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：$${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}$，加负号 → $${answer}$\n\n数线：从 $0$ 往左 $${Math.abs(a)}$ 步到 $${a}$，再左 $${Math.abs(b)}$ 步到 $${answer}$。`,
          en: `${narrator}: "$${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(a) + Math.abs(b)}$, add minus → $${answer}$\n\nNumber line: from $0$ left $${Math.abs(a)}$ to $${a}$, then left $${Math.abs(b)}$ more to $${answer}$."`,
        },
        highlightField: 'ans',
      },
    ] : op === '-' && a >= 0 && b <= a ? [
      {
        text: {
          zh: `${narrator}：有 $${a}$，减去 $${b}$——减得够，直接减！\n这是最简单的情况：大数减小数，结果一定是正的。`,
          en: `${narrator}: "Have $${a}$, subtract $${b}$ — enough to subtract, just do it!\nSimplest case: big minus small, result is always positive."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：$${a} - ${b} = ${answer}$\n\n数线：从 $${a}$ 往左 $${b}$ 步，到 $${answer}$。`,
          en: `${narrator}: "$${a} - ${b} = ${answer}$\n\nNumber line: from $${a}$, left $${b}$ steps, reach $${answer}$."`,
        },
        highlightField: 'ans',
      },
    ] : op === '-' && a >= 0 && b > a ? [
      {
        text: {
          zh: `${narrator}：只有 $${a}$，要减 $${b}$——减不够！\n$${b} > ${a}$，减完会穿过 $0$ 变成负数。缺口就是答案的绝对值。`,
          en: `${narrator}: "Only have $${a}$, subtract $${b}$ — not enough!\n$${b} > ${a}$, subtraction crosses $0$ into negatives. The gap is the answer's size."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：交换算差值 $${b} - ${a} = ${b - a}$，加负号 → $${answer}$\n\n数线：从 $${a}$ 往左 $${b}$ 步，经过 $0$，到 $${answer}$。`,
          en: `${narrator}: "Swap: $${b} - ${a} = ${b - a}$, add minus → $${answer}$\n\nNumber line: from $${a}$, left $${b}$ steps, past $0$, reach $${answer}$."`,
        },
        highlightField: 'ans',
      },
    ] : [
      {
        text: {
          zh: `${narrator}：已经亏 $${Math.abs(a)}$，再消耗 $${b}$——亏损在增加！\n已经在负数区，再减正数 = 往更负的方向走。`,
          en: `${narrator}: "Already lost $${Math.abs(a)}$, spend $${b}$ more — losses grow!\nAlready negative, subtract positive = go even more negative."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：$${Math.abs(a)} + ${b} = ${Math.abs(a) + b}$，取负号 → $${answer}$\n\n数线：从 $${a}$ 往左 $${b}$ 步，到 $${answer}$。`,
          en: `${narrator}: "$${Math.abs(a)} + ${b} = ${Math.abs(a) + b}$, make negative → $${answer}$\n\nNumber line: from $${a}$, left $${b}$ steps, reach $${answer}$."`,
        },
        highlightField: 'ans',
      },
    ]),
    {
      text: {
        zh: `${narrator}：答案\n$${exprStr} = ${answer}$\n\n${answer >= 0 ? '结果是正数——赚了！' : '结果是负数——亏了！'}账算清了，做得漂亮！`,
        en: `${narrator}: "Answer\n$${exprStr} = ${answer}$\n\n${answer >= 0 ? 'Positive result — profit!' : 'Negative result — loss!'} All accounted for — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { a, b, op, answer, generatorType: 'INTEGER_ADD_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   FRAC_ADD generator: fraction addition/subtraction
   ══════════════════════════════════════════════════════════ */

export function generateFracAddMission(template: Mission): Mission {
  const tier = getTier();
  const denPools = { 1: [2, 3, 4, 5, 6], 2: [3, 4, 5, 6, 8, 10], 3: [4, 5, 6, 7, 8, 9, 10, 12] };

  const d1 = pickRandom(denPools[tier]);
  let d2 = pickRandom(denPools[tier]);
  while (d2 === d1) d2 = pickRandom(denPools[tier]); // different denominators

  // Ensure numerators < denominators (proper fractions)
  const n1 = pickRandom(Array.from({ length: d1 - 1 }, (_, i) => i + 1));
  const n2 = pickRandom(Array.from({ length: d2 - 1 }, (_, i) => i + 1));

  // Respect template's op if set (e.g., mission 707 is always '+', mission 708 is always '-')
  const isSubtract = template.data?.op === '-' ? true : template.data?.op === '+' ? false : pickRandom([true, false]);
  const lcd = (d1 * d2) / gcdCalc(d1, d2);
  const adjN1 = n1 * (lcd / d1);
  const adjN2 = n2 * (lcd / d2);

  // Guard: if subtraction would give 0 (equal fractions), regenerate
  if (isSubtract && adjN1 === adjN2) return generateFracAddMission(template);

  let ansNum: number, ansDen: number;
  if (isSubtract) {
    // Make sure result is positive
    if (adjN1 >= adjN2) {
      ansNum = adjN1 - adjN2;
    } else {
      ansNum = adjN2 - adjN1;
    }
  } else {
    ansNum = adjN1 + adjN2;
  }
  ansDen = lcd;

  // Simplify
  const g = gcdCalc(Math.abs(ansNum), ansDen);
  ansNum = ansNum / g;
  ansDen = ansDen / g;

  // Make sure first fraction is larger for subtraction
  let dispN1 = n1, dispD1 = d1, dispN2 = n2, dispD2 = d2;
  if (isSubtract && adjN1 < adjN2) {
    dispN1 = n2; dispD1 = d2; dispN2 = n1; dispD2 = d1;
  }

  const op = isSubtract ? '-' : '+';
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[：:]/)?.[0]) || '军师';

  const description: BilingualText = {
    zh: `计算 $\\frac{${dispN1}}{${dispD1}} ${op} \\frac{${dispN2}}{${dispD2}}$`,
    en: `Calculate $\\frac{${dispN1}}{${dispD1}} ${op} \\frac{${dispN2}}{${dispD2}}$`,
  };

  const recalcLcd = (dispD1 * dispD2) / gcdCalc(dispD1, dispD2);
  const recalcAdjN1 = dispN1 * (recalcLcd / dispD1);
  const recalcAdjN2 = dispN2 * (recalcLcd / dispD2);
  const ansDisplay = ansDen === 1 ? `${ansNum}` : `\\frac{${ansNum}}{${ansDen}}`;
  const rawAns = isSubtract ? recalcAdjN1 - recalcAdjN2 : recalcAdjN1 + recalcAdjN2;
  const needsSimplify = ansNum !== rawAns || ansDen !== recalcLcd;

  // Helper: generate multiples list for finding LCD
  const multiplesForLCD = (() => {
    const mults: string[] = [];
    const enMults: string[] = [];
    for (let i = 1; i <= recalcLcd / dispD1; i++) {
      const m = dispD1 * i;
      const ok = m % dispD2 === 0;
      if (ok) {
        mults.push(`${m} → ${m}÷${dispD2}=${m/dispD2} ✓ 找到了！`);
        enMults.push(`${m} → ${m}÷${dispD2}=${m/dispD2} ✓ Found it!`);
      } else {
        mults.push(`${m} → ${m}÷${dispD2}=${(m/dispD2).toFixed(1)} ✗`);
        enMults.push(`${m} → ${m}÷${dispD2}=${(m/dispD2).toFixed(1)} ✗`);
      }
    }
    return { zh: mults.join('\n'), en: enMults.join('\n') };
  })();

  const k1 = recalcLcd / dispD1;
  const k2 = recalcLcd / dispD2;

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么不能直接${isSubtract ? '减' : '加'}？\n你的饼切成 $${dispD1}$ 份，我的切成 $${dispD2}$ 份——每份大小不一样！\n不统一份数，就没法直接${isSubtract ? '减' : '加'}。\n\n就像你的 1 块和我的 1 块大小不同——先切成一样大的才行！`,
        en: `${narrator}: "Why can't we just ${isSubtract ? 'subtract' : 'add'} directly?\nYour pie has $${dispD1}$ pieces, mine has $${dispD2}$ — each piece is different size!\nCan't ${isSubtract ? 'subtract' : 'add'} until pieces are the same size.\n\nYour 1 piece ≠ my 1 piece — cut both the same first!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：找公分母——两块饼都切成一样多的份\n列出 $${dispD1}$ 的倍数，看哪个也能被 $${dispD2}$ 整除：\n${multiplesForLCD.zh}\n\n公分母 = $${recalcLcd}$！`,
        en: `${narrator}: "Find the common denominator — cut both pies the same\nList multiples of $${dispD1}$, check which is divisible by $${dispD2}$:\n${multiplesForLCD.en}\n\nCommon denominator = $${recalcLcd}$!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：通分第一个——$\\frac{${dispN1}}{${dispD1}}$\n分母 $${dispD1} \\to ${recalcLcd}$，乘了 $${k1}$。\n分子也必须乘 $${k1}$（不然分数值就变了）：$${dispN1} \\times ${k1} = ${recalcAdjN1}$\n\n$\\frac{${dispN1}}{${dispD1}} = \\frac{${recalcAdjN1}}{${recalcLcd}}$`,
        en: `${narrator}: "Convert first — $\\frac{${dispN1}}{${dispD1}}$\nDenominator $${dispD1} \\to ${recalcLcd}$, multiplied by $${k1}$.\nNumerator must also ×$${k1}$ (or the value changes): $${dispN1} \\times ${k1} = ${recalcAdjN1}$\n\n$\\frac{${dispN1}}{${dispD1}} = \\frac{${recalcAdjN1}}{${recalcLcd}}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：通分第二个——$\\frac{${dispN2}}{${dispD2}}$\n分母 $${dispD2} \\to ${recalcLcd}$，乘了 $${k2}$。分子也乘：$${dispN2} \\times ${k2} = ${recalcAdjN2}$\n\n$\\frac{${dispN2}}{${dispD2}} = \\frac{${recalcAdjN2}}{${recalcLcd}}$`,
        en: `${narrator}: "Convert second — $\\frac{${dispN2}}{${dispD2}}$\nDenominator $${dispD2} \\to ${recalcLcd}$, ×$${k2}$. Numerator too: $${dispN2} \\times ${k2} = ${recalcAdjN2}$\n\n$\\frac{${dispN2}}{${dispD2}} = \\frac{${recalcAdjN2}}{${recalcLcd}}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：分母相同了——直接${isSubtract ? '减' : '加'}分子！\n$\\frac{${recalcAdjN1}}{${recalcLcd}} ${op} \\frac{${recalcAdjN2}}{${recalcLcd}} = \\frac{${recalcAdjN1} ${op} ${recalcAdjN2}}{${recalcLcd}} = \\frac{${rawAns}}{${recalcLcd}}$\n\n分母不变，只${isSubtract ? '减' : '加'}分子——就这么简单！`,
        en: `${narrator}: "Same denominator now — just ${isSubtract ? 'subtract' : 'add'} numerators!\n$\\frac{${recalcAdjN1}}{${recalcLcd}} ${op} \\frac{${recalcAdjN2}}{${recalcLcd}} = \\frac{${rawAns}}{${recalcLcd}}$\n\nDenominator stays, just ${isSubtract ? 'subtract' : 'add'} numerators — that simple!"`,
      },
      highlightField: 'ans',
    },
    ...(needsSimplify ? [
      {
        text: {
          zh: `${narrator}：化简——$${rawAns}$ 和 $${recalcLcd}$ 的公因数是 $${gcdCalc(rawAns, recalcLcd)}$\n都除以 $${gcdCalc(rawAns, recalcLcd)}$：$\\frac{${rawAns} \\div ${gcdCalc(rawAns, recalcLcd)}}{${recalcLcd} \\div ${gcdCalc(rawAns, recalcLcd)}} = ${ansDisplay}$`,
          en: `${narrator}: "Simplify — $${rawAns}$ and $${recalcLcd}$ share factor $${gcdCalc(rawAns, recalcLcd)}$\nDivide both: $\\frac{${rawAns} \\div ${gcdCalc(rawAns, recalcLcd)}}{${recalcLcd} \\div ${gcdCalc(rawAns, recalcLcd)}} = ${ansDisplay}$"`,
        },
        highlightField: 'ans',
      },
    ] : [
      {
        text: {
          zh: `${narrator}：能化简吗？$${rawAns}$ 和 $${recalcLcd}$ 没有公因数——已经最简了！`,
          en: `${narrator}: "Can it simplify? $${rawAns}$ and $${recalcLcd}$ share no factors — already simplest!"`,
        },
        highlightField: 'ans',
      },
    ]),
    {
      text: {
        zh: `${narrator}：答案\n$${ansDisplay}$\n\n验算：$\\frac{${ansNum}}{${ansDen}} \\approx ${(ansNum/ansDen).toFixed(3)}$——做得漂亮！`,
        en: `${narrator}: "Answer\n$${ansDisplay}$\n\nCheck: $\\frac{${ansNum}}{${ansDen}} \\approx ${(ansNum/ansDen).toFixed(3)}$ — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n1: dispN1, d1: dispD1, n2: dispN2, d2: dispD2, op, ansNum, ansDen, generatorType: 'FRAC_ADD_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   FRAC_MUL generator: fraction multiplication/division
   ══════════════════════════════════════════════════════════ */

export function generateFracMulMission(template: Mission): Mission {
  const tier = getTier();
  const denPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 8], 3: [3, 4, 5, 6, 7, 8, 9, 10] };

  const d1 = pickRandom(denPools[tier]);
  const d2 = pickRandom(denPools[tier]);
  const n1 = pickRandom(Array.from({ length: d1 - 1 }, (_, i) => i + 1));
  const n2 = pickRandom(Array.from({ length: d2 - 1 }, (_, i) => i + 1));

  // Respect template's op: 'div' forces division, 'mul' forces multiplication, otherwise random
  const isDivide = template.data?.op === 'div' ? true : template.data?.op === 'mul' ? false : pickRandom([true, false]);

  let ansNum: number, ansDen: number;
  if (isDivide) {
    // a/b / c/d = a/b * d/c = (a*d)/(b*c)
    ansNum = n1 * d2;
    ansDen = d1 * n2;
  } else {
    // a/b * c/d = (a*c)/(b*d)
    ansNum = n1 * n2;
    ansDen = d1 * d2;
  }

  // Simplify
  const g = gcdCalc(Math.abs(ansNum), Math.abs(ansDen));
  ansNum = ansNum / g;
  ansDen = ansDen / g;

  const op = isDivide ? '\\div' : '\\times';
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[：:]/)?.[0]) || '军师';

  const description: BilingualText = {
    zh: `计算 $\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}$`,
    en: `Calculate $\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}$`,
  };

  const ansDisplay = ansDen === 1 ? `${ansNum}` : `\\frac{${ansNum}}{${ansDen}}`;
  const rawNum = isDivide ? n1 * d2 : n1 * n2;
  const rawDen = isDivide ? d1 * n2 : d1 * d2;
  const simplifyG = gcdCalc(rawNum, rawDen);
  const needsSimplify = simplifyG > 1;

  // Integer preview for multiplication mode
    const previewTotal = d1 * d2;
    const previewFirst = previewTotal * n1 / d1; // n1/d1 of total
    const previewSecond = previewFirst * n2 / d2; // n2/d2 of previewFirst

  const tutorialSteps = isDivide ? [
    {
      text: {
        zh: `${narrator}：分数除法——先用整数感受\n有 6 个苹果，每人分 2 个：$6 \\div 2 = 3$ 人。\n有 6 个苹果，每人分 $\\frac{1}{2}$ 个：$6 \\div \\frac{1}{2} = 12$ 人！\n\n注意：$6 \\div \\frac{1}{2} = 6 \\times 2 = 12$——除以分数 = 乘以倒数！`,
        en: `${narrator}: "Fraction division — feel it with whole numbers first\n6 apples, 2 per person: $6 \\div 2 = 3$ people.\n6 apples, $\\frac{1}{2}$ per person: $6 \\div \\frac{1}{2} = 12$ people!\n\nNotice: $6 \\div \\frac{1}{2} = 6 \\times 2 = 12$ — dividing by a fraction = multiplying by its reciprocal!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：什么是"倒数"？分子分母互换！\n$\\frac{${n2}}{${d2}}$ 的倒数是 $\\frac{${d2}}{${n2}}$。\n\n除以 $\\frac{${n2}}{${d2}}$ = 乘以 $\\frac{${d2}}{${n2}}$——记住这个就够了！`,
        en: `${narrator}: "What's a reciprocal? Swap numerator and denominator!\nReciprocal of $\\frac{${n2}}{${d2}}$ is $\\frac{${d2}}{${n2}}$.\n\nDivide by $\\frac{${n2}}{${d2}}$ = multiply by $\\frac{${d2}}{${n2}}$ — remember this and you're set!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：把除法变乘法\n$\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}}$\n\n翻转第二个分数，除号变乘号！`,
        en: `${narrator}: "Turn division into multiplication\n$\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}}$\n\nFlip the second fraction, change ÷ to ×!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：分子乘分子，分母乘分母\n$\\frac{${n1} \\times ${d2}}{${d1} \\times ${n2}} = \\frac{${rawNum}}{${rawDen}}$`,
        en: `${narrator}: "Tops × tops, bottoms × bottoms\n$\\frac{${n1} \\times ${d2}}{${d1} \\times ${n2}} = \\frac{${rawNum}}{${rawDen}}$"`,
      },
      highlightField: 'ans',
    },
    ...(needsSimplify ? [{
      text: {
        zh: `${narrator}：化简——$${rawNum}$ 和 $${rawDen}$ 的公因数是 $${simplifyG}$\n都除以 $${simplifyG}$：$\\frac{${rawNum} \\div ${simplifyG}}{${rawDen} \\div ${simplifyG}} = ${ansDisplay}$`,
        en: `${narrator}: "Simplify — HCF of $${rawNum}$ and $${rawDen}$ is $${simplifyG}$\nDivide both: $\\frac{${rawNum} \\div ${simplifyG}}{${rawDen} \\div ${simplifyG}} = ${ansDisplay}$"`,
      },
      highlightField: 'ans',
    }] : []),
    {
      text: {
        zh: `${narrator}：答案\n$${ansDisplay}$\n\n验算：$\\frac{${ansNum}}{${ansDen}} \\approx ${(ansNum/ansDen).toFixed(3)}$——做得漂亮！`,
        en: `${narrator}: "Answer\n$${ansDisplay}$\n\nCheck: $\\frac{${ansNum}}{${ansDen}} \\approx ${(ansNum/ansDen).toFixed(3)}$ — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ] : [
    {
      text: {
        zh: `${narrator}：分数乘法——"取一部分的一部分"\n想象 ${previewTotal} 袋粮食，先取 $\\frac{${n1}}{${d1}}$ = ${previewFirst} 袋。\n再从这 ${previewFirst} 袋里取 $\\frac{${n2}}{${d2}}$ = ${previewSecond} 袋。\n\n$${previewSecond}$ 袋占原来 $${previewTotal}$ 袋的 $\\frac{${previewSecond}}{${previewTotal}}$——这就是分数乘法！`,
        en: `${narrator}: "Fraction multiplication — 'a part of a part'\nImagine ${previewTotal} bags of grain. Take $\\frac{${n1}}{${d1}}$ = ${previewFirst} bags.\nFrom those, take $\\frac{${n2}}{${d2}}$ = ${previewSecond} bags.\n\n$${previewSecond}$ out of $${previewTotal}$ = $\\frac{${previewSecond}}{${previewTotal}}$ — that's fraction multiplication!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：规则超简单——分子×分子，分母×分母\n$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$\n\n不用通分！分数乘法比加法还简单！`,
        en: `${narrator}: "Rule is super simple — tops × tops, bottoms × bottoms\n$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$\n\nNo common denominator needed! Fraction multiplication is easier than addition!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：代入计算\n$\\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\frac{${rawNum}}{${rawDen}}$`,
        en: `${narrator}: "Substitute and calculate\n$\\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\frac{${rawNum}}{${rawDen}}$"`,
      },
      highlightField: 'ans',
    },
    ...(needsSimplify ? [{
      text: {
        zh: `${narrator}：化简——$${rawNum}$ 和 $${rawDen}$ 的公因数是 $${simplifyG}$\n都除以 $${simplifyG}$：$\\frac{${rawNum} \\div ${simplifyG}}{${rawDen} \\div ${simplifyG}} = ${ansDisplay}$`,
        en: `${narrator}: "Simplify — HCF of $${rawNum}$ and $${rawDen}$ is $${simplifyG}$\nDivide both: $\\frac{${rawNum} \\div ${simplifyG}}{${rawDen} \\div ${simplifyG}} = ${ansDisplay}$"`,
      },
      highlightField: 'ans',
    }] : []),
    {
      text: {
        zh: `${narrator}：答案\n$${ansDisplay}$\n\n分数乘法的结果通常比原来更小——取一部分的一部分，当然更少！\n验算：$\\frac{${ansNum}}{${ansDen}} \\approx ${(ansNum/ansDen).toFixed(3)}$——做得漂亮！`,
        en: `${narrator}: "Answer\n$${ansDisplay}$\n\nFraction multiplication usually gives a smaller result — a part of a part is naturally less!\nCheck: $\\frac{${ansNum}}{${ansDen}} \\approx ${(ansNum/ansDen).toFixed(3)}$ — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n1, d1, n2, d2, op: isDivide ? 'div' : 'mul', ansNum, ansDen, generatorType: 'FRAC_MUL_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SQUARE_CUBE generator: n² or n³ depending on data.mode
   ══════════════════════════════════════════════════════════ */

export function generateSquareCubeMission(template: Mission): Mission {
  const tier = getTier();
  const mode: 'square' | 'cube' = template.data?.mode ?? 'square';

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '刘备';

  let n: number;
  let answer: number;

  if (mode === 'square') {
    const pools: Record<DifficultyTier, number[]> = {
      1: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      2: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      3: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    };
    n = pickRandom(pools[tier]);
    answer = n * n;
  } else {
    const pools: Record<DifficultyTier, number[]> = {
      1: [2, 3, 4, 5],
      2: [2, 3, 4, 5, 6, 7, 8],
      3: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    n = pickRandom(pools[tier]);
    answer = n * n * n;
  }

  const description: BilingualText = mode === 'square'
    ? { zh: `计算 $${n}^2 = ?$`, en: `Calculate $${n}^2 = ?$` }
    : { zh: `计算 $${n}^3 = ?$`, en: `Calculate $${n}^3 = ?$` };

  const tutorialSteps = mode === 'square' ? [
    {
      text: {
        zh: `${narrator}：为什么叫"平方"？\n想象一块正方形的营地，边长 $${n}$ 丈。\n正方形面积 = 边长 × 边长 = $${n} \\times ${n}$。\n\n"平方"就是一个数**乘以自己**——因为正方形是"平"的！`,
        en: `${narrator}: "Why is it called 'squaring'?\nImagine a square camp, side length $${n}$.\nSquare area = side × side = $${n} \\times ${n}$.\n\n'Squaring' means a number TIMES ITSELF — because a square is flat!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${n}^2$ 就是 $${n} \\times ${n}$\n把 ${n} 个士兵排成 $${n}$ 行 $${n}$ 列的方阵——总共多少人？\n\n$${n} \\times ${n} = ${answer}$\n\n方阵排好了！`,
        en: `${narrator}: "$${n}^2$ means $${n} \\times ${n}$\nArrange soldiers in a $${n}$ × $${n}$ square formation — how many total?\n\n$${n} \\times ${n} = ${answer}$\n\nFormation complete!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${n}^2 = ${answer}$\n\n$${n}$ 的平方就是 $${answer}$——方阵里有 $${answer}$ 个士兵。`,
        en: `${narrator}: "Answer\n$${n}^2 = ${answer}$\n\n$${n}$ squared is $${answer}$ — the formation has $${answer}$ soldiers."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——$\\sqrt{${answer}} = ${n}$ ✓\n$${n} \\times ${n} = ${answer}$，反过来 $\\sqrt{${answer}} = ${n}$。\n\n平方和平方根是互逆运算——就像加和减一样！`,
        en: `${narrator}: "Verify — $\\sqrt{${answer}} = ${n}$ ✓\n$${n} \\times ${n} = ${answer}$, and $\\sqrt{${answer}} = ${n}$.\n\nSquaring and square root are inverse operations — like addition and subtraction!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：必背——前 10 个平方数\n$1^2=1$，$2^2=4$，$3^2=9$，$4^2=16$，$5^2=25$\n$6^2=36$，$7^2=49$，$8^2=64$，$9^2=81$，$10^2=100$\n\n背下这些，以后一看就知道答案！`,
        en: `${narrator}: "Must memorize — first 10 perfect squares\n$1^2=1$, $2^2=4$, $3^2=9$, $4^2=16$, $5^2=25$\n$6^2=36$, $7^2=49$, $8^2=64$, $9^2=81$, $10^2=100$\n\nMemorize these and you'll know instantly!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：小窍门——平方数的规律\n$1, 4, 9, 16, 25, 36, 49, 64, 81, 100$\n相邻平方数的差：$3, 5, 7, 9, 11, 13, 15, 17, 19$\n\n差总是连续的奇数！这就是平方的秘密。做得漂亮！`,
        en: `${narrator}: "Cool pattern — differences between squares\n$1, 4, 9, 16, 25, 36, 49, 64, 81, 100$\nDifferences: $3, 5, 7, 9, 11, 13, 15, 17, 19$\n\nAlways consecutive odd numbers! That's the secret of squares. Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ] : [
    {
      text: {
        zh: `${narrator}：为什么叫"立方"？\n想象一个正方体的粮箱，边长 $${n}$ 丈。\n正方体体积 = 边长 × 边长 × 边长 = $${n} \\times ${n} \\times ${n}$。\n\n"立方"就是一个数**乘三次**——因为正方体是"立"体的！`,
        en: `${narrator}: "Why is it called 'cubing'?\nImagine a cube-shaped crate, side $${n}$.\nCube volume = side × side × side = $${n} \\times ${n} \\times ${n}$.\n\n'Cubing' means a number TIMES ITSELF THREE TIMES — because a cube is 3D!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${n}^3$ 分两步算\n先算 $${n} \\times ${n} = ${n*n}$（一层有多少）\n再乘 $${n}$：$${n*n} \\times ${n} = ${answer}$（$${n}$ 层叠起来）\n\n就像码粮箱：$${n}$ 层，每层 $${n}$ 行 $${n}$ 列。`,
        en: `${narrator}: "$${n}^3$ in two steps\nFirst: $${n} \\times ${n} = ${n*n}$ (one layer)\nThen × $${n}$: $${n*n} \\times ${n} = ${answer}$ (stack $${n}$ layers)\n\nLike stacking crates: $${n}$ layers of $${n}$ × $${n}$."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${n}^3 = ${answer}$\n\n$${n}$ 的立方就是 $${answer}$——粮箱能装这么多！`,
        en: `${narrator}: "Answer\n$${n}^3 = ${answer}$\n\n$${n}$ cubed is $${answer}$ — that's how much the crate holds!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——$\\sqrt[3]{${answer}} = ${n}$ ✓\n$${n} \\times ${n} \\times ${n} = ${answer}$，反过来 $\\sqrt[3]{${answer}} = ${n}$。\n\n立方和立方根是互逆运算！`,
        en: `${narrator}: "Verify — $\\sqrt[3]{${answer}} = ${n}$ ✓\n$${n} \\times ${n} \\times ${n} = ${answer}$, and $\\sqrt[3]{${answer}} = ${n}$.\n\nCubing and cube root are inverse operations!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：必背——前 5 个立方数\n$1^3=1$，$2^3=8$，$3^3=27$，$4^3=64$，$5^3=125$\n\n立方数增长比平方快得多——$5^3 = 125$，但 $5^2$ 才 $25$！`,
        en: `${narrator}: "Must memorize — first 5 perfect cubes\n$1^3=1$, $2^3=8$, $3^3=27$, $4^3=64$, $5^3=125$\n\nCubes grow much faster than squares — $5^3 = 125$, but $5^2$ is only $25$!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：平方 vs 立方——对比记忆\n平方（$n^2$）= 面积（二维，$n \\times n$）\n立方（$n^3$）= 体积（三维，$n \\times n \\times n$）\n\n指数 2 = 二维，指数 3 = 三维——指数就是维度！做得漂亮！`,
        en: `${narrator}: "Square vs Cube — compare and remember\nSquare ($n^2$) = area (2D, $n \\times n$)\nCube ($n^3$) = volume (3D, $n \\times n \\times n$)\n\nExponent 2 = 2D, exponent 3 = 3D — the exponent IS the dimension! Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n, answer, mode, generatorType: 'SQUARE_CUBE_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SQUARE_ROOT generator: √n or ∛n depending on data.mode
   ══════════════════════════════════════════════════════════ */

export function generateSquareRootMission(template: Mission): Mission {
  const tier = getTier();
  const mode: 'sqrt' | 'cbrt' | 'mixed' = template.data?.mode ?? 'sqrt';

  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '关羽';

  // Decide actual operation for this question
  let op: 'sqrt' | 'cbrt';
  if (mode === 'mixed') {
    op = pickRandom(['sqrt', 'cbrt']);
  } else {
    op = mode;
  }

  let n: number;
  let answer: number;

  if (op === 'sqrt') {
    const pools: Record<DifficultyTier, number[]> = {
      1: [4, 9, 16, 25, 36, 49, 64, 81, 100],
      2: [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169],
      3: [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 324, 400],
    };
    n = pickRandom(pools[tier]);
    answer = Math.round(Math.sqrt(n));
  } else {
    const pools: Record<DifficultyTier, number[]> = {
      1: [8, 27, 64, 125],
      2: [8, 27, 64, 125, 216],
      3: [8, 27, 64, 125, 216, 343, 512, 729, 1000],
    };
    n = pickRandom(pools[tier]);
    answer = Math.round(Math.cbrt(n));
  }

  const description: BilingualText = op === 'sqrt'
    ? { zh: `计算 $\\sqrt{${n}} = ?$`, en: `Calculate $\\sqrt{${n}} = ?$` }
    : { zh: `计算 $\\sqrt[3]{${n}} = ?$`, en: `Calculate $\\sqrt[3]{${n}} = ?$` };

  const tutorialSteps = op === 'sqrt' ? [
    {
      text: {
        zh: `${narrator}：为什么要学平方根？\n侦察到敌军方阵 $${n}$ 人——每行几人？\n\n知道总面积（$${n}$），反推边长——这就是平方根！\n平方根是平方的**反操作**："谁的平方等于 $${n}$？"`,
        en: `${narrator}: "Why learn square roots?\nEnemy square formation has $${n}$ soldiers — how many per row?\n\nKnow the total area ($${n}$), find the side — that's the square root!\nSquare root is the REVERSE of squaring: 'whose square equals $${n}$?'"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：怎么找？想想哪个数乘以自己等于 $${n}$\n$${answer} \\times ${answer} = ${n}$ ✓\n\n所以 $\\sqrt{${n}} = ${answer}$——方阵每行 $${answer}$ 人！`,
        en: `${narrator}: "How to find it? Think: which number times itself equals $${n}$?\n$${answer} \\times ${answer} = ${n}$ ✓\n\nSo $\\sqrt{${n}} = ${answer}$ — $${answer}$ soldiers per row!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：如果不确定，可以试几个数\n$${answer > 2 ? `${answer-1} \\times ${answer-1} = ${(answer-1)*(answer-1)}$（太小）\n` : ''}${answer} \\times ${answer} = ${n}$（刚好！）\n${answer < 15 ? `$${answer+1} \\times ${answer+1} = ${(answer+1)*(answer+1)}$（太大）` : ''}\n\n夹在中间一试就知道了！`,
        en: `${narrator}: "If unsure, try a few numbers\n${answer > 2 ? `$${answer-1} \\times ${answer-1} = ${(answer-1)*(answer-1)}$ (too small)\n` : ''}$${answer} \\times ${answer} = ${n}$ (perfect!)\n${answer < 15 ? `$${answer+1} \\times ${answer+1} = ${(answer+1)*(answer+1)}$ (too big)` : ''}\n\nBracket it and you'll find it!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$\\sqrt{${n}} = ${answer}$`,
        en: `${narrator}: "Answer\n$\\sqrt{${n}} = ${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——平方回去\n$${answer}^2 = ${answer} \\times ${answer} = ${n}$ ✓\n\n平方和平方根是互逆运算——就像乘法和除法！`,
        en: `${narrator}: "Verify — square it back\n$${answer}^2 = ${answer} \\times ${answer} = ${n}$ ✓\n\nSquaring and square root are inverses — like multiplication and division!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：必背表\n$\\sqrt{4}=2$，$\\sqrt{9}=3$，$\\sqrt{16}=4$，$\\sqrt{25}=5$\n$\\sqrt{36}=6$，$\\sqrt{49}=7$，$\\sqrt{64}=8$，$\\sqrt{81}=9$，$\\sqrt{100}=10$\n\n背熟这些，平方根一秒搞定！做得漂亮！`,
        en: `${narrator}: "Must memorize\n$\\sqrt{4}=2$, $\\sqrt{9}=3$, $\\sqrt{16}=4$, $\\sqrt{25}=5$\n$\\sqrt{36}=6$, $\\sqrt{49}=7$, $\\sqrt{64}=8$, $\\sqrt{81}=9$, $\\sqrt{100}=10$\n\nMemorize these and square roots take one second! Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ] : [
    {
      text: {
        zh: `${narrator}：为什么要学立方根？\n粮仓体积 $${n}$ 立方，边长是多少？\n\n知道总体积，反推边长——这就是立方根！\n立方根是立方的**反操作**："谁的立方等于 $${n}$？"`,
        en: `${narrator}: "Why learn cube roots?\nWarehouse volume is $${n}$ cubic — what's the side length?\n\nKnow the volume, find the side — that's the cube root!\nCube root is the REVERSE of cubing: 'whose cube equals $${n}$?'"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：哪个数乘三次等于 $${n}$？\n$${answer} \\times ${answer} \\times ${answer} = ${n}$ ✓\n\n所以 $\\sqrt[3]{${n}} = ${answer}$——粮仓边长 $${answer}$！`,
        en: `${narrator}: "Which number times itself three times equals $${n}$?\n$${answer} \\times ${answer} \\times ${answer} = ${n}$ ✓\n\nSo $\\sqrt[3]{${n}} = ${answer}$ — warehouse side = $${answer}$!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$\\sqrt[3]{${n}} = ${answer}$`,
        en: `${narrator}: "Answer\n$\\sqrt[3]{${n}} = ${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——立方回去\n$${answer}^3 = ${answer} \\times ${answer} \\times ${answer} = ${n}$ ✓\n\n立方和立方根是互逆运算！`,
        en: `${narrator}: "Verify — cube it back\n$${answer}^3 = ${answer} \\times ${answer} \\times ${answer} = ${n}$ ✓\n\nCubing and cube root are inverses!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：必背表\n$\\sqrt[3]{8}=2$，$\\sqrt[3]{27}=3$，$\\sqrt[3]{64}=4$，$\\sqrt[3]{125}=5$\n$\\sqrt[3]{216}=6$，$\\sqrt[3]{343}=7$，$\\sqrt[3]{512}=8$，$\\sqrt[3]{729}=9$，$\\sqrt[3]{1000}=10$`,
        en: `${narrator}: "Must memorize\n$\\sqrt[3]{8}=2$, $\\sqrt[3]{27}=3$, $\\sqrt[3]{64}=4$, $\\sqrt[3]{125}=5$\n$\\sqrt[3]{216}=6$, $\\sqrt[3]{343}=7$, $\\sqrt[3]{512}=8$, $\\sqrt[3]{729}=9$, $\\sqrt[3]{1000}=10$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：平方根 vs 立方根——对比记忆\n$\\sqrt{n}$：谁 × 谁 = $n$？（面积→边长）\n$\\sqrt[3]{n}$：谁 × 谁 × 谁 = $n$？（体积→边长）\n\n根号里的小数字告诉你"乘几次"。没数字 = 2次，3 = 3次。做得漂亮！`,
        en: `${narrator}: "Square root vs Cube root — compare\n$\\sqrt{n}$: who × who = $n$? (area → side)\n$\\sqrt[3]{n}$: who × who × who = $n$? (volume → side)\n\nThe small number in the root tells you 'how many times'. No number = 2, 3 = 3. Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n, answer, op, mode, generatorType: 'SQUARE_ROOT_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SUBSTITUTION generator: evaluate expression for given x
   ══════════════════════════════════════════════════════════ */

export function generateSubstitutionMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';
  const mode: 'linear' | 'power' = template.data?.mode ?? 'linear';

  let a: number, b: number, x: number, answer: number, expr: string, exprEn: string;

  if (mode === 'power') {
    const xPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7], 3: [3, 4, 5, 6, 7, 8, 9] };
    const aPools: Record<DifficultyTier, number[]> = { 1: [1, 2, 3], 2: [2, 3, 4, 5], 3: [2, 3, 4, 5, 6] };
    x = pickRandom(xPools[tier]);
    a = pickRandom(aPools[tier]);
    b = randInt(-10, 10);
    answer = a * x * x + b;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    expr = `${a}x^2 ${bStr}`;
    exprEn = expr;
  } else {
    const xPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5, 6], 2: [2, 3, 4, 5, 6, 7, 8, 9, 10], 3: [5, 6, 7, 8, 9, 10, 12, 15] };
    const aPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7, 8], 3: [3, 5, 6, 7, 8, 9, 10, 12] };
    x = pickRandom(xPools[tier]);
    a = pickRandom(aPools[tier]);
    b = randInt(-10, 15);
    answer = a * x + b;
    const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
    expr = `${a}x ${bStr}`;
    exprEn = expr;
  }

  const description: BilingualText = {
    zh: `当 $x = ${x}$ 时，求 $${expr}$ 的值。`,
    en: `When $x = ${x}$, find the value of $${exprEn}$.`,
  };

  const bStr = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const bStrCalc = b >= 0 ? '+' : '-';
  const bAbs = Math.abs(b);

  const tutorialSteps = mode === 'power' ? [
    {
      text: {
        zh: `${narrator}：为什么要学代入？\n军师用密码传令：公式是 $${expr}$，暗号 $x = ${x}$。\n把 $x$ 代入公式，就能解读指令！\n\n公式像一台机器——放入不同的 $x$，吐出不同的答案。`,
        en: `${narrator}: "Why learn substitution?\nThe strategist sends coded orders: formula is $${expr}$, code $x = ${x}$.\nSubstitute $x$ to decode the instruction!\n\nA formula is like a machine — different $x$, different output."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：先搞懂——$${a}x^2$ 是什么意思？\n$x^2$ = $x$ 的平方 = $x \\times x$\n$${a}x^2$ = $${a} \\times x \\times x$\n\n**注意**：$${a}x^2$ 不是 $(${a}x)^2$！只有 $x$ 要平方，$${a}$ 不用。`,
        en: `${narrator}: "First — what does $${a}x^2$ mean?\n$x^2$ = $x$ squared = $x \\times x$\n$${a}x^2$ = $${a} \\times x \\times x$\n\n**Note**: $${a}x^2$ is NOT $(${a}x)^2$! Only $x$ gets squared, not $${a}$."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——代入 $x = ${x}$，先算平方\n$x^2 = ${x}^2 = ${x} \\times ${x} = ${x*x}$\n\n平方就是自己乘自己——之前学过的！`,
        en: `${narrator}: "Step 1 — substitute $x = ${x}$, square first\n$x^2 = ${x}^2 = ${x} \\times ${x} = ${x*x}$\n\nSquaring means times itself — we learned this before!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第二步——乘以系数 $${a}$\n$${a} \\times ${x*x} = ${a*x*x}$\n\n先幂后乘——运算顺序别忘了！`,
        en: `${narrator}: "Step 2 — multiply by coefficient $${a}$\n$${a} \\times ${x*x} = ${a*x*x}$\n\nPowers first, then multiply — remember the order!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第三步—— ${bStrCalc} $${bAbs}$\n$${a*x*x} ${bStr} = ${answer}$\n\n答案 = $${answer}$`,
        en: `${narrator}: "Step 3 — ${bStrCalc} $${bAbs}$\n$${a*x*x} ${bStr} = ${answer}$\n\nAnswer = $${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——完整回顾\n运算顺序：幂 → 乘除 → 加减\n\n① 平方：$${x}^2 = ${x*x}$\n② 乘系数：$${a} \\times ${x*x} = ${a*x*x}$\n③ 加减：$${a*x*x} ${bStr} = ${answer}$ ✓\n\n密码解读成功，做得漂亮！`,
        en: `${narrator}: "Verify — full review\nOrder: Powers → Multiply → Add/Sub\n\n① Square: $${x}^2 = ${x*x}$\n② Multiply: $${a} \\times ${x*x} = ${a*x*x}$\n③ Add/Sub: $${a*x*x} ${bStr} = ${answer}$ ✓\n\nCode decoded — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ] : [
    {
      text: {
        zh: `${narrator}：为什么要学代入？\n军师传令用密码：公式 $${expr}$，暗号 $x = ${x}$。\n把 $x$ 代进去就能解密！\n\n公式像一台机器——放入不同的数，吐出不同的答案。`,
        en: `${narrator}: "Why learn substitution?\nThe strategist's coded message: formula $${expr}$, code $x = ${x}$.\nSubstitute $x$ to decode!\n\nA formula is a machine — different input, different output."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：先搞懂——$${a}x$ 是什么意思？\n$${a}x$ = $${a} \\times x$（${a} 乘以 $x$）。\n字母前面的数字叫"系数"，$${a}x$ 的系数就是 $${a}$。\n\n**注意**：$${a}x$ 是乘法，不是 $${a} + x$！`,
        en: `${narrator}: "First — what does $${a}x$ mean?\n$${a}x$ = $${a} \\times x$ (${a} times $x$).\nThe number in front is the 'coefficient' — $${a}x$ has coefficient $${a}$.\n\n**Note**: $${a}x$ is multiplication, NOT $${a} + x$!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：代入！把 $x$ 换成 $${x}$\n$${a}x ${bStr}$\n→ $${a} \\times ${x} ${bStr}$\n\n所有的 $x$ 都换成 $${x}$，其他不动。`,
        en: `${narrator}: "Substitute! Replace $x$ with $${x}$\n$${a}x ${bStr}$\n→ $${a} \\times ${x} ${bStr}$\n\nReplace every $x$ with $${x}$, keep everything else."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：先算乘法\n$${a} \\times ${x} = ${a*x}$\n\n先乘除，后加减——运算顺序是铁律！`,
        en: `${narrator}: "Multiply first\n$${a} \\times ${x} = ${a*x}$\n\nMultiply before add/subtract — order of operations is law!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：再算加减\n$${a*x} ${bStr} = ${answer}$\n\n答案 = $${answer}$`,
        en: `${narrator}: "Then add/subtract\n$${a*x} ${bStr} = ${answer}$\n\nAnswer = $${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算\n$${a} \\times ${x} ${bStr} = ${a*x} ${bStr} = ${answer}$ ✓\n\n完整步骤：看清式子 → 代入 $x$ → 先乘 → 后加减。\n密码解读成功，做得漂亮！`,
        en: `${narrator}: "Verify\n$${a} \\times ${x} ${bStr} = ${a*x} ${bStr} = ${answer}$ ✓\n\nFull process: read expression → substitute $x$ → multiply first → add/sub last.\nCode decoded — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { a, b, x, answer, mode, expr, generatorType: 'SUBSTITUTION_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   PERIMETER (rectangle) generator
   ══════════════════════════════════════════════════════════ */

export function generatePerimeterRectMission(template: Mission): Mission {
  const tier = getTier();
  const lPools: Record<DifficultyTier, number[]> = { 1: [3, 4, 5, 6, 7, 8, 10], 2: [5, 8, 10, 12, 15, 18, 20], 3: [10, 15, 20, 25, 30, 35, 40, 50] };
  const wPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5, 6], 2: [3, 5, 7, 8, 10, 12, 15], 3: [8, 10, 15, 20, 25, 30] };
  const length = pickRandom(lPools[tier]);
  const width = pickRandom(wPools[tier]);
  const answer = 2 * (length + width);
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '刘备';

  const description: BilingualText = {
    zh: `长方形营地：长 $${length}$，宽 $${width}$，求周长。`,
    en: `Rectangle camp: length $${length}$, width $${width}$. Find the perimeter.`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要算周长？\n扎营第一步——围栏围起来！但围栏总共要多长？\n\n周长就是沿着图形的边走一整圈的总距离。\n想象一只蚂蚁沿着营地围墙走一圈，它走过的路 = 周长。`,
        en: `${narrator}: "Why calculate perimeter?\nFirst step in setting camp — put up the fence! But how much fencing do we need?\n\nPerimeter is the total distance walking around the edge of a shape.\nImagine an ant walking along the camp fence — distance walked = perimeter."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：长方形有 4 条边\n• 上边 = $${length}$\n• 下边 = $${length}$（和上边一样长）\n• 左边 = $${width}$\n• 右边 = $${width}$（和左边一样长）\n\n对面的边总是相等的——这就是长方形的特点！`,
        en: `${narrator}: "A rectangle has 4 sides\n• Top = $${length}$\n• Bottom = $${length}$ (same as top)\n• Left = $${width}$\n• Right = $${width}$ (same as left)\n\nOpposite sides are always equal — that's what makes it a rectangle!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：笨办法——把 4 条边全加起来\n$${length} + ${width} + ${length} + ${width}$\n$= ${length + width} + ${length + width}$\n$= ${answer}$\n\n这就是周长！虽然笨，但绝对不会错。`,
        en: `${narrator}: "Simple way — add all 4 sides\n$${length} + ${width} + ${length} + ${width}$\n$= ${length + width} + ${length + width}$\n$= ${answer}$\n\nThat's the perimeter! Simple but foolproof."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：快捷公式——因为有两对相同的边\n先把一条长和一条宽加起来：$${length} + ${width} = ${length + width}$\n然后乘以 2（因为有两对）：$2 \\times ${length + width} = ${answer}$\n\n这就是公式 $P = 2(l + w)$ 的含义！记住这个就够了。`,
        en: `${narrator}: "Shortcut — two pairs of equal sides\nAdd one length and one width: $${length} + ${width} = ${length + width}$\nMultiply by 2 (two pairs): $2 \\times ${length + width} = ${answer}$\n\nThat's what $P = 2(l + w)$ means! Remember this and you're set."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n周长 $P = ${answer}$\n\n营地的围栅需要 $${answer}$ 单位长！`,
        en: `${narrator}: "Answer\nPerimeter $P = ${answer}$\n\nThe camp fence needs $${answer}$ units of fencing!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——两种方法互相检查\n笨办法：$${length} + ${width} + ${length} + ${width} = ${answer}$ ✓\n公式法：$2 \\times (${length} + ${width}) = ${answer}$ ✓\n\n两种方法答案一样——围栅准备好了，做得漂亮！`,
        en: `${narrator}: "Verify — cross-check with both methods\nSimple: $${length} + ${width} + ${length} + ${width} = ${answer}$ ✓\nFormula: $2 \\times (${length} + ${width}) = ${answer}$ ✓\n\nBoth methods match — fencing ready, brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { length, width, answer, generatorType: 'PERIMETER_RECT_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   PERCENTAGE_OF generator: "what is p% of n?"
   ══════════════════════════════════════════════════════════ */

export function generatePercentageOfMission(template: Mission): Mission {
  const tier = getTier();
  const pctPools: Record<DifficultyTier, number[]> = { 1: [10, 20, 25, 50], 2: [5, 10, 15, 20, 25, 30, 40, 50, 75], 3: [5, 12, 15, 18, 22, 35, 45, 60, 75, 80] };
  const nPools: Record<DifficultyTier, number[]> = { 1: [40, 50, 60, 80, 100, 200], 2: [60, 80, 100, 120, 150, 200, 250, 300, 400, 500], 3: [120, 150, 200, 250, 300, 400, 500, 800, 1000] };
  const pct = pickRandom(pctPools[tier]);
  const n = pickRandom(nPools[tier]);
  const answer = n * pct / 100;
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '曹操';

  const description: BilingualText = {
    zh: `$${n}$ 的 $${pct}\\%$ 是多少？`,
    en: `What is $${pct}\\%$ of $${n}$?`,
  };

  const decimal = pct / 100;
  const tenPct = n / 10;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：什么是"百分比"？\n军粮 $${n}$ 石，要拨出 $${pct}\\%$ 给前锋营——到底拨多少？\n\n"百分"两个字拆开看："百" = 100，"分" = 份。\n百分比就是"每 100 份里取几份"。$${pct}\\%$ 就是每 100 份取 ${pct} 份。`,
        en: `${narrator}: "What is 'percentage'?\nWe have $${n}$ units of grain. $${pct}\\%$ goes to the vanguard — how much exactly?\n\n'Per cent' literally means 'per hundred'.\n$${pct}\\%$ means: out of every 100, take ${pct}."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：先想简单的——如果只有 100 石粮草\n100 石的 $${pct}\\%$ 是多少？直接取 $${pct}$ 石就好了！\n\n因为 $${pct}\\%$ = 每 100 份取 ${pct} 份。\n所以 100 里取 $${pct}$ → 答案就是 $${pct}$。超简单！`,
        en: `${narrator}: "Start simple — what if we only had 100 units?\n$${pct}\\%$ of 100? Just take $${pct}$!\n\nBecause $${pct}\\%$ = ${pct} out of every 100.\nSo from 100, take $${pct}$ → answer is $${pct}$. Super easy!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：但我们有 $${n}$ 石，不是 100 石——怎么办？\n先算 $1\\%$（把总数除以 100），再乘以 ${pct}：\n\n$1\\%$ of $${n}$ = $${n} \\div 100 = ${n/100}$\n$${pct}\\%$ of $${n}$ = $${n/100} \\times ${pct} = ${answer}$\n\n或者一步到位：$${n} \\times \\frac{${pct}}{100} = ${answer}$`,
        en: `${narrator}: "But we have $${n}$, not 100 — what do we do?\nFind $1\\%$ first (divide total by 100), then multiply by ${pct}:\n\n$1\\%$ of $${n}$ = $${n} \\div 100 = ${n/100}$\n$${pct}\\%$ of $${n}$ = $${n/100} \\times ${pct} = ${answer}$\n\nOr in one step: $${n} \\times \\frac{${pct}}{100} = ${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：小捷径——记住这些"快速百分比"\n$10\\%$ = 除以 10：$${n} \\div 10 = ${tenPct}$\n$50\\%$ = 除以 2：$${n} \\div 2 = ${n/2}$\n$25\\%$ = 除以 4：$${n} \\div 4 = ${n/4}$\n$1\\%$ = 除以 100：$${n} \\div 100 = ${n/100}$\n\n任何百分比都能用这几个"积木"拼出来！`,
        en: `${narrator}: "Shortcut — remember these 'quick percentages'\n$10\\%$ = divide by 10: $${n} \\div 10 = ${tenPct}$\n$50\\%$ = divide by 2: $${n} \\div 2 = ${n/2}$\n$25\\%$ = divide by 4: $${n} \\div 4 = ${n/4}$\n$1\\%$ = divide by 100: $${n} \\div 100 = ${n/100}$\n\nAny percentage can be built from these 'building blocks'!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${pct}\\%$ of $${n}$ = $${answer}$\n\n$${n} \\times \\frac{${pct}}{100} = ${answer}$\n前锋营获得 $${answer}$ 石军粮！`,
        en: `${narrator}: "Answer\n$${pct}\\%$ of $${n}$ = $${answer}$\n\n$${n} \\times \\frac{${pct}}{100} = ${answer}$\nThe vanguard gets $${answer}$ units of grain!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——答案合理吗？\n$${pct}\\%$ ${pct < 50 ? '不到一半' : pct === 50 ? '刚好一半' : '超过一半'}，$${n}$ 的一半是 $${n/2}$。\n$${answer}$ ${answer < n/2 ? '< ' + n/2 : answer === n/2 ? '= ' + n/2 : '> ' + n/2} ✓ 合理！\n\n军粮分配完毕，做得漂亮！`,
        en: `${narrator}: "Verify — does the answer make sense?\n$${pct}\\%$ is ${pct < 50 ? 'less than half' : pct === 50 ? 'exactly half' : 'more than half'}, half of $${n}$ is $${n/2}$.\n$${answer}$ ${answer < n/2 ? '< ' + n/2 : answer === n/2 ? '= ' + n/2 : '> ' + n/2} ✓ Makes sense!\n\nGrain allocation complete — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n, pct, answer, generatorType: 'PERCENTAGE_OF_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   ESTIMATION_ROUND generator: rounding to nearest 10/100/1000
   ══════════════════════════════════════════════════════════ */

export function generateEstimationRoundMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';

  let n: number, place: number, placeNameZh: string, placeNameEn: string, answer: number;

  if (tier === 1) {
    n = randInt(15, 95);
    place = 10;
    placeNameZh = '十位';
    placeNameEn = 'nearest 10';
  } else if (tier === 2) {
    const choices: [number, number, string, string][] = [
      [randInt(15, 995), 10, '十位', 'nearest 10'],
      [randInt(150, 9950), 100, '百位', 'nearest 100'],
    ];
    const pick = pickRandom(choices);
    [n, place, placeNameZh, placeNameEn] = pick;
  } else {
    const choices: [number, number, string, string][] = [
      [randInt(150, 9950), 100, '百位', 'nearest 100'],
      [randInt(1500, 99500), 1000, '千位', 'nearest 1000'],
    ];
    const pick = pickRandom(choices);
    [n, place, placeNameZh, placeNameEn] = pick;
  }
  answer = Math.round(n / place) * place;

  const description: BilingualText = {
    zh: `把 $${n}$ 四舍五入到${placeNameZh}。`,
    en: `Round $${n}$ to the ${placeNameEn}.`,
  };

  const decider = Math.floor((n % place) / (place / 10));
  const roundDown = Math.floor(n / place) * place;
  const roundUp = roundDown + place;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要四舍五入？\n斥候回报敌军约 $${n}$ 人——但主公不需要精确数字，大概就行！\n\n四舍五入就是找到最接近的"整数"。\n四舍五入到${placeNameZh}，就是找最近的 $${place}$ 的倍数。\n战场上没时间算精确数字，快速估算才能赢！`,
        en: `${narrator}: "Why do we need rounding?\nScouts report about $${n}$ enemies — but the general just needs a rough number!\n\nRounding means finding the nearest 'round number'.\nRounding to ${placeNameEn} = finding the nearest multiple of $${place}$.\nNo time for exact math in battle — quick estimates win wars!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：四舍五入的唯一规则——"5"是分界线\n看关键位右边那个数字：\n• $0, 1, 2, 3, 4$ → 舍（往小的走）\n• $5, 6, 7, 8, 9$ → 入（往大的走）\n\n为什么 5 归"入"？因为 5 正好在中间，约定归大。就这一条规则！`,
        en: `${narrator}: "The ONE rule of rounding — '5' is the dividing line\nLook at the digit right after the rounding position:\n• $0, 1, 2, 3, 4$ → round DOWN\n• $5, 6, 7, 8, 9$ → round UP\n\nWhy does 5 round up? It's exactly in the middle — by convention we go up. Just this one rule!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${n}$ 夹在哪两个"整数"之间？\n$${n}$ 在 $${roundDown}$ 和 $${roundUp}$ 之间。\n\n想象一条数轴：\n$${roundDown}$ ←——— $${n}$ ———→ $${roundUp}$\n\n$${n}$ 离哪个更近？看下一步就知道！`,
        en: `${narrator}: "$${n}$ sits between which two round numbers?\n$${n}$ is between $${roundDown}$ and $${roundUp}$.\n\nImagine a number line:\n$${roundDown}$ ←——— $${n}$ ———→ $${roundUp}$\n\nWhich is $${n}$ closer to? Next step reveals it!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：看关键的那一位数字\n${placeNameZh}右边紧挨着的那个数字是 $${decider}$。\n\n$${decider}$ ${decider >= 5 ? `$\\geq 5$ → 入！往大的走（$${roundUp}$）` : `$< 5$ → 舍！往小的走（$${roundDown}$）`}\n\n就这么简单——一个数字决定方向！`,
        en: `${narrator}: "Look at the key digit\nThe digit right after the ${placeNameEn} position is $${decider}$.\n\n$${decider}$ ${decider >= 5 ? `$\\geq 5$ → round UP! Go to $${roundUp}$` : `$< 5$ → round DOWN! Go to $${roundDown}$`}\n\nThat simple — one digit decides the direction!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${n}$ 四舍五入到${placeNameZh} $= ${answer}$\n\n关键数字 $${decider}$ ${decider >= 5 ? `$\\geq 5$，进位到 $${roundUp}$` : `$< 5$，舍去到 $${roundDown}$`}。做得好！`,
        en: `${narrator}: "Answer\n$${n}$ rounded to ${placeNameEn} $= ${answer}$\n\nKey digit $${decider}$ ${decider >= 5 ? `$\\geq 5$, round up to $${roundUp}$` : `$< 5$, round down to $${roundDown}$`}. Well done!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算\n• $${answer}$ 是 $${place}$ 的倍数吗？$${answer} \\div ${place} = ${answer/place}$ ✓\n• $${n}$ 和 $${answer}$ 差多少？$|${n} - ${answer}| = ${Math.abs(n - answer)}$\n• 差距不超过 $${place/2}$？$${Math.abs(n - answer)} ${Math.abs(n - answer) <= place/2 ? '\\leq' : '>'} ${place/2}$ ✓\n\n军情估算完毕，万无一失！`,
        en: `${narrator}: "Verify\n• Is $${answer}$ a multiple of $${place}$? $${answer} \\div ${place} = ${answer/place}$ ✓\n• Difference: $|${n} - ${answer}| = ${Math.abs(n - answer)}$\n• Within $${place/2}$? $${Math.abs(n - answer)} ${Math.abs(n - answer) <= place/2 ? '\\leq' : '>'} ${place/2}$ ✓\n\nIntelligence estimate complete — spot on!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n, place, answer, generatorType: 'ESTIMATION_ROUND_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   ANGLES_TRIANGLE generator: find missing angle in a triangle
   ══════════════════════════════════════════════════════════ */

export function generateAnglesTriangleMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '关羽';

  const ranges: Record<DifficultyTier, [number, number]> = { 1: [30, 80], 2: [20, 90], 3: [15, 120] };
  const a1 = randInt(ranges[tier][0], ranges[tier][1]);
  const maxA2 = Math.min(ranges[tier][1], 180 - a1 - 10);
  const minA2 = Math.max(ranges[tier][0], 10);
  const a2 = randInt(Math.min(minA2, maxA2), maxA2);
  const answer = 180 - a1 - a2;

  const description: BilingualText = {
    zh: `三角形两个角分别是 $${a1}°$ 和 $${a2}°$，第三个角是多少？`,
    en: `A triangle has angles $${a1}°$ and $${a2}°$. Find the third angle.`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要算三角形的角？\n三角旗只知道两个角，第三个角不知道——没有它，裁缝就没法裁布！\n\n好消息：三角形有一个神奇的规律，只要知道两个角，第三个角一定能算出来。`,
        en: `${narrator}: "Why find triangle angles?\nA triangular banner has two known angles, but the third is missing — without it, the tailor can't cut the fabric!\n\nGood news: triangles have a magical rule. Know two angles, and the third can always be found."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：角度怎么量？\n"角"就是两条线交叉张开的程度。我们用"度"（°）来衡量：\n• 直角 = $90°$（像书角）\n• 半圈 = $180°$（一条直线）\n• 整圈 = $360°$\n\n角度越大，两条线张得越开！`,
        en: `${narrator}: "How do we measure angles?\nAn 'angle' is how far two lines spread when they meet. We measure in 'degrees' (°):\n• Right angle = $90°$ (like a book corner)\n• Half turn = $180°$ (a straight line)\n• Full turn = $360°$\n\nBigger angle = wider spread!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：重要定理——三角形三个角加起来永远 = $180°$\n为什么？把三角形的三个角撕下来，拼在一起——刚好拼成一条直线！\n一条直线 = $180°$。\n\n不管什么形状的三角形——尖的、扁的、等边的——三个角之和都是 $180°$！`,
        en: `${narrator}: "Key theorem — triangle angles ALWAYS add to $180°$\nWhy? Tear off the three corners of a paper triangle and arrange them — they form a straight line!\nA straight line = $180°$.\n\nANY triangle — pointy, flat, equilateral — the three angles always sum to $180°$!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：已知两个角——先加起来\n角 1 = $${a1}°$，角 2 = $${a2}°$\n\n两角之和：$${a1} + ${a2} = ${a1 + a2}°$\n\n三个角总共 $180°$，已经用掉了 $${a1 + a2}°$——剩下的就是第三个角！`,
        en: `${narrator}: "Two angles known — add them first\nAngle 1 = $${a1}°$, Angle 2 = $${a2}°$\n\nSum of two: $${a1} + ${a2} = ${a1 + a2}°$\n\nTotal is $180°$, already used $${a1 + a2}°$ — the rest is the third angle!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：答案\n$x = 180° - ${a1 + a2}° = ${answer}°$\n\n三角旗的第三个角找到了！做得好！`,
        en: `${narrator}: "Answer\n$x = 180° - ${a1 + a2}° = ${answer}°$\n\nThe banner's third angle is found! Well done!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：验算——三个角加起来是 $180°$ 吗？\n$${a1}° + ${a2}° + ${answer}° = ${a1 + a2 + answer}°$ ✓\n\n${answer < 90 ? `$${answer}°$ 是锐角（小于 $90°$）` : answer === 90 ? `$${answer}°$ 是直角` : `$${answer}°$ 是钝角（大于 $90°$）`}\n记住：三角形最多只能有一个钝角或直角！`,
        en: `${narrator}: "Verify — do all three add to $180°$?\n$${a1}° + ${a2}° + ${answer}° = ${a1 + a2 + answer}°$ ✓\n\n${answer < 90 ? `$${answer}°$ is acute (less than $90°$)` : answer === 90 ? `$${answer}°$ is a right angle` : `$${answer}°$ is obtuse (greater than $90°$)`}\nRemember: a triangle can have at most ONE obtuse or right angle!"`,
      },
      highlightField: 'x',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, angle: a1 + a2, total: 180, a1, a2, generatorType: 'ANGLES_TRIANGLE_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   ANGLES_POINT generator: angles at a point sum to 360°
   ══════════════════════════════════════════════════════════ */

export function generateAnglesPointMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';

  // Generate 2-3 known angles, find the missing one
  const numKnown = tier === 1 ? 2 : tier === 2 ? pickRandom([2, 3]) : 3;
  const angles: number[] = [];
  let remaining = 360;
  for (let i = 0; i < numKnown; i++) {
    const maxAngle = remaining - (numKnown - i) * 20;
    const a = randInt(40, Math.min(160, maxAngle));
    angles.push(a);
    remaining -= a;
  }
  const answer = remaining;

  const anglesStr = angles.map(a => `$${a}°$`).join('、');
  const anglesStrEn = angles.map(a => `$${a}°$`).join(', ');
  const sum = angles.reduce((s, a) => s + a, 0);

  const description: BilingualText = {
    zh: `围绕一点的角度分别是 ${anglesStr} 和 $x°$，求 $x$。`,
    en: `Angles around a point are ${anglesStrEn} and $x°$. Find $x$.`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么是 $360°$？\n想象你站在瞭望台上，面朝北开始，慢慢转身——东→南→西→回到北。\n转了一整圈 = $360°$。\n\n为什么是 360？古人把天空分成 360 份（大约每天太阳移动 $1°$，一年 ≈ 360 天）。`,
        en: `${narrator}: "Why $360°$?\nImagine standing on a watchtower, facing North. Turn slowly — East → South → West → back to North.\nOne full turn = $360°$.\n\nWhy 360? Ancient people divided the sky into 360 parts (the sun moves about $1°$ per day, ~360 days in a year)."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：核心规则——围绕一点的所有角加起来 = $360°$\n就像把一个圆饼切成几块——不管切多少块，所有块合起来还是一个完整的圆！\n\n完整的圆 = $360°$，一度都不会多，一度也不会少。`,
        en: `${narrator}: "Core rule — all angles around a point add up to $360°$\nLike cutting a round pie into pieces — no matter how many, they all form a complete circle!\n\nComplete circle = $360°$. Not one degree more, not one less."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：先把已知的角加起来\n$${angles.join('° + ')}°$\n$= ${sum}°$\n\n$360°$ 里已经有 $${sum}°$ 了——还剩多少度？`,
        en: `${narrator}: "Add up the known angles first\n$${angles.join('° + ')}°$\n$= ${sum}°$\n\n$360°$ has $${sum}°$ accounted for — how many degrees left?"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：用总度数减去已知角\n$x = 360° - ${sum}° = ${answer}°$\n\n就像分蛋糕：总共 $360°$，别人分走了 $${sum}°$，你拿到剩下的 $${answer}°$！`,
        en: `${narrator}: "Subtract known from total\n$x = 360° - ${sum}° = ${answer}°$\n\nLike sharing a cake: total $360°$, others took $${sum}°$, you get the remaining $${answer}°$!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：答案\n$x = ${answer}°$\n\n围绕一点的所有角：${angles.map(a => `$${a}°$`).join(' + ')} + $${answer}°$ = $360°$`,
        en: `${narrator}: "Answer\n$x = ${answer}°$\n\nAll angles around the point: ${angles.map(a => `$${a}°$`).join(' + ')} + $${answer}°$ = $360°$"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：验算——所有角加起来是 $360°$ 吗？\n$${angles.join('° + ')}° + ${answer}° = ${sum + answer}°$ ✓\n\n$${sum + answer} = 360$ ✓ 正好一整圈！瞭望完毕，做得漂亮！`,
        en: `${narrator}: "Verify — do all angles sum to $360°$?\n$${angles.join('° + ')}° + ${answer}° = ${sum + answer}°$ ✓\n\n$${sum + answer} = 360$ ✓ Exactly one full turn! Lookout complete — brilliantly done!"`,
      },
      highlightField: 'x',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, angle: sum, total: 360, angles, generatorType: 'ANGLES_POINT_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SEQUENCE_Y7 generator: simple linear sequences for Y7
   ══════════════════════════════════════════════════════════ */

export function generateSequenceY7Mission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';
  const mode: 'next' | 'nth' = template.data?.mode ?? 'next';

  const a1Pools: Record<DifficultyTier, number[]> = { 1: [1, 2, 3, 5, 10], 2: [1, 2, 3, 4, 5, 7, 10, 12], 3: [3, 5, 7, 8, 10, 12, 15, 20] };
  const dPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7, 8], 3: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
  const a1 = pickRandom(a1Pools[tier]);
  const d = pickRandom(dPools[tier]);

  if (mode === 'next') {
    // Show first 4-5 terms, ask for the next
    const showCount = tier === 1 ? 4 : 5;
    const terms = Array.from({ length: showCount }, (_, i) => a1 + i * d);
    const answer = a1 + showCount * d;
    const n = showCount + 1;
    const termsStr = terms.join(', ');

    const description: BilingualText = {
      zh: `数列 $${termsStr}, ?$，下一项是什么？`,
      en: `Sequence $${termsStr}, ?$ — what comes next?`,
    };

    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：为什么要学数列？\n每天招募新兵，人数有规律：$${termsStr}$\n\n什么是"数列"？按一定规律排列的一串数。\n就像每天的记录：第1天 ${terms[0]} 人，第2天 ${terms[1]} 人……看出来了吗？`,
          en: `${narrator}: "Why learn sequences?\nDaily recruitment follows a pattern: $${termsStr}$\n\nWhat is a sequence? Numbers arranged in a pattern.\nLike daily records: Day 1: ${terms[0]}, Day 2: ${terms[1]}... See the pattern?"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：怎么找规律？看相邻两数的差！\n$${terms[1]} - ${terms[0]} = ${d}$\n$${terms[2]} - ${terms[1]} = ${d}$\n$${terms[3]} - ${terms[2]} = ${d}$\n\n每次都差 $${d}$！这叫"公差"——每天比前一天多招 $${d}$ 人。`,
          en: `${narrator}: "How to find the pattern? Look at differences!\n$${terms[1]} - ${terms[0]} = ${d}$\n$${terms[2]} - ${terms[1]} = ${d}$\n$${terms[3]} - ${terms[2]} = ${d}$\n\nAlways $${d}$! This is the 'common difference' — $${d}$ more each day."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：知道公差就能预测下一个！\n下一项 = 最后一项 + 公差\n$= ${terms[showCount - 1]} + ${d} = ${answer}$\n\n就像预测明天的招兵人数——有了规律，未来可预见！`,
          en: `${narrator}: "With the common difference, predict the next!\nNext term = last term + common difference\n$= ${terms[showCount - 1]} + ${d} = ${answer}$\n\nLike predicting tomorrow's recruitment — with a pattern, the future is predictable!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：答案\n下一项 = $${answer}$\n\n完整数列：$${termsStr}, ${answer}$`,
          en: `${narrator}: "Answer\nNext term = $${answer}$\n\nFull sequence: $${termsStr}, ${answer}$"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：验算——新数字符合规律吗？\n$${answer} - ${terms[showCount - 1]} = ${d}$ ✓ 公差不变！\n\n整个数列每一步都差 $${d}$，规律完美成立！`,
          en: `${narrator}: "Verify — does the new number fit?\n$${answer} - ${terms[showCount - 1]} = ${d}$ ✓ Same difference!\n\nEvery step differs by $${d}$ — pattern holds perfectly!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：总结\n等差数列：每一项比前一项多（或少）相同的数。\n找规律 → 算公差 → 加上去 → 验算。\n\n有了这个方法，任何等差数列都难不倒你！做得漂亮！`,
          en: `${narrator}: "Summary\nArithmetic sequence: each term differs from the last by the same amount.\nFind pattern → calculate difference → add → verify.\n\nWith this method, no arithmetic sequence can stump you! Brilliantly done!"`,
        },
        highlightField: 'ans',
      },
    ];

    return {
      ...template,
      description,
      data: { a1, d, n, generatorType: 'SEQUENCE_Y7_RANDOM', mode },
      tutorialSteps,
    };
  } else {
    // Find nth term using formula
    const nPools: Record<DifficultyTier, number[]> = { 1: [5, 6, 7, 8], 2: [6, 8, 10, 12], 3: [10, 15, 20, 25] };
    const n = pickRandom(nPools[tier]);
    const terms = Array.from({ length: 4 }, (_, i) => a1 + i * d);
    const answer = a1 + (n - 1) * d;
    const termsStr = terms.join(', ');

    const description: BilingualText = {
      zh: `数列 $${termsStr}, \\ldots$，第 $${n}$ 项是多少？`,
      en: `Sequence $${termsStr}, \\ldots$ — what is term $${n}$?`,
    };

    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：远征军第 $${n}$ 天的补给量是多少？\n数列：$${termsStr}, \\ldots$\n\n逐个数到第 $${n}$ 项太慢了——我们需要一个"直达公式"！\n给出位置 $n$，直接算出值。`,
          en: `${narrator}: "What's the supply on day $${n}$?\nSequence: $${termsStr}, \\ldots$\n\nCounting one by one to term $${n}$ is too slow — we need a 'direct formula'!\nGive it position $n$, get the value instantly."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：第一步——找公差\n$${terms[1]} - ${terms[0]} = ${d}$\n$${terms[2]} - ${terms[1]} = ${d}$\n\n公差 $d = ${d}$（每次加 $${d}$）。有了公差就能用公式了！`,
          en: `${narrator}: "Step 1 — find the common difference\n$${terms[1]} - ${terms[0]} = ${d}$\n$${terms[2]} - ${terms[1]} = ${d}$\n\nCommon difference $d = ${d}$ (adding $${d}$ each time). With this, we can use the formula!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：公式为什么是 $(n-1)$？\n第 1 项：$${a1}$，加了 $0$ 次公差\n第 2 项：$${a1} + ${d} \\times 1 = ${a1 + d}$，加了 $1$ 次\n第 3 项：$${a1} + ${d} \\times 2 = ${a1 + 2*d}$，加了 $2$ 次\n\n规律：第 $n$ 项加了 $(n-1)$ 次公差——因为第 1 项还没开始加！`,
          en: `${narrator}: "Why $(n-1)$ in the formula?\nTerm 1: $${a1}$, added $0$ differences\nTerm 2: $${a1} + ${d} \\times 1 = ${a1 + d}$, added $1$ time\nTerm 3: $${a1} + ${d} \\times 2 = ${a1 + 2*d}$, added $2$ times\n\nPattern: term $n$ adds $(n-1)$ differences — because term 1 hasn't added any yet!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：代入公式\n$\\text{第 } n \\text{ 项} = a_1 + (n-1) \\times d$\n$= ${a1} + (${n} - 1) \\times ${d}$\n$= ${a1} + ${n-1} \\times ${d}$\n$= ${a1} + ${(n-1)*d} = ${answer}$`,
          en: `${narrator}: "Plug into the formula\n$\\text{Term } n = a_1 + (n-1) \\times d$\n$= ${a1} + (${n} - 1) \\times ${d}$\n$= ${a1} + ${n-1} \\times ${d}$\n$= ${a1} + ${(n-1)*d} = ${answer}$"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：答案\n第 $${n}$ 项 = $${answer}$\n\n不用逐个数，公式一步到位！`,
          en: `${narrator}: "Answer\nTerm $${n}$ = $${answer}$\n\nNo counting one by one — the formula gets there in one shot!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：验算\n• 比第 1 项（$${a1}$）大？$${answer} > ${a1}$ ✓\n• 加了 $${n-1}$ 次公差 $${d}$：$${d} \\times ${n-1} = ${(n-1)*d}$\n• $${a1} + ${(n-1)*d} = ${answer}$ ✓\n\n远征军补给计划精准无误，做得漂亮！`,
          en: `${narrator}: "Verify\n• Bigger than term 1 ($${a1}$)? $${answer} > ${a1}$ ✓\n• Added $${d}$ exactly $${n-1}$ times: $${d} \\times ${n-1} = ${(n-1)*d}$\n• $${a1} + ${(n-1)*d} = ${answer}$ ✓\n\nExpedition supply plan spot-on — brilliantly done!"`,
        },
        highlightField: 'ans',
      },
    ];

    return {
      ...template,
      description,
      data: { a1, d, n, generatorType: 'SEQUENCE_Y7_RANDOM', mode },
      tutorialSteps,
    };
  }
}

/* ══════════════════════════════════════════════════════════
   STATISTICS_RANGE generator
   ══════════════════════════════════════════════════════════ */

export function generateStatsRangeMission(template: Mission): Mission {
  const tier = getTier();
  const countPools: Record<DifficultyTier, number[]> = { 1: [5], 2: [5, 6, 7], 3: [7, 8, 9, 10] };
  const valRanges: Record<DifficultyTier, [number, number]> = { 1: [3, 20], 2: [5, 50], 3: [10, 100] };
  const count = pickRandom(countPools[tier]);
  const values = Array.from({ length: count }, () => randInt(valRanges[tier][0], valRanges[tier][1]));
  const sorted = [...values].sort((a, b) => a - b);
  const answer = sorted[sorted.length - 1] - sorted[0];
  const narrator = pickRandom(['诸葛亮', '曹操']);

  const description: BilingualText = {
    zh: `求数据 $${sorted.join(', ')}$ 的极差（Range）。`,
    en: `Find the range of $${sorted.join(', ')}$.`,
  };

  const max = sorted[sorted.length - 1];
  const min = sorted[0];

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要"极差"？\n将军选兵，不光看平均战力，还要看最强和最弱差多少。\n\n差距大 → 水平参差不齐，需要整训。\n差距小 → 水平齐整，可以出征。\n\n极差就是用一个数字衡量这个差距！`,
        en: `${narrator}: "Why do we need 'range'?\nA general doesn't just look at average strength — he needs to know the gap between best and worst.\n\nLarge gap → uneven, needs training.\nSmall gap → consistent, ready for battle.\n\nRange measures this gap with a single number!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：极差的公式——超简单！\n$$\\text{极差} = \\text{最大值} - \\text{最小值}$$\n\n只需要最大和最小两个数，中间的数据不影响极差。\n所以找到最大最小就行了！`,
        en: `${narrator}: "Range formula — super simple!\n$$\\text{Range} = \\text{Maximum} - \\text{Minimum}$$\n\nOnly need the largest and smallest — middle values don't affect the range.\nSo just find max and min!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——排序，找最大最小\n数据（已排序）：$${sorted.join(', ')}$\n\n最小值 = $${min}$（最左边）\n最大值 = $${max}$（最右边）\n\n排好序一眼就能看出来！`,
        en: `${narrator}: "Step 1 — sort to find max and min\nData (sorted): $${sorted.join(', ')}$\n\nMinimum = $${min}$ (leftmost)\nMaximum = $${max}$ (rightmost)\n\nSorting makes it obvious!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第二步——最大减最小\n极差 $= ${max} - ${min} = ${answer}$\n\n就一步减法，搞定！`,
        en: `${narrator}: "Step 2 — subtract min from max\nRange $= ${max} - ${min} = ${answer}$\n\nOne subtraction — done!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n极差 = $${answer}$\n\n最强和最弱之间相差 $${answer}$——${answer > 50 ? '差距很大，需要加紧整训！' : answer > 20 ? '差距中等，还需努力。' : '差距不大，队伍齐整！'}`,
        en: `${narrator}: "Answer\nRange = $${answer}$\n\nGap between highest and lowest is $${answer}$ — ${answer > 50 ? 'large gap, training needed!' : answer > 20 ? 'moderate gap, keep working.' : 'small gap, troops are well-matched!'}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算\n• 所有数据都在 $${min}$ 到 $${max}$ 之间？$${sorted.join(', ')}$ ✓\n• $${max} - ${min} = ${answer}$ ✓\n• 没有数据超出范围 ✓\n\n极差计算完毕，做得漂亮！`,
        en: `${narrator}: "Verify\n• All data between $${min}$ and $${max}$? $${sorted.join(', ')}$ ✓\n• $${max} - ${min} = ${answer}$ ✓\n• No data outside this range ✓\n\nRange calculated — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { values: sorted, mode: 'range', generatorType: 'STATISTICS_RANGE_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   AREA_TRIANGLE generator: base × height ÷ 2
   ══════════════════════════════════════════════════════════ */

export function generateAreaTriangleMission(template: Mission): Mission {
  const tier = getTier();
  const bPools: Record<DifficultyTier, number[]> = { 1: [4, 6, 8, 10], 2: [6, 8, 10, 12, 14, 16, 20], 3: [10, 12, 15, 18, 20, 24, 30] };
  const hPools: Record<DifficultyTier, number[]> = { 1: [3, 4, 5, 6], 2: [4, 5, 6, 7, 8, 10], 3: [6, 8, 9, 10, 12, 15] };
  const base = pickRandom(bPools[tier]);
  const height = pickRandom(hPools[tier]);
  const answer = base * height / 2;
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';

  const description: BilingualText = {
    zh: `三角形底 $${base}$，高 $${height}$，求面积。`,
    en: `Triangle with base $${base}$ and height $${height}$. Find the area.`,
  };

  const rectArea = base * height;
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学三角形面积？\n裁制三角军旗——先搞懂"底"和"高"。\n\n底（base）= 三角形最下面的边。\n高（height）= 从底边到对面顶点的**垂直**距离——不是斜边！\n\n底 = $${base}$，高 = $${height}$。`,
        en: `${narrator}: "Why learn triangle area?\nMaking a triangular banner — first understand 'base' and 'height'.\n\nBase = the bottom edge of the triangle.\nHeight = the PERPENDICULAR distance from base to opposite corner — not the slanted side!\n\nBase = $${base}$, Height = $${height}$."`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：为什么三角形面积要除以 2？\n想象做两面一模一样的三角旗，把第二面翻转拼上——变成一个长方形！\n\n长方形面积 = $${base} \\times ${height} = ${rectArea}$\n三角旗 = 长方形的一半 → 面积 = $${rectArea} \\div 2$！`,
        en: `${narrator}: "Why divide by 2 for triangle area?\nImagine two identical triangular banners — flip one and join them. You get a rectangle!\n\nRectangle area = $${base} \\times ${height} = ${rectArea}$\nTriangle = half the rectangle → area = $${rectArea} \\div 2$!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：第一步——底 × 高\n$${base} \\times ${height} = ${rectArea}$\n\n这是"完整长方形"的面积——三角形只要一半。`,
        en: `${narrator}: "Step 1 — base × height\n$${base} \\times ${height} = ${rectArea}$\n\nThis is the 'full rectangle' area — the triangle needs just half."`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：第二步——除以 2\n$${rectArea} \\div 2 = ${answer}$\n\n三角形面积就是长方形面积的一半——就这么简单！`,
        en: `${narrator}: "Step 2 — divide by 2\n$${rectArea} \\div 2 = ${answer}$\n\nTriangle area is half the rectangle — that simple!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：答案\n三角形面积 $= \\frac{1}{2} \\times ${base} \\times ${height} = ${answer}$ 平方单位\n\n三角军旗裁好了！`,
        en: `${narrator}: "Answer\nTriangle area $= \\frac{1}{2} \\times ${base} \\times ${height} = ${answer}$ square units\n\nBanner cut and ready!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：验算——三角形是长方形的一半吗？\n三角形 $= ${answer}$，长方形 $= ${rectArea}$\n$${answer} \\times 2 = ${rectArea}$ ✓ 确实是一半！\n\n三角军旗面积 $= ${answer}$ 平方单位，做得漂亮！`,
        en: `${narrator}: "Verify — is the triangle half the rectangle?\nTriangle $= ${answer}$, Rectangle $= ${rectArea}$\n$${answer} \\times 2 = ${rectArea}$ ✓ Indeed half!\n\nBanner area $= ${answer}$ square units — brilliantly done!"`,
      },
      highlightField: 'area',
    },
  ];

  return {
    ...template,
    description,
    data: { base, height, answer, generatorType: 'AREA_TRIANGLE_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   FACTORS_LIST generator: list all factors of a number
   ══════════════════════════════════════════════════════════ */

export function generateFactorsListMission(template: Mission): Mission {
  const tier = getTier();
  const pools: Record<DifficultyTier, number[]> = {
    1: [6, 8, 10, 12, 15, 18, 20],
    2: [12, 16, 18, 20, 24, 28, 30, 36],
    3: [24, 30, 36, 40, 48, 56, 60, 72],
  };
  const n = pickRandom(pools[tier]);
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '刘备';

  // Find all factors
  const factors: number[] = [];
  for (let i = 1; i <= n; i++) {
    if (n % i === 0) factors.push(i);
  }
  const answer = factors.length;

  const description: BilingualText = {
    zh: `$${n}$ 有几个因数？`,
    en: `How many factors does $${n}$ have?`,
  };

  // Show factor pairs for tutorial
  const pairs: string[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) pairs.push(`$${i} \\times ${n / i} = ${n}$`);
  }

  // Test a few specific divisions for tutorial demonstration
  const testYes = factors.length > 2 ? factors[1] : 2;
  const testNo = [5, 7, 9, 11].find(d => n % d !== 0) || 7;

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：$${n}$ 个新兵要编队——有几种等人数的分法？\n比如分成 2 人一队：$${n} \\div 2 = ${n / 2}$${n % 2 === 0 ? '，整除 ✓ 可以！' : '，有余数 ✗ 不行！'}\n\n"因数"就是能把一个数平均分开的数——没有余数才算！`,
        en: `${narrator}: "$${n}$ recruits need squads — how many ways to form equal groups?\nE.g., groups of 2: $${n} \\div 2 = ${n / 2}$${n % 2 === 0 ? ', exact ✓ works!' : ', remainder ✗ doesn\'t work!'}\n\nA 'factor' is a number that divides evenly — no remainder!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：怎么判断能不能整除？看有没有余数！\n$${n} \\div ${testYes} = ${n / testYes}$，没余数 → 整除 ✓ → $${testYes}$ 是因数\n$${n} \\div ${testNo} = ${Math.floor(n / testNo)}$ 余 $${n % testNo}$ → 不整除 ✗ → $${testNo}$ 不是因数\n\n整除 = 除得刚刚好，一点都不剩！`,
        en: `${narrator}: "How to check? Look for remainders!\n$${n} \\div ${testYes} = ${n / testYes}$, no remainder → divides ✓ → $${testYes}$ is a factor\n$${n} \\div ${testNo} = ${Math.floor(n / testNo)}$ r $${n % testNo}$ → doesn't divide ✗ → $${testNo}$ is not\n\nDivides evenly = nothing left over!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：秘诀——因数总是成对出现！\n找到一个因数，就自动得到另一个：\n${pairs.join('\n')}\n\n每一对相乘都等于 $${n}$！所以只要试到 $\\sqrt{${n}}$ 就够了。`,
        en: `${narrator}: "Secret — factors always come in pairs!\nFind one factor, automatically get another:\n${pairs.join('\n')}\n\nEach pair multiplies to $${n}$! So we only need to test up to $\\sqrt{${n}}$."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：把所有因数从小到大排列\n$${n}$ 的全部因数：$${factors.join(', ')}$\n\n一共 $${answer}$ 个因数！`,
        en: `${narrator}: "List all factors from smallest to largest\nAll factors of $${n}$: $${factors.join(', ')}$\n\nTotal: $${answer}$ factors!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——每个因数都能整除 $${n}$\n${factors.map(f => `$${n} \\div ${f} = ${n / f}$ ✓`).join('\n')}\n\n全部整除！$${n}$ 有 $${answer}$ 种编队方式。`,
        en: `${narrator}: "Verify — every factor divides $${n}$ evenly\n${factors.map(f => `$${n} \\div ${f} = ${n / f}$ ✓`).join('\n')}\n\nAll check out! $${n}$ has $${answer}$ ways to form equal groups."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：记住——1 和自身永远是因数！\n$${n} \\div 1 = ${n}$ ✓，$${n} \\div ${n} = 1$ ✓\n\n所以因数至少有 2 个。如果**只有** 1 和自己——那就是质数！（下一关会学）`,
        en: `${narrator}: "Remember — 1 and the number itself are ALWAYS factors!\n$${n} \\div 1 = ${n}$ ✓, $${n} \\div ${n} = 1$ ✓\n\nSo there are always at least 2 factors. If ONLY 1 and itself — that's a prime! (next mission)"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { n, factors, answer, generatorType: 'FACTORS_LIST_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   INTEGER_MUL generator: multiply/divide with negatives
   ══════════════════════════════════════════════════════════ */

export function generateIntegerMulMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '张飞';
  const mode: 'mul' | 'div' = template.data?.mode ?? 'mul';

  let a: number, b: number, answer: number, op: string;

  if (mode === 'div') {
    // Generate division: ensure clean result
    const resPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5, 6], 2: [3, 4, 5, 6, 7, 8], 3: [4, 5, 6, 7, 8, 9, 10] };
    const divPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6], 3: [3, 4, 5, 6, 7, 8] };
    const res = pickRandom(resPools[tier]);
    b = pickRandom(divPools[tier]);
    // Randomly negate
    const negA = pickRandom([true, false]);
    const negB = pickRandom([true, false]);
    a = (negA ? -1 : 1) * res * b;
    b = (negB ? -1 : 1) * b;
    answer = a / b;
    op = '÷';
  } else {
    const aPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5, 6], 2: [3, 4, 5, 6, 7, 8, 9], 3: [5, 6, 7, 8, 9, 10, 11, 12] };
    const bPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7], 3: [3, 4, 5, 6, 7, 8, 9] };
    a = pickRandom(aPools[tier]) * pickRandom([-1, 1]);
    b = pickRandom(bPools[tier]) * pickRandom([-1, 1]);
    answer = a * b;
    op = '×';
  }

  const signRule = (a >= 0) === (b >= 0) ? 'positive' : 'negative';
  const signRuleZh = signRule === 'positive' ? '同号得正' : '异号得负';
  const signRuleEn = signRule === 'positive' ? 'same signs → positive' : 'different signs → negative';

  const description: BilingualText = {
    zh: `计算 $(${a}) ${op} (${b}) = ?$`,
    en: `Calculate $(${a}) ${op} (${b}) = ?$`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学负数乘除？——进攻退守，方向很重要！\n正数 = 前进/得到，负数 = 后退/失去。\n\n"3 队骑兵各前进 2 里" = $3 \\times 2 = 6$ 里（正 = 前进）\n"3 队骑兵各后退 2 里" = $3 \\times (-2) = -6$ 里（负 = 后退）`,
        en: `${narrator}: "Why learn multiplying negatives? Direction matters!\nPositive = advance/gain, Negative = retreat/lose.\n\n'3 units advance 2 miles' = $3 \\times 2 = 6$ miles (positive = forward)\n'3 units retreat 2 miles' = $3 \\times (-2) = -6$ miles (negative = backward)"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：核心口诀——两句话搞定\n• **同号得正**：正×正 = 正，负×负 = 正\n• **异号得负**：正×负 = 负，负×正 = 负\n\n乘法和除法规则完全相同！记住这两句就够了。`,
        en: `${narrator}: "Core rule — two lines and you're done\n• **Same signs → positive**: (+)×(+) = (+), (−)×(−) = (+)\n• **Different signs → negative**: (+)×(−) = (−), (−)×(+) = (−)\n\nSame rule for division! Remember these two lines."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：为什么"负负得正"？\n想象敌人在撤退（负方向），我们"取消"撤退（再一个负）。\n取消撤退 = 前进 = 正方向！\n\n负负得正，就像"敌退我进"——两个负号互相抵消！`,
        en: `${narrator}: "Why does negative × negative = positive?\nImagine the enemy retreating (negative). We 'cancel' the retreat (another negative).\nCancelling retreat = advance = positive!\n\nNeg × Neg = Pos, like 'enemy retreats, we advance' — two negatives cancel out!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——判断符号\n$(${a})$ 是${a >= 0 ? '正' : '负'}数，$(${b})$ 是${b >= 0 ? '正' : '负'}数。\n\n${signRuleZh}！所以结果是${signRule === 'positive' ? '**正**' : '**负**'}数。`,
        en: `${narrator}: "Step 1 — determine the sign\n$(${a})$ is ${a >= 0 ? 'positive' : 'negative'}, $(${b})$ is ${b >= 0 ? 'positive' : 'negative'}.\n\n${signRuleEn}! So the result is **${signRule}**."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第二步——不管正负，先算数字\n$${Math.abs(a)} ${op} ${Math.abs(b)} = ${Math.abs(answer)}$\n\n加上符号：${answer >= 0 ? '' : '−'}$${Math.abs(answer)}$ → 答案 = $${answer}$`,
        en: `${narrator}: "Step 2 — ignore signs, just calculate\n$${Math.abs(a)} ${op} ${Math.abs(b)} = ${Math.abs(answer)}$\n\nAdd sign: ${answer >= 0 ? '' : '−'}$${Math.abs(answer)}$ → answer = $${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算\n$(${a}) ${op} (${b}) = ${answer}$ ✓\n符号：${signRuleZh} ✓\n数值：$${Math.abs(a)} ${op} ${Math.abs(b)} = ${Math.abs(answer)}$ ✓\n\n做得漂亮！`,
        en: `${narrator}: "Verify\n$(${a}) ${op} (${b}) = ${answer}$ ✓\nSign: ${signRuleEn} ✓\nValue: $${Math.abs(a)} ${op} ${Math.abs(b)} = ${Math.abs(answer)}$ ✓\n\nBrilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { a, b, answer, op, mode, generatorType: 'INTEGER_MUL_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   FDP_CONVERT generator: fraction ↔ decimal ↔ percentage
   ══════════════════════════════════════════════════════════ */

export function generateFdpConvertMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';

  // Common FDP equivalences
  const fdpSets: { frac: string; num: number; den: number; dec: number; pct: number }[] = [
    { frac: '1/2', num: 1, den: 2, dec: 0.5, pct: 50 },
    { frac: '1/4', num: 1, den: 4, dec: 0.25, pct: 25 },
    { frac: '3/4', num: 3, den: 4, dec: 0.75, pct: 75 },
    { frac: '1/5', num: 1, den: 5, dec: 0.2, pct: 20 },
    { frac: '2/5', num: 2, den: 5, dec: 0.4, pct: 40 },
    { frac: '3/5', num: 3, den: 5, dec: 0.6, pct: 60 },
    { frac: '1/10', num: 1, den: 10, dec: 0.1, pct: 10 },
    { frac: '3/10', num: 3, den: 10, dec: 0.3, pct: 30 },
    { frac: '1/8', num: 1, den: 8, dec: 0.125, pct: 12.5 },
    { frac: '1/3', num: 1, den: 3, dec: 0.333, pct: 33.3 },
  ];

  const pool = tier === 1 ? fdpSets.slice(0, 4) : tier === 2 ? fdpSets.slice(0, 7) : fdpSets;
  const chosen = pickRandom(pool);

  // Decide conversion direction
  const directions = ['frac_to_pct', 'pct_to_dec', 'dec_to_frac'] as const;
  const dir = pickRandom(tier === 1 ? directions.slice(0, 1) : directions);

  let answer: number;
  let description: BilingualText;

  if (dir === 'frac_to_pct') {
    answer = chosen.pct;
    description = {
      zh: `$\\frac{${chosen.num}}{${chosen.den}}$ 等于百分之几？`,
      en: `What percentage is $\\frac{${chosen.num}}{${chosen.den}}$?`,
    };
  } else if (dir === 'pct_to_dec') {
    answer = chosen.dec;
    description = {
      zh: `$${chosen.pct}\\%$ 化成小数是多少？`,
      en: `Convert $${chosen.pct}\\%$ to a decimal.`,
    };
  } else {
    answer = chosen.pct;
    description = {
      zh: `$${chosen.dec}$ 等于百分之几？`,
      en: `What percentage is $${chosen.dec}$?`,
    };
  }

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学转换？\n将军说"半数兵力"，军师说"0.5倍兵力"，谋士说"50%兵力"——说的是同一件事！\n\n分数、小数、百分比是三种写法，你必须能自由切换。`,
        en: `${narrator}: "Why learn conversions?\nThe general says 'half the troops', the adviser says '0.5 of the troops', the strategist says '50%' — all the same thing!\n\nFractions, decimals, percentages are three forms. You must switch freely between them."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：三种写法，同一个数\n$\\frac{1}{2} = 0.5 = 50\\%$\n\n就像同一个人有大名、小名、绰号——换个写法，但数值不变！`,
        en: `${narrator}: "Three forms, one value\n$\\frac{1}{2} = 0.5 = 50\\%$\n\nLike the same person with a formal name, nickname, and title — different form, same value!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：转换秘诀\n分数 → 小数：分子 ÷ 分母\n$\\frac{${chosen.num}}{${chosen.den}} = ${chosen.num} \\div ${chosen.den} = ${chosen.dec}$\n\n小数 → 百分比：乘 100 → $${chosen.dec} \\times 100 = ${chosen.pct}\\%$\n百分比 → 小数：除 100 → $${chosen.pct}\\% \\div 100 = ${chosen.dec}$`,
        en: `${narrator}: "Conversion secrets\nFraction → Decimal: numerator ÷ denominator\n$\\frac{${chosen.num}}{${chosen.den}} = ${chosen.num} \\div ${chosen.den} = ${chosen.dec}$\n\nDecimal → %: × 100 → $${chosen.dec} \\times 100 = ${chosen.pct}\\%$\n% → Decimal: ÷ 100 → $${chosen.pct}\\% \\div 100 = ${chosen.dec}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$\\frac{${chosen.num}}{${chosen.den}} = ${chosen.dec} = ${chosen.pct}\\%$\n\n答案 = $${answer}$`,
        en: `${narrator}: "Answer\n$\\frac{${chosen.num}}{${chosen.den}} = ${chosen.dec} = ${chosen.pct}\\%$\n\nAnswer = $${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——反向转换回去\n${dir === 'frac_to_pct'
          ? `$${chosen.pct}\\% \\div 100 = ${chosen.dec}$，$${chosen.dec} = \\frac{${chosen.num}}{${chosen.den}}$ ✓`
          : dir === 'pct_to_dec'
          ? `$${chosen.dec} \\times 100 = ${chosen.pct}\\%$ ✓`
          : `$${chosen.pct}\\% \\div 100 = ${chosen.dec}$ ✓`}\n\n正反都对得上——转换正确！`,
        en: `${narrator}: "Verify — convert back\n${dir === 'frac_to_pct'
          ? `$${chosen.pct}\\% \\div 100 = ${chosen.dec}$, $${chosen.dec} = \\frac{${chosen.num}}{${chosen.den}}$ ✓`
          : dir === 'pct_to_dec'
          ? `$${chosen.dec} \\times 100 = ${chosen.pct}\\%$ ✓`
          : `$${chosen.pct}\\% \\div 100 = ${chosen.dec}$ ✓`}\n\nBoth directions match — conversion correct!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：必背——常见对照表\n$\\frac{1}{2} = 50\\%$，$\\frac{1}{4} = 25\\%$，$\\frac{3}{4} = 75\\%$\n$\\frac{1}{5} = 20\\%$，$\\frac{2}{5} = 40\\%$，$\\frac{3}{5} = 60\\%$\n$\\frac{1}{10} = 10\\%$，$\\frac{1}{3} \\approx 33.3\\%$\n\n背下这些，考试快人一步！`,
        en: `${narrator}: "Must memorize — quick reference\n$\\frac{1}{2} = 50\\%$, $\\frac{1}{4} = 25\\%$, $\\frac{3}{4} = 75\\%$\n$\\frac{1}{5} = 20\\%$, $\\frac{2}{5} = 40\\%$, $\\frac{3}{5} = 60\\%$\n$\\frac{1}{10} = 10\\%$, $\\frac{1}{3} \\approx 33.3\\%$\n\nMemorize these and you'll be faster than everyone!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { ...chosen, dir, answer, generatorType: 'FDP_CONVERT_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   BODMAS generator: order of operations
   ══════════════════════════════════════════════════════════ */

export function generateBodmasMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';

  let a: number, b: number, c: number, answer: number, expr: string;

  if (tier === 1) {
    // a + b × c
    a = randInt(2, 10);
    b = randInt(2, 5);
    c = randInt(2, 5);
    answer = a + b * c;
    expr = `${a} + ${b} \\times ${c}`;
  } else if (tier === 2) {
    // a × b + c × d or a + b × c - d
    a = randInt(2, 8);
    b = randInt(2, 6);
    c = randInt(1, 10);
    answer = a + b * c;
    expr = `${a} + ${b} \\times ${c}`;
    // Sometimes use subtraction
    if (pickRandom([true, false])) {
      const d = randInt(1, Math.min(5, a + b * c - 1));
      answer = a + b * c - d;
      expr = `${a} + ${b} \\times ${c} - ${d}`;
    }
  } else {
    // With brackets: (a + b) × c
    a = randInt(2, 8);
    b = randInt(2, 8);
    c = randInt(2, 6);
    answer = (a + b) * c;
    expr = `(${a} + ${b}) \\times ${c}`;
  }

  const wrongAnswer = tier <= 2 ? (a + b) * c : a + b * c; // Common mistake

  const description: BilingualText = {
    zh: `计算 $${expr}$`,
    en: `Calculate $${expr}$`,
  };

  const tutorialSteps = tier <= 2 ? [
    {
      text: {
        zh: `${narrator}：为什么不能从左到右算？\n日常读句子从左到右，但数学不一样！运算有"军衔"：\n\n乘除 > 加减——将军的命令比士兵优先。\n$2 + 3 \\times 4$：乘法（将军）先行，加法（士兵）等候！`,
        en: `${narrator}: "Why not just left to right?\nWe read sentences left to right, but math is different! Operations have 'ranks':\n\nMultiply/Divide > Add/Subtract — general's orders override soldiers'.\n$2 + 3 \\times 4$: multiplication (general) first, addition (soldier) waits!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：BODMAS——运算的军衔表\nB — Brackets 括号（统帅级，最高！）\nO — Orders 幂/根号（将军级）\nDM — Division/Multiplication 乘除（校官级）\nAS — Addition/Subtraction 加减（士兵级）\n\n同级的（比如又乘又除）→ 从左到右。`,
        en: `${narrator}: "BODMAS — the rank table\nB — Brackets (Commander, highest!)\nO — Orders/Powers (General)\nDM — Division/Multiplication (Officer)\nAS — Addition/Subtraction (Soldier)\n\nSame rank (e.g., × and ÷ together) → left to right."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${expr}$ 有哪些运算？\n• 乘法 $${b} \\times ${c}$（校官级）\n• 加法 $+ ${a}$（士兵级）\n\n校官 > 士兵 → 先算乘法！`,
        en: `${narrator}: "$${expr}$ — what operations are there?\n• Multiplication $${b} \\times ${c}$ (Officer)\n• Addition $+ ${a}$ (Soldier)\n\nOfficer > Soldier → multiply first!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——先算乘法\n$${b} \\times ${c} = ${b * c}$\n\n式子变成：$${a} + ${b * c}$`,
        en: `${narrator}: "Step 1 — multiply first\n$${b} \\times ${c} = ${b * c}$\n\nExpression becomes: $${a} + ${b * c}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第二步——再算加法\n$${a} + ${b * c} = ${answer}$\n\n答案 = $${answer}$`,
        en: `${narrator}: "Step 2 — now add\n$${a} + ${b * c} = ${answer}$\n\nAnswer = $${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——对比"从左到右"的错误\n❌ 错误：$${a} + ${b} = ${a + b}$，$${a + b} \\times ${c} = ${wrongAnswer}$\n✓ 正确：$${b} \\times ${c} = ${b * c}$，$${a} + ${b * c} = ${answer}$\n\n$${wrongAnswer} \\neq ${answer}$——顺序不同，答案天差地别！做得漂亮！`,
        en: `${narrator}: "Verify — compare with the 'left to right' mistake\n❌ Wrong: $${a} + ${b} = ${a + b}$, $${a + b} \\times ${c} = ${wrongAnswer}$\n✓ Correct: $${b} \\times ${c} = ${b * c}$, $${a} + ${b * c} = ${answer}$\n\n$${wrongAnswer} \\neq ${answer}$ — different order, totally different answer! Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ] : [
    {
      text: {
        zh: `${narrator}：括号——运算界的"统帅令"！\nBODMAS 里 B = Brackets，军衔最高——比乘除还高。\n\n有括号？**先算括号里面的**，不管里面是什么运算。\n括号就是临时提拔：让低级运算获得最高优先权！`,
        en: `${narrator}: "Brackets — the 'supreme command' of operations!\nBODMAS: B = Brackets, highest rank — outranks even multiply/divide.\n\nBrackets present? Calculate INSIDE FIRST, no matter what.\nBrackets = temporary promotion for any operation inside!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${expr}$——发现括号了！先算它\n括号内：$${a} + ${b} = ${a + b}$\n\n式子变成：$${a + b} \\times ${c}$\n\n括号消除了——接下来正常算。`,
        en: `${narrator}: "$${expr}$ — brackets spotted! Do them first\nInside brackets: $${a} + ${b} = ${a + b}$\n\nExpression becomes: $${a + b} \\times ${c}$\n\nBrackets gone — now calculate normally."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：括号消除后——正常乘\n$${a + b} \\times ${c} = ${answer}$\n\n答案 = $${answer}$`,
        en: `${narrator}: "Brackets done — now multiply\n$${a + b} \\times ${c} = ${answer}$\n\nAnswer = $${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：对比——有括号 vs 没括号\n有：$(${a} + ${b}) \\times ${c} = ${a + b} \\times ${c} = ${answer}$\n无：$${a} + ${b} \\times ${c} = ${a} + ${b * c} = ${a + b * c}$\n\n$${answer} \\neq ${a + b * c}$——括号改变了一切！`,
        en: `${narrator}: "Compare — with brackets vs without\nWith: $(${a} + ${b}) \\times ${c} = ${a + b} \\times ${c} = ${answer}$\nWithout: $${a} + ${b} \\times ${c} = ${a} + ${b * c} = ${a + b * c}$\n\n$${answer} \\neq ${a + b * c}$ — brackets change everything!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$(${a} + ${b}) \\times ${c} = ${answer}$`,
        en: `${narrator}: "Answer\n$(${a} + ${b}) \\times ${c} = ${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算\n$(${a} + ${b}) \\times ${c} = ${a + b} \\times ${c} = ${answer}$ ✓\n\nBODMAS 口诀：B括号 → O幂 → DM乘除 → AS加减\n记住军衔表，运算顺序永不出错！做得漂亮！`,
        en: `${narrator}: "Verify\n$(${a} + ${b}) \\times ${c} = ${a + b} \\times ${c} = ${answer}$ ✓\n\nBODMAS: B Brackets → O Orders → DM Div/Mul → AS Add/Sub\nRemember the rank table — never get the order wrong! Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { answer, expr, generatorType: 'BODMAS_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SIMPLIFY generator: collecting like terms (ax + bx = (a+b)x)
   ══════════════════════════════════════════════════════════ */

export function generateSimplifyMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';

  const aPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7], 3: [3, 4, 5, 6, 7, 8, 9] };
  const bPools: Record<DifficultyTier, number[]> = { 1: [1, 2, 3, 4], 2: [2, 3, 4, 5, 6], 3: [3, 4, 5, 6, 7, 8] };
  const a = pickRandom(aPools[tier]);
  const b = pickRandom(bPools[tier]);
  const answer = a + b;

  // Generate expression: ax + bx or ax + bx + c
  let expr: string, exprEn: string;
  let c: number | null = null;

  if (tier >= 2 && pickRandom([true, false])) {
    c = randInt(1, 10);
    expr = `${a}x + ${b}x + ${c}`;
    exprEn = expr;
  } else {
    expr = `${a}x + ${b}x`;
    exprEn = expr;
  }

  const simplified = c !== null ? `${answer}x + ${c}` : `${answer}x`;

  const description: BilingualText = {
    zh: `化简 $${expr}$，$x$ 的系数是多少？`,
    en: `Simplify $${expr}$. What is the coefficient of $x$?`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要化简？\n"3队骑兵加2队骑兵"太啰嗦——直接说"5队骑兵"更清楚！\n化简就是把数学式子也这样"合并同类"。`,
        en: `${narrator}: "Why simplify?\n'3 cavalry units plus 2 cavalry units' is wordy — just say '5 cavalry units'!\nSimplifying does the same for math expressions."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：什么是"同类项"？\n$3x + 2x$ 就像"3箱苹果 + 2箱苹果"——苹果一样，箱子可以合并！\n$3x + 2x = 5x$（5箱苹果）\n\n但 $3x + 2y$ 不能合并——苹果和橘子不能混！`,
        en: `${narrator}: "What are 'like terms'?\n$3x + 2x$ is like '3 boxes of apples + 2 boxes of apples' — same fruit, combine!\n$3x + 2x = 5x$ (5 boxes)\n\nBut $3x + 2y$ can't combine — apples and oranges don't mix!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：$${expr}$ 中哪些是同类项？\n✓ $${a}x$ 和 $${b}x$ 是同类项（都是 $x$）${c !== null ? `\n✗ $${a}x$ 和 $${c}$（常数）不是同类项——一个有 $x$ 一个没有` : ''}\n\n同类项 = 字母部分完全相同！`,
        en: `${narrator}: "Which terms in $${expr}$ are like terms?\n✓ $${a}x$ and $${b}x$ are like terms (both $x$)${c !== null ? `\n✗ $${a}x$ and $${c}$ (constant) are NOT like terms` : ''}\n\nLike terms = exact same letter part!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：合并！只加系数，字母不变\n$${a}x + ${b}x = (${a} + ${b})x = ${answer}x$\n\n系数相加：$${a} + ${b} = ${answer}$，字母 $x$ 照抄。${c !== null ? `\n$${c}$ 是常数项，保留不动。` : ''}`,
        en: `${narrator}: "Combine! Add coefficients, keep the letter\n$${a}x + ${b}x = (${a} + ${b})x = ${answer}x$\n\nCoefficients: $${a} + ${b} = ${answer}$, letter $x$ stays.${c !== null ? `\n$${c}$ is a constant — keep it separate.` : ''}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${expr} = ${simplified}$\n$x$ 的系数 = $${answer}$`,
        en: `${narrator}: "Answer\n$${expr} = ${simplified}$\nCoefficient of $x$ = $${answer}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——代入 $x = 1$ 检查\n原式：$${a}(1) + ${b}(1)${c !== null ? ` + ${c}` : ''} = ${a + b + (c || 0)}$\n化简后：$${answer}(1)${c !== null ? ` + ${c}` : ''} = ${answer + (c || 0)}$\n\n$${a + b + (c || 0)} = ${answer + (c || 0)}$ ✓ 一致！做得漂亮！`,
        en: `${narrator}: "Verify — substitute $x = 1$\nOriginal: $${a}(1) + ${b}(1)${c !== null ? ` + ${c}` : ''} = ${a + b + (c || 0)}$\nSimplified: $${answer}(1)${c !== null ? ` + ${c}` : ''} = ${answer + (c || 0)}$\n\n$${a + b + (c || 0)} = ${answer + (c || 0)}$ ✓ Match! Brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { a, b, c, answer, expr, simplified, generatorType: 'SIMPLIFY_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   STATISTICS_MODE generator: find the most frequent value
   ══════════════════════════════════════════════════════════ */

export function generateStatsModeMission(template: Mission): Mission {
  const tier = getTier();
  const countPools: Record<DifficultyTier, number[]> = { 1: [7], 2: [7, 9], 3: [9, 11] };
  const valRanges: Record<DifficultyTier, [number, number]> = { 1: [1, 10], 2: [1, 20], 3: [1, 30] };
  const count = pickRandom(countPools[tier]);
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '张飞';

  // Generate data with a clear mode (one value appears more often)
  const modeValue = randInt(valRanges[tier][0], valRanges[tier][1]);
  const modeCount = tier === 1 ? 3 : randInt(3, 4);
  const values: number[] = Array(modeCount).fill(modeValue);
  while (values.length < count) {
    let v = randInt(valRanges[tier][0], valRanges[tier][1]);
    // Ensure no other value ties with mode
    if (v !== modeValue && values.filter(x => x === v).length < modeCount - 1) {
      values.push(v);
    }
  }
  // Shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  const sorted = [...values].sort((a, b) => a - b);

  // Count frequencies
  const freq: Record<number, number> = {};
  for (const v of values) freq[v] = (freq[v] || 0) + 1;
  const freqEntries = Object.entries(freq).map(([k, v]) => ({ val: Number(k), count: v })).sort((a, b) => b.count - a.count);

  const description: BilingualText = {
    zh: `求数据 $${sorted.join(', ')}$ 的众数（Mode）。`,
    en: `Find the mode of $${sorted.join(', ')}$.`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：缴获一批兵器，哪种最多？——这就是"众数"！\n众数 = 出现次数最多的值，就是数据里的"人气王"。\n\n知道最常见的兵器 → 知道敌军偏好什么战术！`,
        en: `${narrator}: "Captured weapons — which type is most common? That's the 'mode'!\nMode = most frequent value — the 'most popular' in the data.\n\nMost common weapon → enemy's preferred tactics!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：怎么找？给每个值"画正字"计数！\n数据：$${sorted.join(', ')}$\n\n${freqEntries.map(e => `$${e.val}$：${'|'.repeat(e.count)}$ = $${e.count}$ 次`).join('\n')}`,
        en: `${narrator}: "How to find it? Tally each value!\nData: $${sorted.join(', ')}$\n\n${freqEntries.map(e => `$${e.val}$: ${'|'.repeat(e.count)}$ = $${e.count}$ times`).join('\n')}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：谁的票数最多？\n$${modeValue}$ 出现了 $${modeCount}$ 次——比任何其他值都多！\n\n众数 = $${modeValue}$`,
        en: `${narrator}: "Who got the most votes?\n$${modeValue}$ appears $${modeCount}$ times — more than anything else!\n\nMode = $${modeValue}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n众数 = $${modeValue}$\n\n$${modeValue}$ 出现了 $${modeCount}$ 次，稳居第一！`,
        en: `${narrator}: "Answer\nMode = $${modeValue}$\n\n$${modeValue}$ appears $${modeCount}$ times — firmly in first place!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——确认没有其他值出现得更多\n${freqEntries.map(e => `$${e.val}$：${e.count} 次${e.val === modeValue ? ' ← 最多！' : ''}`).join('\n')}\n\n没有并列 → 众数唯一 = $${modeValue}$ ✓`,
        en: `${narrator}: "Verify — no other value appears more often\n${freqEntries.map(e => `$${e.val}$: ${e.count} times${e.val === modeValue ? ' ← most!' : ''}`).join('\n')}\n\nNo ties → unique mode = $${modeValue}$ ✓"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：小贴士\n• 两个值并列最多 → 两个众数\n• 所有值出现一样多 → 没有众数\n\n这道题：$${modeValue}$ 独占鳌头，做得漂亮！`,
        en: `${narrator}: "Tips\n• Two values tied for most → two modes\n• All values appear equally → no mode\n\nThis problem: $${modeValue}$ is clearly dominant — brilliantly done!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { values: sorted, mode: 'mode', modeValue, modeCount, generatorType: 'STATISTICS_MODE_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   TWO-STEP EQUATION generator: ax + b = c
   ══════════════════════════════════════════════════════════ */

export function generateTwoStepEqMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';

  const aPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7], 3: [3, 4, 5, 6, 7, 8, 9] };
  const xPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [3, 4, 5, 6, 7, 8], 3: [4, 5, 6, 7, 8, 9, 10] };
  const bPools: Record<DifficultyTier, number[]> = { 1: [1, 2, 3, 4, 5], 2: [2, 3, 4, 5, 7, 8], 3: [3, 5, 7, 9, 11] };

  const a = pickRandom(aPools[tier]);
  const x = pickRandom(xPools[tier]);
  const b = pickRandom(bPools[tier]);
  const result = a * x + b;

  const description: BilingualText = {
    zh: `解方程 $${a}x + ${b} = ${result}$，求 $x$。`,
    en: `Solve $${a}x + ${b} = ${result}$ for $x$.`,
  };

  const step1Result = result - b;

  const tutorialEquationSteps = [
    { tex: `${a}x + ${b} = ${result}`, annotation: { zh: '原方程', en: 'Original equation' } },
    { tex: `${a}x + ${b} - ${b} = ${result} - ${b}`, annotation: { zh: `两边 -${b}`, en: `-${b} both sides` } },
    { tex: `${a}x = ${step1Result}`, annotation: { zh: '化简', en: 'Simplify' } },
    { tex: `\\frac{${a}x}{${a}} = \\frac{${step1Result}}{${a}}`, annotation: { zh: `两边 ÷${a}`, en: `÷${a} both sides` } },
    { tex: `x = ${x}`, annotation: { zh: '求解', en: 'Solution' } },
  ];

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：一步方程你会了——现在升级：两步方程！\n两步方程 $${a}x + ${b} = ${result}$，$x$ 被包了两层！\n\n就像攻城——两道门：外门（$+${b}$）和内门（$\\times ${a}$）。先攻外门，再攻内门。`,
        en: `${narrator}: "You've mastered one-step — now level up: two-step equations!\n$${a}x + ${b} = ${result}$, $x$ is double-wrapped!\n\nLike a siege — two gates: outer ($+${b}$) and inner ($\\times ${a}$). Break outer first, then inner."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：$x$ 被怎么包的？\n① $x$ 先被乘以 $${a}$ → $${a}x$（内层）\n② $${a}x$ 再加 $${b}$ → $${a}x + ${b}$（外层）\n\n解方程 = 反过来拆：先拆外层，再拆内层！`,
        en: `${narrator}: "How is $x$ wrapped?\n① $x$ multiplied by $${a}$ → $${a}x$ (inner)\n② $${a}x$ plus $${b}$ → $${a}x + ${b}$ (outer)\n\nSolving = reverse: outer first, then inner!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：第一步——攻外门：两边减 $${b}$\n$${a}x + ${b} - ${b} = ${result} - ${b}$\n$+${b}$ 和 $-${b}$ 互相抵消！\n$${a}x = ${step1Result}$\n\n外门攻破！只剩内门了。`,
        en: `${narrator}: "Step 1 — break outer gate: subtract $${b}$ from both sides\n$${a}x + ${b} - ${b} = ${result} - ${b}$\n$+${b}$ and $-${b}$ cancel!\n$${a}x = ${step1Result}$\n\nOuter gate broken! Only inner gate remains."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：第二步——攻内门：两边除以 $${a}$\n$\\frac{${a}x}{${a}} = \\frac{${step1Result}}{${a}}$\n$\\times ${a}$ 和 $\\div ${a}$ 抵消！\n$x = ${x}$\n\n城门全破！$x$ 解放了！`,
        en: `${narrator}: "Step 2 — break inner gate: divide both sides by $${a}$\n$\\frac{${a}x}{${a}} = \\frac{${step1Result}}{${a}}$\n$\\times ${a}$ and $\\div ${a}$ cancel!\n$x = ${x}$\n\nAll gates broken! $x$ is free!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：验算——把 $x = ${x}$ 代回去\n$${a} \\times ${x} + ${b} = ${a * x} + ${b} = ${result}$ ✓\n\n和右边一样！答案正确。`,
        en: `${narrator}: "Verify — substitute $x = ${x}$ back\n$${a} \\times ${x} + ${b} = ${a * x} + ${b} = ${result}$ ✓\n\nMatches the right side! Answer confirmed."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：口诀——从外到内，逐层击破！\n① 看清两层：外层（加减）+ 内层（乘除）\n② 先拆外层（反操作：加→减）\n③ 再拆内层（反操作：乘→除）\n④ 代回验算\n\n两步方程就这么简单，做得漂亮！`,
        en: `${narrator}: "Rule — outside in, layer by layer!\n① Identify two layers: outer (add/sub) + inner (mul/div)\n② Remove outer with reverse operation\n③ Remove inner with reverse operation\n④ Verify by substituting back\n\nTwo-step equations — that simple! Brilliantly done!"`,
      },
      highlightField: 'x',
    },
  ];

  return {
    ...template,
    data: { ...template.data, x, a, b, result, left: `${a}x + ${b}`, right: `${result}`, generatorType: 'SIMPLE_EQ_TWOSTEP_RANDOM', tutorialEquationSteps },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   COORDINATES generator: read/identify coordinate points
   ══════════════════════════════════════════════════════════ */

export function generateCoordinatesMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';
  const mode: 'read' | 'negative' = template.data?.mode ?? 'read';

  let targetX: number, targetY: number;

  if (mode === 'negative' || tier >= 2) {
    // Include negative coordinates (quadrants II, III, IV)
    const ranges: Record<DifficultyTier, [number, number]> = { 1: [-5, 5], 2: [-8, 8], 3: [-10, 10] };
    const [lo, hi] = ranges[tier];
    targetX = randInt(lo, hi);
    targetY = randInt(lo, hi);
    // Avoid origin for meaningful questions
    if (targetX === 0 && targetY === 0) targetX = randInt(1, hi);
  } else {
    // First quadrant only (tier 1, mode 'read')
    targetX = randInt(1, 8);
    targetY = randInt(1, 8);
  }

  const quadrant = targetX > 0 && targetY > 0 ? 'I' : targetX < 0 && targetY > 0 ? 'II' : targetX < 0 && targetY < 0 ? 'III' : 'IV';
  const quadrantZh = { I: '第一象限（右上）', II: '第二象限（左上）', III: '第三象限（左下）', IV: '第四象限（右下）' }[quadrant];
  const quadrantEn = { I: 'Quadrant I (top-right)', II: 'Quadrant II (top-left)', III: 'Quadrant III (bottom-left)', IV: 'Quadrant IV (bottom-right)' }[quadrant];

  const description: BilingualText = {
    zh: `敌营位于坐标 $(${targetX}, ${targetY})$。输入 $x$ 和 $y$ 坐标。`,
    en: `Enemy camp is at $(${targetX}, ${targetY})$. Enter the $x$ and $y$ coordinates.`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要坐标？\n"敌军在东边"——太模糊了！"敌军在东 5 里、北 3 里"——精确！\n\n坐标就是用数字精确描述位置的方法。战场上每个点都有唯一的"数字地址"。`,
        en: `${narrator}: "Why do we need coordinates?\n'The enemy is east' — too vague! 'East 5, north 3' — precise!\n\nCoordinates use numbers to pinpoint locations. Every battlefield point has a unique 'numerical address'."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：坐标系——两条轴 + 原点\n想象一张方格地图：\n• 横着看（→）= $x$ 轴\n• 竖着看（↑）= $y$ 轴\n• 交叉点 = 原点 $(0, 0)$\n\n每个位置写成 $(x, y)$。口诀：**先横后竖，先 $x$ 后 $y$**！`,
        en: `${narrator}: "Coordinate system — two axes + origin\nImagine a grid map:\n• Horizontal (→) = $x$-axis\n• Vertical (↑) = $y$-axis\n• Where they cross = origin $(0, 0)$\n\nEvery position is $(x, y)$. Rule: **across first, then up — $x$ before $y$**!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：$x$ 坐标——横着走\n从原点出发，往右 = 正，往左 = 负。\n\n$x = ${targetX}$ 表示从原点往${targetX >= 0 ? `右走 $${targetX}$` : `左走 $${Math.abs(targetX)}$`} 步。`,
        en: `${narrator}: "$x$ coordinate — move horizontally\nFrom the origin, right = positive, left = negative.\n\n$x = ${targetX}$ means ${targetX >= 0 ? `$${targetX}$ steps right` : `$${Math.abs(targetX)}$ steps left`} from origin."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：$y$ 坐标——竖着走\n到了 $x$ 的位置后，往上 = 正，往下 = 负。\n\n$y = ${targetY}$ 表示往${targetY >= 0 ? `上走 $${targetY}$` : `下走 $${Math.abs(targetY)}$`} 步。`,
        en: `${narrator}: "$y$ coordinate — move vertically\nFrom the $x$ position, up = positive, down = negative.\n\n$y = ${targetY}$ means ${targetY >= 0 ? `$${targetY}$ steps up` : `$${Math.abs(targetY)}$ steps down`}."`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：答案\n$(${targetX}, ${targetY})$ 在${quadrantZh}。\n\n从原点：① 横走 ${targetX >= 0 ? `右 $${targetX}$` : `左 $${Math.abs(targetX)}$`} ② 竖走 ${targetY >= 0 ? `上 $${targetY}$` : `下 $${Math.abs(targetY)}$`}\n\n$x = ${targetX}$，$y = ${targetY}$`,
        en: `${narrator}: "Answer\n$(${targetX}, ${targetY})$ is in ${quadrantEn}.\n\nFrom origin: ① Horizontal ${targetX >= 0 ? `right $${targetX}$` : `left $${Math.abs(targetX)}$`} ② Vertical ${targetY >= 0 ? `up $${targetY}$` : `down $${Math.abs(targetY)}$`}\n\n$x = ${targetX}$, $y = ${targetY}$"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：记住四个象限\nI $(+,+)$ 右上 | II $(-,+)$ 左上\nIII $(-,-)$ 左下 | IV $(+,-)$ 右下\n\n永远先 $x$ 后 $y$，右上正正，逆时针转！做得漂亮！`,
        en: `${narrator}: "Remember the four quadrants\nI $(+,+)$ top-right | II $(-,+)$ top-left\nIII $(-,-)$ bottom-left | IV $(+,-)$ bottom-right\n\nAlways $x$ first then $y$, start top-right, go counter-clockwise! Brilliantly done!"`,
      },
      highlightField: 'x',
    },
  ];

  return {
    ...template,
    description,
    data: { targetX, targetY, mode, generatorType: 'COORDINATES_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   RATIO_Y7 generator: simplify ratios and divide in ratio
   ══════════════════════════════════════════════════════════ */

export function generateRatioY7Mission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '曹操';
  const mode: 'simplify' | 'divide' = template.data?.mode ?? 'simplify';

  if (mode === 'divide') {
    // Divide a total in a given ratio
    const ratioPools: Record<DifficultyTier, [number, number][]> = {
      1: [[1, 2], [1, 3], [2, 3], [1, 4]],
      2: [[2, 3], [3, 4], [2, 5], [3, 5], [1, 4]],
      3: [[3, 5], [2, 7], [3, 7], [4, 5], [5, 7]],
    };
    const [a, b] = pickRandom(ratioPools[tier]);
    const parts = a + b;
    const totalPools: Record<DifficultyTier, number[]> = {
      1: [parts * 5, parts * 10, parts * 4, parts * 6],
      2: [parts * 8, parts * 10, parts * 12, parts * 15],
      3: [parts * 10, parts * 15, parts * 20, parts * 25],
    };
    const total = pickRandom(totalPools[tier]);
    const answerA = total * a / parts;
    const answerB = total * b / parts;
    // Ask for the smaller share (x)
    const answer = answerA;

    const description: BilingualText = {
      zh: `把 $${total}$ 按 $${a}:${b}$ 分配，较小份是多少？`,
      en: `Divide $${total}$ in the ratio $${a}:${b}$. What is the smaller share?`,
    };

    const eachPart = total / parts;

    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：为什么要学"按比分配"？\n打仗立功，赏金不能平分——谁功劳大谁拿多。$${a}:${b}$ 就是分配方案。\n\n想象切蛋糕：一共切 $${parts}$ 块，甲拿 $${a}$ 块，乙拿 $${b}$ 块。\n比例不是具体数量，是"几份对几份"！`,
          en: `${narrator}: "Why learn 'dividing in a ratio'?\nWar rewards can't be split equally — bigger contribution, bigger share. $${a}:${b}$ is the split plan.\n\nImagine cutting a cake: $${parts}$ slices total, A gets $${a}$, B gets $${b}$.\nRatio isn't amounts — it's 'how many parts each'!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：第一步——算总份数\n$${a}:${b}$ → 总份数 $= ${a} + ${b} = ${parts}$\n\n蛋糕一共切 $${parts}$ 块。这一步很关键——漏了就全错！`,
          en: `${narrator}: "Step 1 — find total parts\n$${a}:${b}$ → total parts $= ${a} + ${b} = ${parts}$\n\nCake gets cut into $${parts}$ pieces. This step is crucial — miss it and everything goes wrong!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：第二步——算每份值多少\n总共 $${total}$ 金，分成 $${parts}$ 份：\n每份 $= ${total} \\div ${parts} = ${eachPart}$ 金\n\n每一块蛋糕值 $${eachPart}$ 金！`,
          en: `${narrator}: "Step 2 — find the value of each part\nTotal $${total}$ gold, divided into $${parts}$ parts:\nEach part $= ${total} \\div ${parts} = ${eachPart}$ gold\n\nEach slice of cake is worth $${eachPart}$ gold!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：第三步——各方拿走自己的份\n甲（$${a}$ 份）：$${a} \\times ${eachPart} = ${answerA}$ 金\n乙（$${b}$ 份）：$${b} \\times ${eachPart} = ${answerB}$ 金\n\n较小份 = $${answer}$ 金。`,
          en: `${narrator}: "Step 3 — each takes their share\nA ($${a}$ parts): $${a} \\times ${eachPart} = ${answerA}$ gold\nB ($${b}$ parts): $${b} \\times ${eachPart} = ${answerB}$ gold\n\nSmaller share = $${answer}$ gold."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：答案\n较小份 = $${answer}$ 金\n\n$${total}$ 金按 $${a}:${b}$ 分 → $${answerA}$ 和 $${answerB}$。`,
          en: `${narrator}: "Answer\nSmaller share = $${answer}$ gold\n\n$${total}$ gold in ratio $${a}:${b}$ → $${answerA}$ and $${answerB}$."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：验算——两份加起来等于总数吗？\n$${answerA} + ${answerB} = ${total}$ ✓\n\n比例对吗？$${answerA} : ${answerB} = ${a} : ${b}$ ✓\n\n赏金分配完毕，公平公正！做得漂亮！`,
          en: `${narrator}: "Verify — do both shares add to the total?\n$${answerA} + ${answerB} = ${total}$ ✓\n\nRatio correct? $${answerA} : ${answerB} = ${a} : ${b}$ ✓\n\nRewards distributed fairly! Brilliantly done!"`,
        },
        highlightField: 'ans',
      },
    ];

    return {
      ...template,
      description,
      data: { a, b, total, answer, mode, generatorType: 'RATIO_Y7_RANDOM' },
      tutorialSteps,
    };
  } else {
    // Simplify a ratio
    const gcdPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6], 3: [3, 4, 5, 6, 8, 10] };
    const simplePairs: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [1, 5]];
    const [sa, sb] = pickRandom(simplePairs);
    const g = pickRandom(gcdPools[tier]);
    const a = sa * g;
    const b = sb * g;
    // Answer is the simplified first term
    const answer = sa;

    const description: BilingualText = {
      zh: `化简比 $${a}:${b}$，最简比的第一项是多少？`,
      en: `Simplify $${a}:${b}$. What is the first term of the simplest ratio?`,
    };

    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：化简比——和约分是一回事！\n"步兵 $${a}$ 人，骑兵 $${b}$ 人"写成比就是 $${a}:${b}$。\n\n比例和分数是亲戚：$${a}:${b}$ 就像 $\\frac{${a}}{${b}}$。\n化简比 = 约分 = 找最大公因数！`,
          en: `${narrator}: "Simplifying ratios — same as simplifying fractions!\n'$${a}$ infantry, $${b}$ cavalry' as a ratio is $${a}:${b}$.\n\nRatios and fractions are related: $${a}:${b}$ is like $\\frac{${a}}{${b}}$.\nSimplify ratio = simplify fraction = find the HCF!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：为什么要化简？\n$${a}:${b}$ 和 $${sa}:${sb}$ 是同一个比例——但 $${sa}:${sb}$ 更简洁！\n\n就像 $\\frac{4}{8}$ 和 $\\frac{1}{2}$ 一样大，但 $\\frac{1}{2}$ 更清楚。\n化简 = 用最小的数字表达同一个关系。`,
          en: `${narrator}: "Why simplify?\n$${a}:${b}$ and $${sa}:${sb}$ are the same ratio — but $${sa}:${sb}$ is cleaner!\n\nLike $\\frac{4}{8}$ and $\\frac{1}{2}$ are equal, but $\\frac{1}{2}$ is clearer.\nSimplify = smallest numbers, same relationship."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：怎么化简？找 $${a}$ 和 $${b}$ 的最大公因数（HCF）！\n$${a}$ 的因数：$${Array.from({length: a}, (_, i) => i + 1).filter(i => a % i === 0).join(', ')}$\n$${b}$ 的因数：$${Array.from({length: b}, (_, i) => i + 1).filter(i => b % i === 0).join(', ')}$\n\n最大公因数 = $${g}$——还记得 Unit 0 学的 HCF 吗？这里派上用场了！`,
          en: `${narrator}: "How? Find the HCF of $${a}$ and $${b}$!\nFactors of $${a}$: $${Array.from({length: a}, (_, i) => i + 1).filter(i => a % i === 0).join(', ')}$\nFactors of $${b}$: $${Array.from({length: b}, (_, i) => i + 1).filter(i => b % i === 0).join(', ')}$\n\nHCF = $${g}$ — remember HCF from Unit 0? It's useful here!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：两项同时除以 HCF\n$${a} \\div ${g} = ${sa}$\n$${b} \\div ${g} = ${sb}$\n\n所以 $${a}:${b} = ${sa}:${sb}$——就这么简单！`,
          en: `${narrator}: "Divide both terms by the HCF\n$${a} \\div ${g} = ${sa}$\n$${b} \\div ${g} = ${sb}$\n\nSo $${a}:${b} = ${sa}:${sb}$ — that's it!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：答案\n$${a}:${b} = ${sa}:${sb}$，第一项 = $${sa}$`,
          en: `${narrator}: "Answer\n$${a}:${b} = ${sa}:${sb}$, first term = $${sa}$"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：验算——$${sa}:${sb}$ 还能再化简吗？\n$${sa}$ 和 $${sb}$ 的公因数只有 $1$（互质）→ 已经最简 ✓\n\n知识回环：HCF（Unit 0）→ 约分（Unit 0B）→ 化简比（这里！）\n学过的东西都串起来了，做得漂亮！`,
          en: `${narrator}: "Verify — can $${sa}:${sb}$ be simplified further?\nHCF of $${sa}$ and $${sb}$ is $1$ (coprime) → already simplest ✓\n\nKnowledge loop: HCF (Unit 0) → Simplify fractions (Unit 0B) → Simplify ratios (here!)\nEverything connects — brilliantly done!"`,
        },
        highlightField: 'ans',
      },
    ];

    return {
      ...template,
      description,
      data: { a, b, sa, sb, g, answer, mode, generatorType: 'RATIO_Y7_RANDOM' },
      tutorialSteps,
    };
  }
}

/* ══════════════════════════════════════════════════════════
   MIXED_IMPROPER generator: convert between mixed numbers
   and improper fractions
   ══════════════════════════════════════════════════════════ */

export function generateMixedImproperMission(template: Mission): Mission {
  const tier = getTier();
  const narrator = (template.tutorialSteps?.[0]?.text?.zh?.split(/[:\uff1a]/)?.[0]) || '诸葛亮';
  const mode: 'to_improper' | 'to_mixed' = template.data?.mode ?? 'to_improper';

  const wholePools: Record<DifficultyTier, number[]> = { 1: [1, 2, 3], 2: [1, 2, 3, 4, 5], 3: [2, 3, 4, 5, 6, 7] };
  const denPools: Record<DifficultyTier, number[]> = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 7, 8], 3: [3, 4, 5, 6, 7, 8, 9, 10] };

  const whole = pickRandom(wholePools[tier]);
  const den = pickRandom(denPools[tier]);
  const num = randInt(1, den - 1); // proper fraction part: 0 < num < den
  const improperNum = whole * den + num; // e.g., 2⅗ → (2×5+3)/5 = 13/5

  if (mode === 'to_improper') {
    // Given mixed number → find improper fraction numerator
    const answer = improperNum;

    const description: BilingualText = {
      zh: `把带分数 $${whole}\\frac{${num}}{${den}}$ 化成假分数，分子是多少？`,
      en: `Convert $${whole}\\frac{${num}}{${den}}$ to an improper fraction. What is the numerator?`,
    };

    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：什么是带分数和假分数？\n带分数 = 整数 + 真分数，比如 $${whole}\\frac{${num}}{${den}}$ = ${whole} 又 $\\frac{${num}}{${den}}$。\n假分数 = 分子 ≥ 分母，比如 $\\frac{${improperNum}}{${den}}$。\n\n它们是同一个数的两种写法！`,
          en: `${narrator}: "What are mixed numbers and improper fractions?\nMixed = whole + proper fraction, e.g. $${whole}\\frac{${num}}{${den}}$ = ${whole} and $\\frac{${num}}{${den}}$.\nImproper = numerator ≥ denominator, e.g. $\\frac{${improperNum}}{${den}}$.\n\nSame number, two forms!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：为什么要互转？\n带分数好理解（"${whole}块多一点"），假分数好计算（乘除法更方便）。\n\n就像整箱+散装粮草全拆成散装——方便统一计算！`,
          en: `${narrator}: "Why convert?\nMixed numbers are easy to understand ('${whole} and a bit'), improper fractions are easy to calculate (better for × ÷).\n\nLike unpacking full crates into loose items — easier to count!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：转换方法——整数×分母+分子\n想象 ${whole} 个饼，每个切成 ${den} 份：\n${whole} 个饼 = $${whole} \\times ${den} = ${whole * den}$ 份\n加上散装 ${num} 份：$${whole * den} + ${num} = ${improperNum}$ 份\n\n分母不变，还是 ${den}。所以 $${whole}\\frac{${num}}{${den}} = \\frac{${improperNum}}{${den}}$`,
          en: `${narrator}: "Method — whole × denominator + numerator\nImagine ${whole} pies, each cut into ${den} slices:\n${whole} pies = $${whole} \\times ${den} = ${whole * den}$ slices\nPlus ${num} loose: $${whole * den} + ${num} = ${improperNum}$ slices\n\nDenominator stays ${den}. So $${whole}\\frac{${num}}{${den}} = \\frac{${improperNum}}{${den}}$"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：公式一步到位\n$${whole}\\frac{${num}}{${den}} = \\frac{${whole} \\times ${den} + ${num}}{${den}} = \\frac{${improperNum}}{${den}}$\n\n分子 = $${improperNum}$。就这么简单！`,
          en: `${narrator}: "Formula in one step\n$${whole}\\frac{${num}}{${den}} = \\frac{${whole} \\times ${den} + ${num}}{${den}} = \\frac{${improperNum}}{${den}}$\n\nNumerator = $${improperNum}$. That's it!"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：答案\n分子 = $${improperNum}$\n\n$${whole}\\frac{${num}}{${den}} = \\frac{${improperNum}}{${den}}$`,
          en: `${narrator}: "Answer\nNumerator = $${improperNum}$\n\n$${whole}\\frac{${num}}{${den}} = \\frac{${improperNum}}{${den}}$"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：验算——反过来除\n$${improperNum} \\div ${den} = ${whole}$ 余 $${num}$\n→ $\\frac{${improperNum}}{${den}} = ${whole}\\frac{${num}}{${den}}$ ✓\n\n口诀：整数×分母+分子，分母不变。做得漂亮！`,
          en: `${narrator}: "Verify — divide back\n$${improperNum} \\div ${den} = ${whole}$ remainder $${num}$\n→ $\\frac{${improperNum}}{${den}} = ${whole}\\frac{${num}}{${den}}$ ✓\n\nRule: whole × denom + numerator, denom stays. Brilliantly done!"`,
        },
        highlightField: 'ans',
      },
    ];

    return {
      ...template,
      description,
      data: { whole, num, den, improperNum, answer, mode, generatorType: 'MIXED_IMPROPER_RANDOM' },
      tutorialSteps,
    };
  } else {
    // Given improper fraction → find whole number part
    const answer = whole;

    const description: BilingualText = {
      zh: `把假分数 $\\frac{${improperNum}}{${den}}$ 化成带分数，整数部分是多少？`,
      en: `Convert $\\frac{${improperNum}}{${den}}$ to a mixed number. What is the whole number part?`,
    };

    const tutorialSteps = [
      {
        text: {
          zh: `${narrator}：假分数是什么意思？\n$\\frac{${improperNum}}{${den}}$：有 ${improperNum} 份，每 ${den} 份组成 1 个整体。\n$${improperNum} > ${den}$，肯定超过 1 个整体！\n\n具体超过多少？做个除法就知道了。`,
          en: `${narrator}: "What does an improper fraction mean?\n$\\frac{${improperNum}}{${den}}$: ${improperNum} slices, every ${den} makes 1 whole.\n$${improperNum} > ${den}$, so definitely more than 1 whole!\n\nExactly how many? Division will tell us."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：方法——分子 ÷ 分母\n$${improperNum} \\div ${den}$：$${den} \\times ${whole} = ${whole * den}$（还剩 $${improperNum} - ${whole * den} = ${num}$）\n\n商 $${whole}$ = 整数部分（装满了几个整饼）\n余数 $${num}$ = 新分子（散装几份）\n分母不变 = $${den}$`,
          en: `${narrator}: "Method — numerator ÷ denominator\n$${improperNum} \\div ${den}$: $${den} \\times ${whole} = ${whole * den}$ (remaining: $${improperNum} - ${whole * den} = ${num}$)\n\nQuotient $${whole}$ = whole part (how many full pies)\nRemainder $${num}$ = new numerator (loose slices)\nDenominator stays = $${den}$"`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：答案\n$\\frac{${improperNum}}{${den}} = ${whole}\\frac{${num}}{${den}}$\n\n${improperNum} 份饼 = ${whole} 整个 + ${num} 份散装。整数部分 = $${whole}$。`,
          en: `${narrator}: "Answer\n$\\frac{${improperNum}}{${den}} = ${whole}\\frac{${num}}{${den}}$\n\n${improperNum} slices = ${whole} whole pies + ${num} loose. Whole part = $${whole}$."`,
        },
        highlightField: 'ans',
      },
      {
        text: {
          zh: `${narrator}：验算——转回假分数检查\n$${whole} \\times ${den} + ${num} = ${whole * den} + ${num} = ${improperNum}$\n$\\frac{${improperNum}}{${den}}$ ✓\n\n口诀：分子÷分母，商=整数，余数=新分子。做得漂亮！`,
          en: `${narrator}: "Verify — convert back to check\n$${whole} \\times ${den} + ${num} = ${whole * den} + ${num} = ${improperNum}$\n$\\frac{${improperNum}}{${den}}$ ✓\n\nRule: numerator ÷ denom, quotient = whole, remainder = new numerator. Brilliantly done!"`,
        },
        highlightField: 'ans',
      },
    ];

    return {
      ...template,
      description,
      data: { whole, num, den, improperNum, answer, mode, generatorType: 'MIXED_IMPROPER_RANDOM' },
      tutorialSteps,
    };
  }
}

// ========== Y8 Generators ==========

export function generateExpandMission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['诸葛亮', '庞统', '徐庶'];
  const narrator = pickRandom(narrators);

  // Tier pools: a(bx + c)
  const aPools: Record<number, number[]> = { 1: [2, 3], 2: [2, 3, 4, 5], 3: [3, 4, 5, 6, 7] };
  const bPools: Record<number, number[]> = { 1: [1, 2], 2: [2, 3, 4], 3: [3, 4, 5, 6] };
  const cPools: Record<number, number[]> = { 1: [1, 2, 3], 2: [2, 3, 4, 5], 3: [3, 4, 5, 6, 7, 8] };

  const a = pickRandom(aPools[tier]);
  const b = pickRandom(bPools[tier]);
  const c = pickRandom(cPools[tier]);
  const ab = a * b;
  const ac = a * c;
  const answer = ab;

  const description = {
    zh: `展开 $${a}(${b}x + ${c})$，$x$ 的系数是多少？`,
    en: `Expand $${a}(${b}x + ${c})$. What is the coefficient of $x$?`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学展开括号？\n你想啊，你是军需官，要给 ${a} 支小队发装备。\n每队要 ${b} 把刀和 ${c} 张弓。\n那总共要多少？把每队的需求乘以队伍数——这就是"展开"！`,
        en: `${narrator}: "Why learn to expand brackets?\nThink about it — you're the quartermaster, supplying ${a} squads.\nEach squad needs ${b} swords and ${c} bows.\nHow many in total? Multiply each squad's needs by the number of squads — that's 'expanding'!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：展开的规则其实特别简单\n就一句话：外面的数要跟里面的**每一项**都乘一遍。\n就像发东西——每种物资都得发到，不能漏掉任何一项！\n\n$${a}(${b}x + ${c})$ = $${a} \\times ${b}x$ ＋ $${a} \\times ${c}$`,
        en: `${narrator}: "The rule for expanding is really simple\nOne sentence: the outside number multiplies EVERY term inside.\nLike handing out supplies — every type of gear gets distributed, nothing skipped!\n\n$${a}(${b}x + ${c})$ = $${a} \\times ${b}x$ + $${a} \\times ${c}$"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：先算第一项\n外面的 $${a}$ 乘以里面的第一项 $${b}x$：\n$${a} \\times ${b}x = ${ab}x$\n\n就是说：${a} 支队 × 每队 ${b} 把刀 = ${ab} 把刀！`,
        en: `${narrator}: "Calculate the first term\nThe outside $${a}$ times the first inside term $${b}x$:\n$${a} \\times ${b}x = ${ab}x$\n\nThat means: ${a} squads × ${b} swords each = ${ab} swords!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：再算第二项\n外面的 $${a}$ 乘以里面的第二项 $${c}$：\n$${a} \\times ${c} = ${ac}$\n\n${a} 支队 × 每队 ${c} 张弓 = ${ac} 张弓！\n两项都算完了，你真棒！`,
        en: `${narrator}: "Now the second term\nThe outside $${a}$ times the second inside term $${c}$:\n$${a} \\times ${c} = ${ac}$\n\n${a} squads × ${c} bows each = ${ac} bows!\nBoth terms done — great job!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：把两项拼起来就是答案\n$${a}(${b}x + ${c}) = ${ab}x + ${ac}$\n\n题目问 $x$ 的系数是多少？就是 $x$ 前面那个数：$${ab}$\n\n总共 ${ab} 把刀和 ${ac} 张弓，装备齐全！`,
        en: `${narrator}: "Put both terms together for the answer\n$${a}(${b}x + ${c}) = ${ab}x + ${ac}$\n\nThe question asks for the coefficient of $x$ — that's the number in front: $${ab}$\n\n${ab} swords and ${ac} bows — fully equipped!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——代个数检查一下\n让 $x = 1$，看两边是不是一样：\n左边：$${a}(${b} \\times 1 + ${c}) = ${a} \\times ${b + c} = ${a * (b + c)}$\n右边：$${ab} \\times 1 + ${ac} = ${ab + ac}$\n$${a * (b + c)} = ${ab + ac}$ ✓ 一模一样！\n\n军需发放零误差，完美！`,
        en: `${narrator}: "Verify — plug in a number to check\nLet $x = 1$, see if both sides match:\nLeft: $${a}(${b} \\times 1 + ${c}) = ${a} \\times ${b + c} = ${a * (b + c)}$\nRight: $${ab} \\times 1 + ${ac} = ${ab + ac}$\n$${a * (b + c)} = ${ab + ac}$ ✓ Exact match!\n\nZero errors in supply distribution — perfect!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { a, b, c, ab, ac, answer, generatorType: 'EXPAND_RANDOM' },
    tutorialSteps,
  };
}

export function generateFactoriseMission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['诸葛亮', '庞统', '徐庶'];
  const narrator = pickRandom(narrators);

  const factorPools: Record<number, number[]> = { 1: [2, 3], 2: [2, 3, 4, 5], 3: [3, 4, 5, 6, 7] };
  const pPools: Record<number, number[]> = { 1: [1, 2], 2: [1, 2, 3], 3: [2, 3, 4, 5] };
  const qPools: Record<number, number[]> = { 1: [1, 3], 2: [1, 3, 5, 7], 3: [1, 3, 5, 7, 9] };

  const factor = pickRandom(factorPools[tier]);
  const p = pickRandom(pPools[tier]);
  const q = pickRandom(qPools[tier]);
  const a = factor * p;
  const b = factor * q;
  const answer = factor;

  const description = {
    zh: `因式分解 $${a}x + ${b}$，最大公因数是？`,
    en: `Factorise $${a}x + ${b}$. What is the HCF?`,
  };

  const getFactorsStrLocal = (n: number): string => {
    const factors: number[] = [];
    for (let i = 1; i <= n; i++) { if (n % i === 0) factors.push(i); }
    return factors.join(', ');
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：因式分解是什么？其实就是"展开"的反操作\n展开是拆包裹：$${factor}(${p}x + ${q}) = ${a}x + ${b}$\n因式分解是重新打包：$${a}x + ${b} = ?(... + ...)$\n\n想象桌上散着 ${a} 把刀和 ${b} 张弓，你要把它们按"每队一份"重新打包。\n第一件事：找出每种东西的"公共份数"——也就是最大公因数！`,
        en: `${narrator}: "What is factorising? It's just the REVERSE of expanding!\nExpanding is unpacking: $${factor}(${p}x + ${q}) = ${a}x + ${b}$\nFactorising is re-packing: $${a}x + ${b} = ?(...+...)$\n\nImagine ${a} swords and ${b} bows scattered on the table — you need to re-pack them into squad bundles.\nFirst job: find how many squads they can split into equally — the highest common factor!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：找 $${a}$ 和 $${b}$ 的最大公因数\n$${a}$ 能被哪些数整除？${getFactorsStrLocal(a)}\n$${b}$ 能被哪些数整除？${getFactorsStrLocal(b)}\n\n两边都有的最大的数是几？是 $${factor}$！\n这就是它们的最大公因数。`,
        en: `${narrator}: "Find the HCF of $${a}$ and $${b}$\nWhat divides $${a}$ evenly? ${getFactorsStrLocal(a)}\nWhat divides $${b}$ evenly? ${getFactorsStrLocal(b)}\n\nThe biggest number in BOTH lists? It's $${factor}$!\nThat's their highest common factor."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：用最大公因数去除每一项\n$${a}x \\div ${factor} = ${p}x$（${a} 把刀分成 ${factor} 份，每份 ${p} 把）\n$${b} \\div ${factor} = ${q}$（${b} 张弓分成 ${factor} 份，每份 ${q} 张）\n\n看，分得刚刚好，没有剩余！`,
        en: `${narrator}: "Divide each term by the HCF\n$${a}x \\div ${factor} = ${p}x$ (${a} swords into ${factor} packs = ${p} each)\n$${b} \\div ${factor} = ${q}$ (${b} bows into ${factor} packs = ${q} each)\n\nSee — divides perfectly, nothing left over!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：拼起来就行了\n公因数放外面，除完的结果放括号里：\n$${a}x + ${b} = ${factor}(${p}x + ${q})$\n\n意思就是：${factor} 个包裹，每个包裹里 ${p} 把刀和 ${q} 张弓。`,
        en: `${narrator}: "Put it together\nHCF goes outside, the quotients go inside brackets:\n$${a}x + ${b} = ${factor}(${p}x + ${q})$\n\nMeaning: ${factor} packs, each containing ${p} swords and ${q} bows."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n提出来的公因数 = $${factor}$\n\n$${a}x + ${b} = ${factor}(${p}x + ${q})$\n做得好！因式分解就是"打包"，你学会了！`,
        en: `${narrator}: "Answer\nThe common factor = $${factor}$\n\n$${a}x + ${b} = ${factor}(${p}x + ${q})$\nWell done — factorising is just 're-packing', and you've got it!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——拆开检查\n把包裹拆开看看对不对：\n$${factor} \\times ${p}x = ${a}x$ ✓\n$${factor} \\times ${q} = ${b}$ ✓\n\n$${factor}(${p}x + ${q}) = ${a}x + ${b}$ ✓ 完全一致！\n军需打包零失误！`,
        en: `${narrator}: "Verify — unpack and check\nOpen the packs to see if they're right:\n$${factor} \\times ${p}x = ${a}x$ ✓\n$${factor} \\times ${q} = ${b}$ ✓\n\n$${factor}(${p}x + ${q}) = ${a}x + ${b}$ ✓ Perfect match!\nZero packing errors!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { factor, p, q, a, b, answer, generatorType: 'FACTORISE_RANDOM' },
    tutorialSteps,
  };
}

export function generateInequalityMission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['诸葛亮', '庞统', '荀彧'];
  const narrator = pickRandom(narrators);

  const aPools: Record<number, number[]> = { 1: [2, 3], 2: [2, 3, 4], 3: [3, 4, 5, 6] };
  const bPools: Record<number, number[]> = { 1: [1, 2, 3], 2: [2, 3, 4, 5], 3: [3, 5, 7, 9] };

  const a = pickRandom(aPools[tier]);
  const b = pickRandom(bPools[tier]);
  const answerVal = pickRandom([1, 2, 3, 4, 5, 6].slice(0, tier + 2));
  const c = a * answerVal + b;
  const ops = ['<', '>'];
  const op = pickRandom(ops);
  const answer = answerVal;

  const description = {
    zh: `解不等式 $${a}x + ${b} ${op} ${c}$，$x ${op}$ ?`,
    en: `Solve $${a}x + ${b} ${op} ${c}$. $x ${op}$ ?`,
  };

  const opWordZh = op === '<' ? '小于' : '大于';
  const opWordEn = op === '<' ? 'less than' : 'greater than';
  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：不等式和方程有什么不一样？\n方程用的是"$=$"（等号），答案只有一个数。\n不等式用的是"$${op}$"（${opWordZh}号），答案是一个**范围**。\n\n你可以想象城门有个限高杆——不是说刚好那个高度才能过，\n而是"${op === '<' ? '矮于这个高度的都能过' : '高于这个高度的才能过'}"。`,
        en: `${narrator}: "How is an inequality different from an equation?\nAn equation uses '$=$' (equals) — there's exactly one answer.\nAn inequality uses '$${op}$' (${opWordEn}) — the answer is a RANGE.\n\nImagine a height barrier at the gate — it's not about being exactly that height,\nit's about '${op === '<' ? 'anything shorter can pass' : 'only taller ones can pass'}'."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：好消息！解法跟方程**一模一样**\n$${a}x + ${b} ${op} ${c}$\n\n两边加减乘除同一个正数，不等号方向不变。\n（只有乘除负数才要翻方向，但这题不需要，放心！）\n跟解方程一样，把 $x$ 单独留在一边就行！`,
        en: `${narrator}: "Good news! The solving method is EXACTLY the same as equations\n$${a}x + ${b} ${op} ${c}$\n\nAdd, subtract, multiply, or divide both sides by the same positive number — the sign stays.\n(Only multiplying by a negative flips it, but we don't need that here — no worries!)\nJust get $x$ alone on one side!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：先把多余的数搬走——两边减 $${b}$\n$${a}x + ${b} - ${b} ${op} ${c} - ${b}$\n$${a}x ${op} ${c - b}$\n\n看，$+${b}$ 和 $-${b}$ 互相抵消了，$x$ 这边更干净了！`,
        en: `${narrator}: "First, move the extra number — subtract $${b}$ from both sides\n$${a}x + ${b} - ${b} ${op} ${c} - ${b}$\n$${a}x ${op} ${c - b}$\n\nSee, $+${b}$ and $-${b}$ cancel out — $x$'s side is cleaner now!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：再除以 $${a}$，把 $x$ 完全解放出来\n$\\frac{${a}x}{${a}} ${op} \\frac{${c - b}}{${a}}$\n$x ${op} ${answerVal}$\n\n（$${a}$ 是正数，不等号方向不变 ✓）\n$x$ 找到了！`,
        en: `${narrator}: "Now divide by $${a}$ to free $x$ completely\n$\\frac{${a}x}{${a}} ${op} \\frac{${c - b}}{${a}}$\n$x ${op} ${answerVal}$\n\n($${a}$ is positive, so the sign doesn't flip ✓)\n$x$ found!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$x ${op} ${answerVal}$\n\n这个 $${answerVal}$ 就是分界线——${op === '<' ? '$x$ 只要比 ' + answerVal + ' 小就满足条件' : '$x$ 只要比 ' + answerVal + ' 大就满足条件'}。\n你做得很好！`,
        en: `${narrator}: "Answer\n$x ${op} ${answerVal}$\n\nThis $${answerVal}$ is the boundary — ${op === '<' ? '$x$ just needs to be less than ' + answerVal + ' to satisfy the condition' : '$x$ just needs to be greater than ' + answerVal + ' to satisfy the condition'}.\nGreat work!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: op === '<'
          ? `${narrator}：验算——试两个数看看\n试 $x = ${answerVal - 1}$（应该满足）：\n$${a} \\times ${answerVal - 1} + ${b} = ${a * (answerVal - 1) + b}$，$${a * (answerVal - 1) + b} < ${c}$ ✓ 对的！\n\n试 $x = ${answerVal + 1}$（应该不满足）：\n$${a} \\times ${answerVal + 1} + ${b} = ${a * (answerVal + 1) + b}$，$${a * (answerVal + 1) + b} < ${c}$ ✗ 果然不行！\n\n分界线验证通过，完美！`
          : `${narrator}：验算——试两个数看看\n试 $x = ${answerVal + 1}$（应该满足）：\n$${a} \\times ${answerVal + 1} + ${b} = ${a * (answerVal + 1) + b}$，$${a * (answerVal + 1) + b} > ${c}$ ✓ 对的！\n\n试 $x = ${answerVal - 1}$（应该不满足）：\n$${a} \\times ${answerVal - 1} + ${b} = ${a * (answerVal - 1) + b}$，$${a * (answerVal - 1) + b} > ${c}$ ✗ 果然不行！\n\n分界线验证通过，完美！`,
        en: op === '<'
          ? `${narrator}: "Verify — try two numbers\nTry $x = ${answerVal - 1}$ (should work):\n$${a} \\times ${answerVal - 1} + ${b} = ${a * (answerVal - 1) + b}$, $${a * (answerVal - 1) + b} < ${c}$ ✓ Correct!\n\nTry $x = ${answerVal + 1}$ (shouldn't work):\n$${a} \\times ${answerVal + 1} + ${b} = ${a * (answerVal + 1) + b}$, $${a * (answerVal + 1) + b} < ${c}$ ✗ Indeed not!\n\nBoundary verified — perfect!"`
          : `${narrator}: "Verify — try two numbers\nTry $x = ${answerVal + 1}$ (should work):\n$${a} \\times ${answerVal + 1} + ${b} = ${a * (answerVal + 1) + b}$, $${a * (answerVal + 1) + b} > ${c}$ ✓ Correct!\n\nTry $x = ${answerVal - 1}$ (shouldn't work):\n$${a} \\times ${answerVal - 1} + ${b} = ${a * (answerVal - 1) + b}$, $${a * (answerVal - 1) + b} > ${c}$ ✗ Indeed not!\n\nBoundary verified — perfect!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { a, b, c, op, answer, generatorType: 'INEQUALITY_RANDOM' },
    tutorialSteps,
  };
}

export function generateStdFormMission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['诸葛亮', '曹操', '荀彧'];
  const narrator = pickRandom(narrators);

  const aPools: Record<number, number[]> = { 1: [2, 3, 5], 2: [1.5, 2.4, 3.6, 4.5], 3: [1.23, 2.56, 3.78, 4.91, 6.02] };
  const nPools: Record<number, number[]> = { 1: [2, 3], 2: [3, 4, 5], 3: [4, 5, 6, 7] };

  const a = pickRandom(aPools[tier]);
  const n = pickRandom(nPools[tier]);
  const number = a * Math.pow(10, n);
  const numberStr = number.toLocaleString('en-US');

  const description = {
    zh: `把 $${numberStr}$ 写成标准式 $a \\times 10^n$`,
    en: `Write $${numberStr}$ in standard form $a \\times 10^n$`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要标准式？\n你试试写一下曹操的百万大军——$1,000,000$。好长对不对？容易数错零！\n标准式就是把大数字"缩写"成一个简洁的形式：$1 \\times 10^6$。\n\n简洁、不会写错、一眼就能比大小。科学家、工程师天天用它！`,
        en: `${narrator}: "Why do we need standard form?\nTry writing Cao Cao's million-strong army — $1,000,000$. So long! Easy to miscount zeros!\nStandard form 'compresses' big numbers into a neat form: $1 \\times 10^6$.\n\nNeat, error-free, easy to compare. Scientists and engineers use it every day!"`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：标准式的两个规则\n$a \\times 10^n$——就这个格式，记住两条：\n• $a$ 必须在 $1$ 到 $10$ 之间（$3.6$ 可以，$36$ 不行，$0.5$ 也不行）\n• $n$ 就是小数点挪了几位\n\n就像报军情：先说最关键的数字（$a$），再说规模是"万"还是"百万"（$10^n$）。`,
        en: `${narrator}: "Two rules of standard form\n$a \\times 10^n$ — just this format, remember two things:\n• $a$ must be between $1$ and $10$ ($3.6$ is fine, $36$ is not, $0.5$ isn't either)\n• $n$ is how many places the decimal moved\n\nLike a military report: state the key figure ($a$) first, then the scale — 'ten-thousands' or 'millions' ($10^n$)."`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：第一步——找 $a$\n看这个数：$${numberStr}$\n把小数点挪到第一个非零数字后面，让它变成 $1$ 到 $10$ 之间的数。\n\n$a = ${a}$ ✓ 在 $1$ 到 $10$ 之间——完美！就像挑出军情中最关键的数字。`,
        en: `${narrator}: "Step 1 — find $a$\nLook at this number: $${numberStr}$\nMove the decimal after the first non-zero digit to get a number between $1$ and $10$.\n\n$a = ${a}$ ✓ Between $1$ and $10$ — perfect! Like picking out the key figure in a report."`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：第二步——数小数点挪了几位\n从 $${numberStr}$ 变成 $${a}$，小数点往左跳了几步？\n数一数……$${n}$ 步！所以 $n = ${n}$。\n\n$n$ 越大，说明原来的数越大——$10^{${n}}$ 就是 $${Math.pow(10, n).toLocaleString('en-US')}$！`,
        en: `${narrator}: "Step 2 — count decimal places moved\nFrom $${numberStr}$ to $${a}$, how many jumps left did the decimal make?\nCount... $${n}$ jumps! So $n = ${n}$.\n\nThe bigger $n$ is, the bigger the original number — $10^{${n}}$ is $${Math.pow(10, n).toLocaleString('en-US')}$!"`,
      },
      highlightField: 'n',
    },
    {
      text: {
        zh: `${narrator}：答案\n$$${numberStr} = ${a} \\times 10^{${n}}$$\n\n$a = ${a}$，$n = ${n}$——大数字瞬间变简洁！\n以后遇到再大的数字都不怕了。`,
        en: `${narrator}: "Answer\n$$${numberStr} = ${a} \\times 10^{${n}}$$\n\n$a = ${a}$, $n = ${n}$ — the big number is now compact!\nNo matter how large the number, you can handle it now."`,
      },
      highlightField: 'a',
    },
    {
      text: {
        zh: `${narrator}：验算——还原回去\n$${a} \\times 10^{${n}} = ${a} \\times ${Math.pow(10, n).toLocaleString('en-US')} = ${numberStr}$ ✓\n\n和原来的数一模一样！标准式掌握了，做得漂亮！`,
        en: `${narrator}: "Verify — convert back\n$${a} \\times 10^{${n}} = ${a} \\times ${Math.pow(10, n).toLocaleString('en-US')} = ${numberStr}$ ✓\n\nExactly the same as the original! Standard form mastered — brilliantly done!"`,
      },
      highlightField: 'a',
    },
  ];

  return {
    ...template,
    description,
    data: { number, a, n, generatorType: 'STD_FORM_RANDOM' },
    tutorialSteps,
  };
}

export function generateSpeedMission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['诸葛亮', '赵云', '曹操'];
  const narrator = pickRandom(narrators);

  const modes = ['speed', 'distance', 'time'] as const;
  const mode = pickRandom([...modes]);

  const speedPools: Record<number, number[]> = { 1: [5, 10, 20], 2: [8, 12, 15, 25], 3: [6, 14, 18, 22, 35] };
  const timePools: Record<number, number[]> = { 1: [2, 3, 4], 2: [3, 4, 5, 6], 3: [3, 5, 7, 8] };

  const speed = pickRandom(speedPools[tier]);
  const time = pickRandom(timePools[tier]);
  const distance = speed * time;

  let answer: number;
  let descZh: string;
  let descEn: string;

  if (mode === 'speed') {
    answer = speed;
    descZh = `行军 $${distance}$ 里用了 $${time}$ 小时，速度是多少？`;
    descEn = `Marched $${distance}$ li in $${time}$ hours. What is the speed?`;
  } else if (mode === 'distance') {
    answer = distance;
    descZh = `以 $${speed}$ 里/时的速度行军 $${time}$ 小时，走了多远？`;
    descEn = `Marching at $${speed}$ li/hr for $${time}$ hours. How far?`;
  } else {
    answer = time;
    descZh = `$${distance}$ 里路程，速度 $${speed}$ 里/时，需要多久？`;
    descEn = `$${distance}$ li distance at $${speed}$ li/hr. How long?`;
  }

  const description = { zh: descZh, en: descEn };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要学速度公式？\n打仗最怕什么？迟到！如果不会算速度，部队就不知道几时出发才能准时到达。\n\n现实中也一样——坐火车、跑步、开车，都在和速度、距离、时间打交道。\n学会了这三个量的关系，你就能规划任何行程！`,
        en: `${narrator}: "Why learn the speed formula?\nWhat's the worst thing in war? Being late! Without knowing speed, the army can't figure out when to march to arrive on time.\n\nSame in real life — trains, running, driving — all about speed, distance, and time.\nLearn how these three relate, and you can plan any journey!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：速度、距离、时间——三角公式\n记住一个公式就够了：\n$$\\text{距离} = \\text{速度} \\times \\text{时间}$$\n\n知道任意两个，就能算第三个：\n• 速度 $= \\frac{\\text{距离}}{\\text{时间}}$\n• 时间 $= \\frac{\\text{距离}}{\\text{速度}}$\n\n就像一个三角形：遮住哪个，剩下两个告诉你答案！`,
        en: `${narrator}: "Speed, distance, time — the triangle formula\nJust remember one equation:\n$$\\text{Distance} = \\text{Speed} \\times \\text{Time}$$\n\nKnow any two, find the third:\n• Speed $= \\frac{\\text{Distance}}{\\text{Time}}$\n• Time $= \\frac{\\text{Distance}}{\\text{Speed}}$\n\nLike a triangle — cover one, and the other two give you the answer!"`,
      },
      highlightField: 'x',
    },
    {
      text: mode === 'speed' ? {
        zh: `${narrator}：题目问速度——找出已知量\n已知：距离 = $${distance}$ 里，时间 = $${time}$ 小时\n求：速度 = ？\n\n速度就是"每小时走了多远"——把总路程平均分给每个小时。\n所以用**除法**：距离 ÷ 时间。`,
        en: `${narrator}: "The question asks for speed — find the knowns\nKnown: distance = $${distance}$ li, time = $${time}$ hrs\nFind: speed = ?\n\nSpeed is 'how far per hour' — share the total distance equally across each hour.\nSo we use **division**: distance ÷ time."`,
      } : mode === 'distance' ? {
        zh: `${narrator}：题目问距离——找出已知量\n已知：速度 = $${speed}$ 里/时，时间 = $${time}$ 小时\n求：距离 = ？\n\n每小时走 $${speed}$ 里，走了 $${time}$ 个小时——总共走了多远？\n用**乘法**：速度 × 时间。`,
        en: `${narrator}: "The question asks for distance — find the knowns\nKnown: speed = $${speed}$ li/hr, time = $${time}$ hrs\nFind: distance = ?\n\n$${speed}$ li every hour, for $${time}$ hours — how far in total?\nUse **multiplication**: speed × time."`,
      } : {
        zh: `${narrator}：题目问时间——找出已知量\n已知：距离 = $${distance}$ 里，速度 = $${speed}$ 里/时\n求：时间 = ？\n\n总共要走 $${distance}$ 里，每小时能走 $${speed}$ 里——要走几个小时？\n用**除法**：距离 ÷ 速度。`,
        en: `${narrator}: "The question asks for time — find the knowns\nKnown: distance = $${distance}$ li, speed = $${speed}$ li/hr\nFind: time = ?\n\n$${distance}$ li to travel, going $${speed}$ li each hour — how many hours?\nUse **division**: distance ÷ speed."`,
      },
      highlightField: 'x',
    },
    {
      text: mode === 'speed' ? {
        zh: `${narrator}：代入计算\n速度 $= \\frac{\\text{距离}}{\\text{时间}} = \\frac{${distance}}{${time}} = ${speed}$ 里/时\n\n意思是这支部队每小时行军 $${speed}$ 里——${speed >= 20 ? '这可是急行军的速度！' : '稳步前进！'}`,
        en: `${narrator}: "Substitute and calculate\nSpeed $= \\frac{\\text{Distance}}{\\text{Time}} = \\frac{${distance}}{${time}} = ${speed}$ li/hr\n\nThat means the army marches $${speed}$ li every hour — ${speed >= 20 ? 'that\'s a rapid march!' : 'steady advance!'}"`,
      } : mode === 'distance' ? {
        zh: `${narrator}：代入计算\n距离 $= \\text{速度} \\times \\text{时间} = ${speed} \\times ${time} = ${distance}$ 里\n\n${time} 个小时后，部队已经走了 $${distance}$ 里！${distance >= 100 ? '好远！' : '路程不算远。'}`,
        en: `${narrator}: "Substitute and calculate\nDistance $= \\text{Speed} \\times \\text{Time} = ${speed} \\times ${time} = ${distance}$ li\n\nAfter ${time} hours, the army has covered $${distance}$ li! ${distance >= 100 ? 'Quite far!' : 'Not too far.'}"`,
      } : {
        zh: `${narrator}：代入计算\n时间 $= \\frac{\\text{距离}}{\\text{速度}} = \\frac{${distance}}{${speed}} = ${time}$ 小时\n\n需要 $${time}$ 小时才能到达！${time >= 6 ? '行军辛苦，要做好准备。' : '很快就能到！'}`,
        en: `${narrator}: "Substitute and calculate\nTime $= \\frac{\\text{Distance}}{\\text{Speed}} = \\frac{${distance}}{${speed}} = ${time}$ hours\n\nIt takes $${time}$ hours to arrive! ${time >= 6 ? 'A long march — better prepare well.' : 'You\'ll be there in no time!'}"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：答案\n${mode === 'speed' ? `速度 = $${answer}$ 里/时` : mode === 'distance' ? `距离 = $${answer}$ 里` : `时间 = $${answer}$ 小时`}\n\n行军计划有了数据支撑，出发吧！`,
        en: `${narrator}: "Answer\n${mode === 'speed' ? `Speed = $${answer}$ li/hr` : mode === 'distance' ? `Distance = $${answer}$ li` : `Time = $${answer}$ hours`}\n\nThe march plan has data backing — let's move out!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：验算——三个量互相验证\n速度 $\\times$ 时间 $=$ 距离？\n$${speed} \\times ${time} = ${distance}$ ✓\n\n三个量完美吻合！行军计划万无一失，做得漂亮！`,
        en: `${narrator}: "Verify — cross-check all three\nSpeed $\\times$ Time $=$ Distance?\n$${speed} \\times ${time} = ${distance}$ ✓\n\nAll three match perfectly! March plan confirmed — brilliantly done!"`,
      },
      highlightField: 'x',
    },
  ];

  return {
    ...template,
    description,
    data: { speed, distance, time, mode, answer, x: answer, generatorType: 'SPEED_RANDOM' },
    tutorialSteps,
  };
}

export function generateCircleY8Mission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['鲁肃', '曹操', '刘备'];
  const narrator = pickRandom(narrators);

  const rPools: Record<number, number[]> = { 1: [3, 5, 7], 2: [4, 6, 8, 10], 3: [5, 9, 12, 14] };
  const r = pickRandom(rPools[tier]);
  const pi = 3.14;
  const modes = ['circumference', 'area'] as const;
  const mode = pickRandom([...modes]);

  const circumference = parseFloat((2 * pi * r).toFixed(2));
  const area = parseFloat((pi * r * r).toFixed(2));

  let answer: number;
  let descZh: string;
  let descEn: string;

  if (mode === 'circumference') {
    answer = circumference;
    descZh = `半径 $${r}$ 的圆营地周长是多少？($\\pi = ${pi}$)`;
    descEn = `A circular camp with radius $${r}$. Find the circumference. ($\\pi = ${pi}$)`;
  } else {
    answer = area;
    descZh = `半径 $${r}$ 的圆营地面积是多少？($\\pi = ${pi}$)`;
    descEn = `A circular camp with radius $${r}$. Find the area. ($\\pi = ${pi}$)`;
  }

  const tutorialSteps = mode === 'circumference' ? [
    {
      text: {
        zh: `${narrator}：为什么要算周长？\n想象你要在圆形营地周围建一圈篱笆——需要多长的木材？\n这就是周长的用处！走一圈的距离就是周长。\n\n有个神奇的事：不管圆多大多小，周长除以直径永远约等于 $3.14$。\n这个神奇的比值就叫 $\\pi$（读"派"）——古人花了上千年才精确计算出来！`,
        en: `${narrator}: "Why calculate circumference?\nImagine building a fence around a circular camp — how much wood do you need?\nThat's what circumference is for! The distance around is the circumference.\n\nHere's something magical: no matter how big or small the circle, circumference ÷ diameter always ≈ $3.14$.\nThis magical ratio is called $\\pi$ ('pi') — it took ancient scholars thousands of years to calculate precisely!"`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：周长公式\n$C = 2 \\times \\pi \\times r$\n\n$r = ${r}$ 是半径（从圆心到边的距离），$\\pi \\approx ${pi}$。\n$2r$ 就是直径——想象穿过圆心的一条直线。\n所以也可以写成 $C = \\pi \\times d$（直径乘以 $\\pi$）。\n\n两种写法，一个意思——选你觉得方便的！`,
        en: `${narrator}: "Circumference formula\n$C = 2 \\times \\pi \\times r$\n\n$r = ${r}$ is the radius (centre to edge), $\\pi \\approx ${pi}$.\n$2r$ is the diameter — imagine a line straight through the centre.\nSo you can also write $C = \\pi \\times d$ (diameter times $\\pi$).\n\nTwo versions, same thing — pick whichever feels easier!"`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：第一步——算直径\n$2 \\times r = 2 \\times ${r} = ${2 * r}$\n\n直径就是两个半径拼起来——从这边到那边穿过圆心的长度。`,
        en: `${narrator}: "Step 1 — calculate the diameter\n$2 \\times r = 2 \\times ${r} = ${2 * r}$\n\nDiameter is two radii joined end to end — the full width through the centre."`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：第二步——直径乘以 $\\pi$\n$C = ${2 * r} \\times ${pi} = ${circumference}$\n\n直径知道了，乘以 $\\pi$ 就能"绕一圈"了！`,
        en: `${narrator}: "Step 2 — diameter times $\\pi$\n$C = ${2 * r} \\times ${pi} = ${circumference}$\n\nOnce you know the diameter, multiply by $\\pi$ to 'go all the way around'!"`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：答案\n周长 $C = ${circumference}$\n\n围这个营地一圈需要 $${circumference}$ 长的绳子！篱笆材料备好了！`,
        en: `${narrator}: "Answer\nCircumference $C = ${circumference}$\n\nYou need $${circumference}$ units of rope to go around the camp! Fence materials ready!"`,
      },
      highlightField: 'c',
    },
    {
      text: {
        zh: `${narrator}：验算——换个方法再算一遍\n用 $\\pi \\approx 3$ 快速估算：$3 \\times ${2 * r} = ${3 * 2 * r}$\n实际 $${circumference}$ 比 $${3 * 2 * r}$ 稍大（因为 $\\pi = ${pi} > 3$），合理 ✓\n\n绳子量准了！营地可以动工了，做得好！`,
        en: `${narrator}: "Verify — calculate a different way\nQuick estimate with $\\pi \\approx 3$: $3 \\times ${2 * r} = ${3 * 2 * r}$\nActual $${circumference}$ is slightly more than $${3 * 2 * r}$ (since $\\pi = ${pi} > 3$), makes sense ✓\n\nRope measured correctly! Construction can begin — well done!"`,
      },
      highlightField: 'c',
    },
  ] : [
    {
      text: {
        zh: `${narrator}：为什么要算圆的面积？\n营地是圆形的——你需要知道里面有多大空间，才能决定搭多少个帐篷！\n面积就是圆**里面**占了多大地方。\n\n长方形面积 = 长 × 宽，但圆没有"长"和"宽"。\n别担心，圆的公式其实也只要两步！`,
        en: `${narrator}: "Why calculate a circle's area?\nThe camp is circular — you need to know how much space is inside to decide how many tents fit!\nArea is how much ground the circle COVERS.\n\nRectangle area = length × width, but a circle has no straight sides.\nDon't worry — the circle formula only takes two steps!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：圆面积公式\n$$A = \\pi \\times r^2$$\n\n$r = ${r}$（半径），$r^2$ 就是 $r \\times r$（半径乘以自己）。\n再乘以 $\\pi \\approx ${pi}$。\n\n为什么是 $r^2$？因为面积是二维的——长度×长度=面积，所以半径要"自己乘自己"！`,
        en: `${narrator}: "Circle area formula\n$$A = \\pi \\times r^2$$\n\n$r = ${r}$ (radius), $r^2$ means $r \\times r$ (radius times itself).\nThen multiply by $\\pi \\approx ${pi}$.\n\nWhy $r^2$? Because area is 2D — length × length = area, so the radius 'multiplies itself'!"`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：第一步——算 $r^2$\n$r^2 = ${r} \\times ${r} = ${r * r}$\n\n半径乘以自己——就这么简单！你已经完成一半了。`,
        en: `${narrator}: "Step 1 — calculate $r^2$\n$r^2 = ${r} \\times ${r} = ${r * r}$\n\nRadius times itself — that simple! You're already halfway there."`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：第二步——乘以 $\\pi$\n$A = ${pi} \\times ${r * r} = ${area}$\n\n$\\pi$ 就像一个"圆形调整系数"——它把正方形面积（$r^2$）变成圆形面积。`,
        en: `${narrator}: "Step 2 — multiply by $\\pi$\n$A = ${pi} \\times ${r * r} = ${area}$\n\n$\\pi$ is like a 'circle adjustment factor' — it converts the square area ($r^2$) into circular area."`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：答案\n面积 $A = ${area}$\n\n这块圆形营地有 $${area}$ 平方单位的空间！帐篷可以安排了。`,
        en: `${narrator}: "Answer\nArea $A = ${area}$\n\nThis circular camp has $${area}$ square units of space! Time to set up tents."`,
      },
      highlightField: 'area',
    },
    {
      text: {
        zh: `${narrator}：验算\n用 $\\pi \\approx 3$ 快速估算：$3 \\times ${r * r} = ${3 * r * r}$\n实际 $${area}$ 比 $${3 * r * r}$ 稍大（因为 $\\pi = ${pi} > 3$），合理 ✓\n\n营地面积确认！做得好！`,
        en: `${narrator}: "Verify\nQuick estimate with $\\pi \\approx 3$: $3 \\times ${r * r} = ${3 * r * r}$\nActual $${area}$ is slightly more than $${3 * r * r}$ (since $\\pi = ${pi} > 3$), makes sense ✓\n\nCamp area confirmed! Well done!"`,
      },
      highlightField: 'area',
    },
  ];

  return {
    ...template,
    description: { zh: descZh, en: descEn },
    data: mode === 'circumference'
      ? { r, pi, mode: 'circumference', answer, generatorType: 'CIRCLE_Y8_RANDOM' }
      : { r, pi, mode: 'area', answer, generatorType: 'CIRCLE_Y8_RANDOM' },
    tutorialSteps,
  };
}

export function generateVolumeY8Mission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['曹操', '荀彧', '袁绍'];
  const narrator = pickRandom(narrators);

  const rPools: Record<number, number[]> = { 1: [3, 5], 2: [4, 5, 6], 3: [5, 7, 8] };
  const hPools: Record<number, number[]> = { 1: [5, 10], 2: [6, 8, 10, 12], 3: [8, 10, 12, 15] };

  const radius = pickRandom(rPools[tier]);
  const height = pickRandom(hPools[tier]);
  const pi = 3.14;
  const baseArea = parseFloat((pi * radius * radius).toFixed(2));
  const volume = parseFloat((pi * radius * radius * height).toFixed(2));
  const answer = volume;

  const description = {
    zh: `圆柱形粮仓：半径 $${radius}$，高 $${height}$，体积 = ? ($\\pi = ${pi}$)`,
    en: `Cylindrical granary: radius $${radius}$, height $${height}$, volume = ? ($\\pi = ${pi}$)`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么要算粮仓的体积？\n行军打仗最重要的是什么？粮草！粮仓建多大，就决定能存多少粮食。\n\n粮仓长什么样？上下两个圆，中间直直的——这就是圆柱体。\n体积就是这个圆筒**能装多少粮食**。跟长方体思路一样：底面积 × 高！`,
        en: `${narrator}: "Why calculate the granary's volume?\nWhat's the most important thing in war? Food supplies! The granary's size determines how much grain it stores.\n\nWhat shape is a granary? Two circles top and bottom, straight in the middle — that's a cylinder.\nVolume is how much grain this tube can HOLD. Same as a box: base area × height!"`,
      },
      highlightField: 'v',
    },
    {
      text: {
        zh: `${narrator}：圆柱体积公式\n$$V = \\pi r^2 \\times h$$\n\n翻译成白话：先算圆底面积（$\\pi r^2$），再乘以高（$h$）。\n$r = ${radius}$（半径），$h = ${height}$（高），$\\pi \\approx ${pi}$\n\n跟圆面积公式很像对不对？只是多乘了一个高——从平面"长高"变立体了！`,
        en: `${narrator}: "Cylinder volume formula\n$$V = \\pi r^2 \\times h$$\n\nIn plain words: first calculate the circular base ($\\pi r^2$), then multiply by height ($h$).\n$r = ${radius}$ (radius), $h = ${height}$ (height), $\\pi \\approx ${pi}$\n\nLooks like the circle area formula, right? Just multiply by height — the flat circle 'grows tall' into 3D!"`,
      },
      highlightField: 'v',
    },
    {
      text: {
        zh: `${narrator}：第一步——算底面积\n$r^2 = ${radius} \\times ${radius} = ${radius * radius}$\n$\\pi r^2 = ${pi} \\times ${radius * radius} = ${baseArea}$\n\n这就是仓底一层能铺多少粮食——圆形那层地板的面积。`,
        en: `${narrator}: "Step 1 — calculate the base area\n$r^2 = ${radius} \\times ${radius} = ${radius * radius}$\n$\\pi r^2 = ${pi} \\times ${radius * radius} = ${baseArea}$\n\nThat's how much grain fits in one layer — the area of the circular floor."`,
      },
      highlightField: 'v',
    },
    {
      text: {
        zh: `${narrator}：第二步——底面积乘以高\n$V = ${baseArea} \\times ${height} = ${volume}$\n\n想象一层一层往上叠：底面 $${baseArea}$，叠了 $${height}$ 层，总共 $${volume}$！`,
        en: `${narrator}: "Step 2 — base area times height\n$V = ${baseArea} \\times ${height} = ${volume}$\n\nImagine stacking layers: each layer is $${baseArea}$, stacked $${height}$ high, total $${volume}$!"`,
      },
      highlightField: 'v',
    },
    {
      text: {
        zh: `${narrator}：答案\n体积 $V = ${volume}$\n\n这座粮仓能存 $${volume}$ 立方单位的粮食！够大军吃好一阵子了。`,
        en: `${narrator}: "Answer\nVolume $V = ${volume}$\n\nThis granary stores $${volume}$ cubic units of grain! Enough to feed the army for quite a while."`,
      },
      highlightField: 'v',
    },
    {
      text: {
        zh: `${narrator}：验算\n用 $\\pi \\approx 3$ 快速估算：$3 \\times ${radius * radius} \\times ${height} = ${3 * radius * radius * height}$\n实际 $${volume}$ 比估算 $${3 * radius * radius * height}$ 稍大（因为 $\\pi = ${pi} > 3$），合理 ✓\n\n粮草清点完毕！三军将士有饭吃了，做得漂亮！`,
        en: `${narrator}: "Verify\nQuick estimate with $\\pi \\approx 3$: $3 \\times ${radius * radius} \\times ${height} = ${3 * radius * radius * height}$\nActual $${volume}$ is slightly more than $${3 * radius * radius * height}$ (since $\\pi = ${pi} > 3$), makes sense ✓\n\nGrain count complete! The army is well-fed — brilliantly done!"`,
      },
      highlightField: 'v',
    },
  ];

  return {
    ...template,
    description,
    data: { radius, height, pi, answer, generatorType: 'VOLUME_Y8_RANDOM' },
    tutorialSteps,
  };
}

export function generatePercentageInterestMission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['曹操', '荀彧', '诸葛亮'];
  const narrator = pickRandom(narrators);

  const modes = ['simple', 'compound'] as const;
  const mode = pickRandom([...modes]);

  const principalPools: Record<number, number[]> = { 1: [100, 200, 500], 2: [200, 500, 800, 1000], 3: [500, 1000, 2000, 5000] };
  const ratePools: Record<number, number[]> = { 1: [5, 10], 2: [5, 8, 10], 3: [3, 5, 8, 10, 12] };
  const yearPools: Record<number, number[]> = { 1: [2], 2: [2, 3], 3: [2, 3, 4] };

  const principal = pickRandom(principalPools[tier]);
  const rate = pickRandom(ratePools[tier]);
  const years = pickRandom(yearPools[tier]);
  const rateDecimal = rate / 100;

  const interest = principal * rateDecimal;
  const totalSimple = principal + interest * years;
  let answer: number;
  if (mode === 'simple') {
    answer = totalSimple;
  } else {
    answer = parseFloat((principal * Math.pow(1 + rateDecimal, years)).toFixed(2));
  }

  const description = {
    zh: mode === 'simple'
      ? `本金 $${principal}$ 两，年利率 $${rate}\\%$，${years} 年单利，最终金额？`
      : `本金 $${principal}$ 两，年利率 $${rate}\\%$，${years} 年复利，最终金额？`,
    en: mode === 'simple'
      ? `Principal $${principal}$ liang, rate $${rate}\\%$, ${years} years simple interest. Final amount?`
      : `Principal $${principal}$ liang, rate $${rate}\\%$, ${years} years compound interest. Final amount?`,
  };

  const tutorialSteps = mode === 'simple' ? [
    {
      text: {
        zh: `${narrator}：为什么要学利息？\n你把 $${principal}$ 两银子存进国库，过了 $${years}$ 年去取——结果多了一些钱！\n多出来的就是"利息"，是国库为了感谢你存钱而给你的奖励。\n\n单利是最简单的一种：每年的利息都按**最初的本金**来算，固定不变。`,
        en: `${narrator}: "Why learn about interest?\nYou deposit $${principal}$ liang into the treasury. After $${years}$ years, you withdraw — and there's MORE money!\nThe extra is 'interest' — the treasury's reward for letting them use your money.\n\nSimple interest is the easiest type: each year's interest is based on the ORIGINAL amount, never changing."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：单利公式长什么样？\n$$\\text{总额} = P + P \\times r \\times t = P(1 + r \\times t)$$\n\n$P$ = 本金 = $${principal}$（你最初存了多少）\n$r$ = 年利率 = $${rateDecimal}$（就是 $${rate}\\%$ 变成小数）\n$t$ = 年数 = $${years}$（存了几年）\n\n三个数一乘一加，搞定！`,
        en: `${narrator}: "What does the simple interest formula look like?\n$$\\text{Total} = P + P \\times r \\times t = P(1 + r \\times t)$$\n\n$P$ = principal = $${principal}$ (how much you deposited)\n$r$ = annual rate = $${rateDecimal}$ (that's $${rate}\\%$ as a decimal)\n$t$ = years = $${years}$ (how long it's deposited)\n\nMultiply three numbers, add once — done!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——算每年的利息\n每年利息 $= P \\times r = ${principal} \\times ${rateDecimal} = ${interest}$\n\n意思是每年国库给你 $${interest}$ 两银子作为利息。\n$${years}$ 年总共给你多少？$${interest} \\times ${years} = ${interest * years}$ 两！`,
        en: `${narrator}: "Step 1 — calculate yearly interest\nYearly interest $= P \\times r = ${principal} \\times ${rateDecimal} = ${interest}$\n\nThat means the treasury pays you $${interest}$ liang each year.\nOver $${years}$ years? $${interest} \\times ${years} = ${interest * years}$ liang total!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第二步——本金加利息\n你最初存了 $${principal}$ 两，利息一共 $${interest * years}$ 两。\n\n总额 $= ${principal} + ${interest * years} = ${totalSimple}$\n\n就像打仗后清点：原来的兵 + 新招的兵 = 总兵力！`,
        en: `${narrator}: "Step 2 — principal plus interest\nYou originally deposited $${principal}$ liang, total interest is $${interest * years}$ liang.\n\nTotal $= ${principal} + ${interest * years} = ${totalSimple}$\n\nLike counting troops after battle: original soldiers + new recruits = total force!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${years}$ 年后总额 = $${totalSimple}$ 两\n\n从 $${principal}$ 变成 $${totalSimple}$，多赚了 $${interest * years}$ 两！做得好！`,
        en: `${narrator}: "Answer\nAfter $${years}$ years, total = $${totalSimple}$ liang\n\nFrom $${principal}$ to $${totalSimple}$ — earned $${interest * years}$ liang extra! Well done!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算——逐年对账\n每年利息固定 $${interest}$ 两，$${years}$ 年就是 $${interest} \\times ${years} = ${interest * years}$ 两。\n本金 + 利息 $= ${principal} + ${interest * years} = ${totalSimple}$ ✓\n\n账目清晰，万无一失！国库账房先生都佩服你！`,
        en: `${narrator}: "Verify — check the books year by year\nFixed yearly interest $${interest}$ liang, for $${years}$ years: $${interest} \\times ${years} = ${interest * years}$ liang.\nPrincipal + interest $= ${principal} + ${interest * years} = ${totalSimple}$ ✓\n\nBooks balanced perfectly! Even the treasury accountant is impressed!"`,
      },
      highlightField: 'ans',
    },
  ] : [
    {
      text: {
        zh: `${narrator}：为什么要学复利？\n你知道"滚雪球"吗？雪球越大，每滚一圈粘的雪就越多，越滚越大越快！\n复利就是钱的"滚雪球"——利息也会产生利息！\n\n跟单利不同：单利每年只按本金算利息，复利每年按"本金+已有利息"算。`,
        en: `${narrator}: "Why learn compound interest?\nKnow what a snowball does? The bigger it gets, the more snow it picks up each roll — growing faster and faster!\nCompound interest is money's 'snowball' — interest earns interest too!\n\nUnlike simple interest (calculated on the original only), compound interest uses 'principal + accumulated interest' each year."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：复利公式\n$$A = P \\times (1 + r)^t$$\n\n$P = ${principal}$（本金），$r = ${rateDecimal}$（利率），$t = ${years}$（年数）\n\n$(1 + r) = ${1 + rateDecimal}$ 就是"每过一年，钱变成原来的 $${1 + rateDecimal}$ 倍"。\n指数 $t$ 的意思是连续乘 $${years}$ 次——雪球滚了 $${years}$ 圈！`,
        en: `${narrator}: "Compound interest formula\n$$A = P \\times (1 + r)^t$$\n\n$P = ${principal}$ (principal), $r = ${rateDecimal}$ (rate), $t = ${years}$ (years)\n\n$(1 + r) = ${1 + rateDecimal}$ means 'each year, money becomes $${1 + rateDecimal}$ times what it was'.\nThe exponent $t$ means multiply $${years}$ times — the snowball rolls $${years}$ times!"`,
      },
      highlightField: 'ans',
    },
    {
      text: (() => {
        let zh = `${narrator}：逐年看看雪球怎么滚的\n`, en = `${narrator}: "Watch the snowball grow year by year\n`;
        let amt = principal;
        for (let y = 1; y <= years; y++) {
          const prev = amt;
          amt = parseFloat((amt * (1 + rateDecimal)).toFixed(2));
          const yearInterest = parseFloat((prev * rateDecimal).toFixed(2));
          zh += `第 ${y} 年：$${prev} \\times ${1 + rateDecimal} = ${amt}$（利息 $${yearInterest}$）\n`;
          en += `Year ${y}: $${prev} \\times ${1 + rateDecimal} = ${amt}$ (interest $${yearInterest}$)\n`;
        }
        zh += `\n看到了吗？每年的利息在变大——因为本金在变大！这就是复利的威力。`;
        en += `\nSee? Each year's interest grows — because the base amount grows! That's the power of compounding."`;
        return { zh, en };
      })(),
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：用公式一步搞定\n$A = ${principal} \\times (${1 + rateDecimal})^{${years}} = ${answer}$\n\n逐年算和公式算，结果一模一样！\n公式更快，逐年算更直观——两种方法你都会了！`,
        en: `${narrator}: "Or use the formula in one shot\n$A = ${principal} \\times (${1 + rateDecimal})^{${years}} = ${answer}$\n\nYear-by-year and formula give the exact same result!\nFormula is faster, year-by-year is more intuitive — now you know both!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$${years}$ 年复利后总额 = $${answer}$ 两\n\n比单利 $${totalSimple}$ 多了 $${parseFloat((answer - totalSimple).toFixed(2))}$ 两！\n时间越长，复利的雪球效应越明显。做得漂亮！`,
        en: `${narrator}: "Answer\nAfter $${years}$ years of compound interest, total = $${answer}$ liang\n\nThat's $${parseFloat((answer - totalSimple).toFixed(2))}$ more than simple interest ($${totalSimple}$)!\nThe longer the time, the stronger the snowball effect. Brilliant work!"`,
      },
      highlightField: 'ans',
    },
    {
      text: (() => {
        let zh = `${narrator}：验算——再走一遍雪球路线\n从 $${principal}$ 开始：\n`, en = `${narrator}: "Verify — trace the snowball path again\nStarting from $${principal}$:\n`;
        let amt = principal;
        for (let y = 1; y <= years; y++) {
          amt = parseFloat((amt * (1 + rateDecimal)).toFixed(2));
          zh += `第 ${y} 年末：$${amt}$\n`;
          en += `End of year ${y}: $${amt}$\n`;
        }
        zh += `最终 $${amt}$ ✓ 和公式算出来的一模一样！\n\n国库大账查清了，你是最棒的账房先生！`;
        en += `Final $${amt}$ ✓ Matches the formula exactly!\n\nTreasury audit complete — you're the best accountant in the kingdom!"`;
        return { zh, en };
      })(),
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { principal, initial: principal, rate: rateDecimal, rateDecimal, years, mode, answer, generatorType: 'PERCENTAGE_INTEREST_RANDOM' },
    tutorialSteps,
  };
}

export function generateParallelAnglesMission(template: Mission): Mission {
  const tier = getTier();
  const narrators = ['关羽', '张飞', '赵云'];
  const narrator = pickRandom(narrators);

  const anglePools: Record<number, number[]> = { 1: [40, 50, 60, 70], 2: [35, 45, 55, 65, 75], 3: [32, 48, 53, 67, 78, 83] };
  const givenAngle = pickRandom(anglePools[tier]);

  const types = ['alternate', 'corresponding', 'co-interior'] as const;
  const angleType = pickRandom([...types]);

  let answer: number;
  let typeZh: string;
  let typeEn: string;
  let reasonZh: string;
  let reasonEn: string;

  if (angleType === 'alternate') {
    answer = givenAngle;
    typeZh = '内错角';
    typeEn = 'alternate angles';
    reasonZh = '内错角相等（Z字形）';
    reasonEn = 'Alternate angles are equal (Z-shape)';
  } else if (angleType === 'corresponding') {
    answer = givenAngle;
    typeZh = '同位角';
    typeEn = 'corresponding angles';
    reasonZh = '同位角相等（F字形）';
    reasonEn = 'Corresponding angles are equal (F-shape)';
  } else {
    answer = 180 - givenAngle;
    typeZh = '同旁内角';
    typeEn = 'co-interior angles';
    reasonZh = '同旁内角互补（C字形/U字形）';
    reasonEn = 'Co-interior angles are supplementary (C-shape/U-shape)';
  }

  const description = {
    zh: `两平行线被一条直线截断。已知角 $= ${givenAngle}°$，求${typeZh} $x$。`,
    en: `Two parallel lines cut by a transversal. Given angle $= ${givenAngle}°$. Find the ${typeEn} $x$.`,
  };

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：平行线和角度有什么关系？\n你看城墙——上下两道城墙是平行的，攻城梯斜斜地搭在上面。\n梯子和城墙形成了好多角度，而且这些角度之间有神奇的规律！\n\n只要城墙是平行的，这些规律**永远成立**。学会了就能快速算出未知角度！`,
        en: `${narrator}: "What do parallel lines have to do with angles?\nLook at the city walls — the top and bottom walls are parallel, and the siege ladder leans across them.\nThe ladder creates many angles with the walls, and these angles follow magical rules!\n\nAs long as the walls are parallel, these rules ALWAYS hold. Learn them and you can find any unknown angle instantly!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：三种角度规律——记住字母形状就行！\n1. **同位角**（F 字形）：位置相同 → 角度相等\n2. **内错角**（Z 字形）：交叉对望 → 角度相等\n3. **同旁内角**（C 字形）：同侧挤着 → 加起来 = $180°$\n\n画一条横线穿过两条平行线，转动手中的纸，你就能看到 F、Z、C 的形状！`,
        en: `${narrator}: "Three angle rules — just remember the letter shapes!\n1. **Corresponding** (F-shape): same position → equal\n2. **Alternate** (Z-shape): cross-looking → equal\n3. **Co-interior** (C/U-shape): same side → add to $180°$\n\nDraw a line through two parallel lines, rotate the paper, and you'll see F, Z, C shapes!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：看看这道题是哪种？\n已知角 $= ${givenAngle}°$，要求的 $x$ 和它是什么关系？\n\n这一对是**${typeZh}**！\n${reasonZh}。\n\n${angleType === 'co-interior' ? '它们在截线的同一侧——想象两个人背靠背挤在一起，加起来撑满 $180°$。' : angleType === 'alternate' ? '它们在截线的两侧——像 Z 字形的两个拐角，虽然位置不同但角度一样！' : '它们在截线的同一侧、同一个位置——像 F 字形的两个横杠处，角度完全一样！'}`,
        en: `${narrator}: "Which type is this problem?\nGiven angle $= ${givenAngle}°$, what's the relationship with $x$?\n\nThis pair is **${typeEn}**!\n${reasonEn}.\n\n${angleType === 'co-interior' ? 'They\'re on the same side of the transversal — imagine two people back-to-back, together filling exactly $180°$.' : angleType === 'alternate' ? 'They\'re on opposite sides — like the two turns in a Z, different positions but same angle!' : 'They\'re in matching positions — like the two bars of an F, exactly the same angle!'}"`,
      },
      highlightField: 'x',
    },
    {
      text: angleType === 'co-interior' ? {
        zh: `${narrator}：代入计算\n同旁内角加起来 $= 180°$，所以：\n$x + ${givenAngle}° = 180°$\n$x = 180° - ${givenAngle}° = ${answer}°$\n\n就像拼图——两块拼在一起刚好是一条直线（$180°$），知道一块就能算另一块！`,
        en: `${narrator}: "Plug in and calculate\nCo-interior angles add to $180°$, so:\n$x + ${givenAngle}° = 180°$\n$x = 180° - ${givenAngle}° = ${answer}°$\n\nLike a puzzle — two pieces together make a straight line ($180°$). Know one piece, find the other!"`,
      } : {
        zh: `${narrator}：代入计算\n${typeZh}相等，所以直接：\n$x = ${givenAngle}°$\n\n就这么简单！${angleType === 'alternate' ? 'Z 字形两端的角一模一样。' : 'F 字形两横的角一模一样。'}`,
        en: `${narrator}: "Plug in and calculate\n${typeEn} are equal, so simply:\n$x = ${givenAngle}°$\n\nThat simple! ${angleType === 'alternate' ? 'Both ends of the Z are identical.' : 'Both bars of the F are identical.'}"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：答案\n$x = ${answer}°$\n\n${angleType === 'co-interior' ? `两个角：$${givenAngle}°$ 和 $${answer}°$，加起来刚好 $180°$！` : `两个角都是 $${answer}°$，完全相等！`}\n攻城角度计算完毕，可以架梯了！`,
        en: `${narrator}: "Answer\n$x = ${answer}°$\n\n${angleType === 'co-interior' ? `The two angles: $${givenAngle}°$ and $${answer}°$, adding to exactly $180°$!` : `Both angles are $${answer}°$ — perfectly equal!`}\nSiege angle calculated — time to raise the ladder!"`,
      },
      highlightField: 'x',
    },
    {
      text: angleType === 'co-interior' ? {
        zh: `${narrator}：验算\n同旁内角之和 $= ${givenAngle}° + ${answer}° = ${givenAngle + answer}°$\n$${givenAngle + answer}° = 180°$ ✓\n\n两块拼图完美合拢！角度万无一失！`,
        en: `${narrator}: "Verify\nCo-interior sum $= ${givenAngle}° + ${answer}° = ${givenAngle + answer}°$\n$${givenAngle + answer}° = 180°$ ✓\n\nPuzzle pieces fit perfectly! Angle confirmed!"`,
      } : {
        zh: `${narrator}：验算\n${typeZh}应该相等：\n已知角 $= ${givenAngle}°$，$x = ${answer}°$\n$${givenAngle}° = ${answer}°$ ✓\n\n左右对称，一模一样！攻城没问题！`,
        en: `${narrator}: "Verify\n${typeEn} should be equal:\nGiven angle $= ${givenAngle}°$, $x = ${answer}°$\n$${givenAngle}° = ${answer}°$ ✓\n\nSymmetrical match! Siege angle confirmed!"`,
      },
      highlightField: 'x',
    },
  ];

  return {
    ...template,
    description,
    data: { givenAngle, angleType, answer, parallel: true, highlight: angleType === 'co-interior' ? 'cointerior' : angleType, total: angleType === 'co-interior' ? 180 : undefined, angle: givenAngle, generatorType: 'PARALLEL_ANGLES_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SYMMETRY generator: reflection or 180° rotation
   Modes: 'reflect_x' (reflect over x-axis), 'reflect_y' (reflect over y-axis), 'rotate_180' (rotate 180° about origin)
   ══════════════════════════════════════════════════════════ */

export function generateSymmetryMission(template: Mission): Mission {
  const tier = getTier();
  const coordPools = { 1: [1, 2, 3, 4, 5], 2: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], 3: [-8, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8] };
  const px = pickRandom(coordPools[tier]);
  const py = pickRandom(coordPools[tier]);

  const modes = tier === 1 ? ['reflect_x', 'reflect_y'] : ['reflect_x', 'reflect_y', 'rotate_180'];
  const mode = pickRandom(modes);

  let ansX: number, ansY: number;
  let transformZh: string, transformEn: string;
  let ruleZh: string, ruleEn: string;
  let verifyZh: string, verifyEn: string;

  if (mode === 'reflect_x') {
    ansX = px; ansY = -py;
    transformZh = '关于 $x$ 轴的对称';
    transformEn = 'reflection in the $x$-axis';
    ruleZh = `$x$ 不变，$y$ 取反：$(x, y) \\to (x, -y)$`;
    ruleEn = `$x$ stays the same, $y$ changes sign: $(x, y) \\to (x, -y)$`;
    verifyZh = `原点 $(${px}, ${py})$ 和映像 $(${ansX}, ${ansY})$ 到 $x$ 轴距离相等？$|${py}| = |${ansY}|$ ✓`;
    verifyEn = `Original $(${px}, ${py})$ and image $(${ansX}, ${ansY})$ are equal distance from $x$-axis? $|${py}| = |${ansY}|$ ✓`;
  } else if (mode === 'reflect_y') {
    ansX = -px; ansY = py;
    transformZh = '关于 $y$ 轴的对称';
    transformEn = 'reflection in the $y$-axis';
    ruleZh = `$y$ 不变，$x$ 取反：$(x, y) \\to (-x, y)$`;
    ruleEn = `$y$ stays the same, $x$ changes sign: $(x, y) \\to (-x, y)$`;
    verifyZh = `原点 $(${px}, ${py})$ 和映像 $(${ansX}, ${ansY})$ 到 $y$ 轴距离相等？$|${px}| = |${ansX}|$ ✓`;
    verifyEn = `Original $(${px}, ${py})$ and image $(${ansX}, ${ansY})$ are equal distance from $y$-axis? $|${px}| = |${ansX}|$ ✓`;
  } else {
    ansX = -px; ansY = -py;
    transformZh = '绕原点旋转 $180°$';
    transformEn = 'rotation $180°$ about the origin';
    ruleZh = `$x$ 和 $y$ 都取反：$(x, y) \\to (-x, -y)$`;
    ruleEn = `Both $x$ and $y$ change sign: $(x, y) \\to (-x, -y)$`;
    verifyZh = `中点 $= (\\frac{${px}+(${ansX})}{2}, \\frac{${py}+(${ansY})}{2}) = (0, 0)$ = 旋转中心 ✓`;
    verifyEn = `Midpoint $= (\\frac{${px}+(${ansX})}{2}, \\frac{${py}+(${ansY})}{2}) = (0, 0)$ = centre of rotation ✓`;
  }

  const narrator = pickRandom(['诸葛亮', '周瑜']);
  const description: BilingualText = {
    zh: `点 $(${px}, ${py})$ 经过${transformZh}后的坐标`,
    en: `Find the image of $(${px}, ${py})$ after ${transformEn}`,
  };

  // Build intuitive explanation based on mode
  let intuitionZh: string, intuitionEn: string;
  let xExplainZh: string, xExplainEn: string;
  let yExplainZh: string, yExplainEn: string;
  if (mode === 'reflect_x') {
    intuitionZh = `想象 $x$ 轴是一面横放的镜子。\n你站在点 $(${px}, ${py})$ 上往镜子里看——镜子里的你，左右位置没变，但上下翻转了。`;
    intuitionEn = `Imagine the $x$-axis is a horizontal mirror.\nYou stand at $(${px}, ${py})$ and look in the mirror — your reflection keeps the same left-right position, but flips up-down.`;
    xExplainZh = `$x$ 坐标：镜子是横的，所以左右不变。\n$x' = ${px}$（和原来一样）`;
    xExplainEn = `$x$ coordinate: the mirror is horizontal, so left-right stays.\n$x' = ${px}$ (same as before)`;
    yExplainZh = `$y$ 坐标：上下翻转 = 正变负，负变正。\n$y$ 原来是 $${py}$，翻转后变成 $${ansY}$\n（"取反"就是加个负号，或者去掉负号）`;
    yExplainEn = `$y$ coordinate: up-down flips = positive becomes negative, negative becomes positive.\n$y$ was $${py}$, after flipping it becomes $${ansY}$\n("Change sign" means add a minus, or remove one)`;
  } else if (mode === 'reflect_y') {
    intuitionZh = `想象 $y$ 轴是一面竖放的镜子。\n你站在点 $(${px}, ${py})$ 上往镜子里看——镜子里的你，上下位置没变，但左右翻转了。`;
    intuitionEn = `Imagine the $y$-axis is a vertical mirror.\nYou stand at $(${px}, ${py})$ and look in the mirror — your reflection keeps the same up-down position, but flips left-right.`;
    xExplainZh = `$x$ 坐标：左右翻转 = 正变负，负变正。\n$x$ 原来是 $${px}$，翻转后变成 $${ansX}$`;
    xExplainEn = `$x$ coordinate: left-right flips = positive becomes negative, negative becomes positive.\n$x$ was $${px}$, after flipping it becomes $${ansX}$`;
    yExplainZh = `$y$ 坐标：镜子是竖的，所以上下不变。\n$y' = ${py}$（和原来一样）`;
    yExplainEn = `$y$ coordinate: the mirror is vertical, so up-down stays.\n$y' = ${py}$ (same as before)`;
  } else {
    intuitionZh = `想象你把整张纸绕中心点（原点）转半圈($180°$)。\n所有东西都"对面翻"了——左边的到右边，上面的到下面。`;
    intuitionEn = `Imagine spinning the whole page half a turn ($180°$) around the centre (origin).\nEverything flips to the opposite side — left goes right, top goes bottom.`;
    xExplainZh = `$x$ 坐标：转了半圈，左右互换。\n$x$ 原来是 $${px}$，翻转后变成 $${ansX}$`;
    xExplainEn = `$x$ coordinate: half turn swaps left and right.\n$x$ was $${px}$, after turning it becomes $${ansX}$`;
    yExplainZh = `$y$ 坐标：转了半圈，上下也互换。\n$y$ 原来是 $${py}$，翻转后变成 $${ansY}$`;
    yExplainEn = `$y$ coordinate: half turn swaps up and down too.\n$y$ was $${py}$, after turning it becomes $${ansY}$`;
  }

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要对称？\n布阵讲究左右呼应——你的左翼有 10 名弓箭手，右翼也要有 10 名。\n如果阵法不对称，敌人只要攻击薄弱的一侧就赢了。\n数学中的对称变换，就是帮我们精确计算"镜像位置"的工具。`,
        en: `${narrator}: "Why do we need symmetry?\nFormations need balance — 10 archers on the left, 10 on the right.\nIf a formation isn't symmetrical, the enemy just attacks the weak side.\nSymmetry transformations in maths are the tool for calculating exact mirror positions."`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：${intuitionZh}\n\n别急，我们一步一步来！`,
        en: `${narrator}: "${intuitionEn}\n\nDon't rush — let's take it one step at a time!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：先看原始坐标\n我们的点在 $A = (${px}, ${py})$\n$x = ${px}$ 表示它在${px > 0 ? '右边' : px < 0 ? '左边' : '正中间'}\n$y = ${py}$ 表示它在${py > 0 ? '上面' : py < 0 ? '下面' : '正中间'}`,
        en: `${narrator}: "First, look at the original coordinates\nOur point is at $A = (${px}, ${py})$\n$x = ${px}$ means it's on the ${px > 0 ? 'right' : px < 0 ? 'left' : 'centre'}\n$y = ${py}$ means it's ${py > 0 ? 'above' : py < 0 ? 'below' : 'at the centre'}"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：先算新的 $x$ 坐标\n${xExplainZh}`,
        en: `${narrator}: "First, calculate the new $x$\n${xExplainEn}"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：再算新的 $y$ 坐标\n${yExplainZh}`,
        en: `${narrator}: "Now calculate the new $y$\n${yExplainEn}"`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：把两个坐标组合起来\n新坐标 $A' = (${ansX}, ${ansY})$\n\n做得好！你已经完成了变换！`,
        en: `${narrator}: "Combine both coordinates\nNew coordinates $A' = (${ansX}, ${ansY})$\n\nWell done — you've completed the transformation!"`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：记住规则，以后就更快了：\n${ruleZh}\n这个规则适用于所有的点，不只是这一个。`,
        en: `${narrator}: "Remember the rule for next time:\n${ruleEn}\nThis rule works for ALL points, not just this one."`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：验算\n${verifyZh}\n太棒了！对称变换掌握了，以后排兵布阵就靠你了！`,
        en: `${narrator}: "Verify\n${verifyEn}\nBrilliant! You've mastered symmetry — you'll be designing formations in no time!"`,
      },
      highlightField: 'y',
    },
  ];

  return {
    ...template,
    description,
    data: { px, py, mode, ansX, ansY, generatorType: 'SYMMETRY_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   SIMULTANEOUS_Y8 generator: substitution method (simpler than Y9 elimination)
   ══════════════════════════════════════════════════════════ */

export function generateSimultaneousY8Mission(template: Mission): Mission {
  const tier = getTier();
  // Generate y = ax + b (first equation, already solved for y)
  const aPools = { 1: [1, 2], 2: [1, 2, 3, -1], 3: [1, 2, 3, -1, -2, -3] };
  const bPools = { 1: [1, 2, 3], 2: [-3, -2, -1, 1, 2, 3, 4, 5], 3: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5] };
  const a = pickRandom(aPools[tier]);
  const b = pickRandom(bPools[tier]);

  // Second equation: cx + dy = e, with integer solution
  const cPools = { 1: [1, 2], 2: [1, 2, 3], 3: [1, 2, 3, 4] };
  const dPools = { 1: [1], 2: [1, 2], 3: [1, 2, 3] };
  const c = pickRandom(cPools[tier]);
  const d = pickRandom(dPools[tier]);

  // Pick x from pool, compute y, compute e
  const xPools = { 1: [1, 2, 3], 2: [-2, -1, 1, 2, 3, 4], 3: [-3, -2, -1, 1, 2, 3, 4, 5] };
  const x = pickRandom(xPools[tier]);
  const y = a * x + b;
  const e = c * x + d * y;

  const narrator = pickRandom(['诸葛亮', '周瑜']);

  // Substitution intermediate: c*x + d*(a*x + b) = e → (c + d*a)*x + d*b = e → (c+da)*x = e - db
  const combinedCoeff = c + d * a;
  const constant = d * b;

  // Avoid trivial or zero-coefficient cases
  if (combinedCoeff === 0) return generateSimultaneousY8Mission(template);

  const eq1Zh = `$y = ${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}$`;
  const eq1En = eq1Zh;
  const eq2Zh = `$${c}x + ${d}y = ${e}$`;
  const eq2En = eq2Zh;

  const description: BilingualText = {
    zh: `用代入法解联立方程：${eq1Zh}，${eq2Zh}`,
    en: `Solve by substitution: ${eq1En}, ${eq2En}`,
  };

  // Build sign display helpers
  const bSign = b >= 0 ? '+ ' + b : '- ' + Math.abs(b);
  const constSign = constant >= 0 ? '+ ' + constant : '- ' + Math.abs(constant);
  const aDisplay = a === 1 ? '' : a === -1 ? '-' : String(a);

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要联立方程？\n想象两支军队要在某个地点会合。第一支走的是一条路（方程1），第二支走另一条路（方程2）。\n只有找到**两条路的交叉点**，才知道在哪里碰头。\n联立方程就是找这个交叉点的方法！`,
        en: `${narrator}: "Why do we need simultaneous equations?\nImagine two armies meeting at a point. The first takes one road (Equation 1), the second another (Equation 2).\nOnly by finding where the two roads CROSS can we know the meeting point.\nSimultaneous equations are the method for finding that crossing!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：我们有两个方程：\n方程1：${eq1Zh}\n方程2：${eq2Zh}\n\n注意方程1已经告诉我们 $y$ 等于什么了——这是代入法的关键起点！`,
        en: `${narrator}: "We have two equations:\nEquation 1: ${eq1En}\nEquation 2: ${eq2En}\n\nNotice Equation 1 already tells us what $y$ equals — this is the key starting point for substitution!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：什么是"代入"？\n很简单：方程1说 $y = ${aDisplay}x ${bSign}$\n我们把这个整体"塞"进方程2里，**替换掉方程2里的 $y$**。\n就像在句子里用具体描述替换一个代号。\n别紧张，跟着我一步步来！`,
        en: `${narrator}: "What is 'substitution'?\nSimple: Equation 1 says $y = ${aDisplay}x ${bSign}$\nWe take this whole expression and 'plug it in' to Equation 2, REPLACING the $y$ there.\nIt's like replacing a codename with its actual description in a sentence.\nDon't worry — follow me step by step!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：执行代入\n方程2原来是 $${c}x + ${d}y = ${e}$\n用 $(${aDisplay}x ${bSign})$ 替换 $y$：\n$$${c}x + ${d}(${aDisplay}x ${bSign}) = ${e}$$\n现在方程里只剩 $x$ 一个未知数了！`,
        en: `${narrator}: "Do the substitution\nEquation 2 was $${c}x + ${d}y = ${e}$\nReplace $y$ with $(${aDisplay}x ${bSign})$:\n$$${c}x + ${d}(${aDisplay}x ${bSign}) = ${e}$$\nNow there's only ONE unknown — $x$!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：展开括号\n$${d} \\times ${aDisplay}x = ${d * a}x$\n$${d} \\times (${bSign.replace('+ ', '').replace('- ', '-')}) = ${constant >= 0 ? constant : constant}$\n\n展开后得到：$${c}x + ${d * a}x ${constSign} = ${e}$\n合并 $x$ 的项：$${combinedCoeff}x ${constSign} = ${e}$`,
        en: `${narrator}: "Expand the brackets\n$${d} \\times ${aDisplay}x = ${d * a}x$\n$${d} \\times (${bSign.replace('+ ', '').replace('- ', '-')}) = ${constant}$\n\nAfter expanding: $${c}x + ${d * a}x ${constSign} = ${e}$\nCombine the $x$ terms: $${combinedCoeff}x ${constSign} = ${e}$"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：解出 $x$\n$${combinedCoeff}x ${constSign} = ${e}$\n移项：$${combinedCoeff}x = ${e} ${constant >= 0 ? '- ' + constant : '+ ' + Math.abs(constant)} = ${e - constant}$\n除以系数：$x = \\frac{${e - constant}}{${combinedCoeff}} = ${x}$\n\n$x$ 找到了！你做得太好了！`,
        en: `${narrator}: "Solve for $x$\n$${combinedCoeff}x ${constSign} = ${e}$\nRearrange: $${combinedCoeff}x = ${e} ${constant >= 0 ? '- ' + constant : '+ ' + Math.abs(constant)} = ${e - constant}$\nDivide: $x = \\frac{${e - constant}}{${combinedCoeff}} = ${x}$\n\n$x$ found! You're doing brilliantly!"`,
      },
      highlightField: 'x',
    },
    {
      text: {
        zh: `${narrator}：代回求 $y$\n把 $x = ${x}$ 代回方程1：\n$y = ${aDisplay} \\times ${x} ${bSign}$\n$y = ${a * x} ${bSign}$\n$y = ${y}$`,
        en: `${narrator}: "Substitute back to find $y$\nPut $x = ${x}$ back into Equation 1:\n$y = ${aDisplay} \\times ${x} ${bSign}$\n$y = ${a * x} ${bSign}$\n$y = ${y}$"`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：答案\n$$x = ${x}, \\quad y = ${y}$$\n这就是两条路的交叉点——两军的会合点！`,
        en: `${narrator}: "Answer\n$$x = ${x}, \\quad y = ${y}$$\nThis is where the two roads cross — the armies' meeting point!"`,
      },
      highlightField: 'y',
    },
    {
      text: {
        zh: `${narrator}：验算——把答案代回方程2检查：\n$${c} \\times (${x}) + ${d} \\times (${y})$\n$= ${c * x} + ${d * y}$\n$= ${e}$ ✓ 和方程2右边一致！\n\n恭喜你！代入法的每一步你都跟上了，非常出色！`,
        en: `${narrator}: "Verify — plug the answer back into Equation 2:\n$${c} \\times (${x}) + ${d} \\times (${y})$\n$= ${c * x} + ${d * y}$\n$= ${e}$ ✓ Matches Equation 2!\n\nCongratulations! You followed every step of substitution perfectly — outstanding!"`,
      },
      highlightField: 'y',
    },
  ];

  return {
    ...template,
    description,
    data: { subEq1: [a, b], subEq2: [c, d, e], x, y, generatorType: 'SIMULTANEOUS_Y8_RANDOM' },
    tutorialSteps,
  };
}

/* ══════════════════════════════════════════════════════════
   RATIO_Y8 generator: direct & inverse proportion (y=kx or y=k/x)
   ══════════════════════════════════════════════════════════ */

export function generateRatioY8Mission(template: Mission): Mission {
  const tier = getTier();
  const mode = pickRandom(['direct', 'inverse']) as 'direct' | 'inverse';

  const kPools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 8, 10], 3: [2, 3, 4, 5, 6, 7, 8, 10, 12, 15] };
  const k = pickRandom(kPools[tier]);

  // Known pair
  const x1Pools = { 1: [2, 3, 4, 5], 2: [2, 3, 4, 5, 6, 8], 3: [2, 3, 4, 5, 6, 8, 10] };
  const x1 = pickRandom(x1Pools[tier]);
  const y1 = mode === 'direct' ? k * x1 : k / x1;

  // Target: given x2, find y2
  const x2Pools = { 1: [2, 3, 5], 2: [2, 3, 4, 5, 6, 8, 10], 3: [2, 3, 4, 5, 6, 8, 10, 12] };
  let x2 = pickRandom(x2Pools[tier]);
  while (x2 === x1) x2 = pickRandom(x2Pools[tier]);

  const y2 = mode === 'direct' ? k * x2 : k / x2;

  // Skip non-integer answers
  if (!Number.isInteger(y1) || !Number.isInteger(y2)) return generateRatioY8Mission(template);

  const narrator = pickRandom(['曹操', '刘备']);

  const description: BilingualText = mode === 'direct'
    ? { zh: `$y$ 与 $x$ 成正比。当 $x=${x1}$ 时 $y=${y1}$，求 $x=${x2}$ 时的 $y$。`, en: `$y$ is directly proportional to $x$. When $x=${x1}$, $y=${y1}$. Find $y$ when $x=${x2}$.` }
    : { zh: `$y$ 与 $x$ 成反比。当 $x=${x1}$ 时 $y=${y1}$，求 $x=${x2}$ 时的 $y$。`, en: `$y$ is inversely proportional to $x$. When $x=${x1}$, $y=${y1}$. Find $y$ when $x=${x2}$.` };

  const formulaZh = mode === 'direct' ? '$y = kx$' : '$y = \\frac{k}{x}$';
  const formulaEn = formulaZh;
  const conceptZh = mode === 'direct'
    ? '正比例：$x$ 增大，$y$ 也增大，比值恒定。'
    : '反比例：$x$ 增大，$y$ 反而减小，乘积恒定。';
  const conceptEn = mode === 'direct'
    ? 'Direct proportion: as $x$ increases, $y$ increases — the ratio stays constant.'
    : 'Inverse proportion: as $x$ increases, $y$ decreases — the product stays constant.';

  const findKZh = mode === 'direct'
    ? `$k = \\frac{y}{x} = \\frac{${y1}}{${x1}} = ${k}$`
    : `$k = y \\times x = ${y1} \\times ${x1} = ${k}$`;
  const findKEn = findKZh;

  const calcZh = mode === 'direct'
    ? `$y = ${k} \\times ${x2} = ${y2}$`
    : `$y = \\frac{${k}}{${x2}} = ${y2}$`;
  const calcEn = calcZh;

  const verifyZh = mode === 'direct'
    ? `$\\frac{y_1}{x_1} = \\frac{${y1}}{${x1}} = ${k}$，$\\frac{y_2}{x_2} = \\frac{${y2}}{${x2}} = ${k}$ ✓ 比值相等！`
    : `$y_1 \\times x_1 = ${y1} \\times ${x1} = ${k}$，$y_2 \\times x_2 = ${y2} \\times ${x2} = ${k}$ ✓ 乘积相等！`;
  const verifyEn = mode === 'direct'
    ? `$\\frac{y_1}{x_1} = \\frac{${y1}}{${x1}} = ${k}$, $\\frac{y_2}{x_2} = \\frac{${y2}}{${x2}} = ${k}$ ✓ Ratios are equal!`
    : `$y_1 \\times x_1 = ${y1} \\times ${x1} = ${k}$, $y_2 \\times x_2 = ${y2} \\times ${x2} = ${k}$ ✓ Products are equal!`;

  const directAnalogy = {
    zh: `想象一个水龙头：开大一倍，水流也大一倍。\n水流和开度成**正比**——一个变大，另一个也按同样倍数变大。\n它们的比值 $\\frac{y}{x}$ 永远不变，这个不变的比值就叫 $k$。`,
    en: `Imagine a tap: open it twice as much, water flows twice as fast.\nWater flow is DIRECTLY proportional to how far you open it — one grows, the other grows by the same factor.\nTheir ratio $\\frac{y}{x}$ never changes — this unchanging ratio is called $k$.`,
  };
  const inverseAnalogy = {
    zh: `想象分蛋糕：人越多，每人分到的越少。\n每人的份量和人数成**反比**——一个变大，另一个就变小。\n它们的乘积 $x \\times y$ 永远不变（因为蛋糕总量没变），这个不变的乘积就叫 $k$。`,
    en: `Imagine sharing a cake: more people means less each person gets.\nEach person's share is INVERSELY proportional to the number of people — one grows, the other shrinks.\nTheir product $x \\times y$ never changes (the cake stays the same size) — this unchanging product is called $k$.`,
  };
  const analogy = mode === 'direct' ? directAnalogy : inverseAnalogy;

  const tutorialSteps = [
    {
      text: {
        zh: `${narrator}：为什么需要比例？\n治理天下处处是比例关系：\n税收和人口成正比（人越多税越多），粮草和军队数成反比（兵越多每人分到越少）。\n掌握比例，就能用已知推算未知——这是治国的核心能力！`,
        en: `${narrator}: "Why do we need proportion?\nGoverning a realm is all about proportion:\nTax is proportional to population (more people, more tax). Rations are inversely proportional to army size (more soldiers, less each gets).\nMaster proportion, and you can predict the unknown from the known — a ruler's core skill!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：${analogy.zh}`,
        en: `${narrator}: "${analogy.en}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：从题目提取已知信息：\n已知一组数据：当 $x = ${x1}$ 时，$y = ${y1}$\n目标：求当 $x = ${x2}$ 时，$y = ?$\n\n信息都找齐了，接下来就是三步计算！`,
        en: `${narrator}: "Extract the given information:\nKnown pair: when $x = ${x1}$, $y = ${y1}$\nGoal: find $y$ when $x = ${x2}$\n\nAll information gathered — just three calculation steps to go!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第一步——求常数 $k$\n$k$ 就是那个"永远不变的数"。用已知数据算出它：\n${findKZh}\n\n$k = ${k}$，记住这个数！`,
        en: `${narrator}: "Step 1 — find the constant $k$\n$k$ is the 'number that never changes'. Calculate it from the known data:\n${findKEn}\n\n$k = ${k}$, remember this number!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：第二步——用 $k$ 和新的 $x$ 求 $y$\n$k$ 不变，$x$ 变了，$y$ 自然跟着变。\n当 $x = ${x2}$ 时：\n${calcZh}`,
        en: `${narrator}: "Step 2 — use $k$ and the new $x$ to find $y$\n$k$ stays the same, $x$ changes, so $y$ changes accordingly.\nWhen $x = ${x2}$:\n${calcEn}"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：答案\n$y = ${y2}$\n\n做得非常好！你已经完成了比例计算！`,
        en: `${narrator}: "Answer\n$y = ${y2}$\n\nVery well done — you've completed the proportion calculation!"`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：验算\n${verifyZh}\n$k$ 果然没变！说明我们算对了。`,
        en: `${narrator}: "Verify\n${verifyEn}\n$k$ really didn't change! That confirms our answer is correct."`,
      },
      highlightField: 'ans',
    },
    {
      text: {
        zh: `${narrator}：总结规律\n${mode === 'direct' ? '正比例：$x$ 变大 → $y$ 也变大（同向变化）' : '反比例：$x$ 变大 → $y$ 反而变小（反向变化）'}\n公式：${formulaZh}\n\n掌握了这个规律，以后碰到类似题目就不怕了！了不起！`,
        en: `${narrator}: "Summary\n${mode === 'direct' ? 'Direct proportion: $x$ increases → $y$ increases too (same direction)' : 'Inverse proportion: $x$ increases → $y$ decreases (opposite direction)'}\nFormula: ${formulaEn}\n\nWith this pattern mastered, you'll never fear proportion problems again! Impressive!"`,
      },
      highlightField: 'ans',
    },
  ];

  return {
    ...template,
    description,
    data: { ...template.data, mode, k, x1, y1, x2, y2, answer: y2, generatorType: 'RATIO_Y8_RANDOM' },
    tutorialSteps,
  };
}
