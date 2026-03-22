import type { Mission } from '../types';
import { parseAnswer, toFraction } from './parseAnswer';

export type CheckResult = {
  correct: boolean;
  /** Partial credit: true when answer is close but not exact */
  partial?: boolean;
  /** Expected answers keyed by input field id (e.g. { x: '7' }, { m: '2', b: '-1' }) */
  expected: Record<string, string>;
};

/** Parse user input — supports fractions (3/4), sqrt, negatives */
function parse(input: string): number {
  return parseAnswer(input);
}

function round(v: number, decimals = 4): string {
  return parseFloat(v.toFixed(decimals)).toString();
}

/** Format probability as fraction */
function probFraction(numerator: number, denominator: number): string {
  // GCD to simplify
  const g = gcd(Math.abs(Math.round(numerator)), Math.abs(Math.round(denominator)));
  return `${Math.round(numerator) / g}/${Math.round(denominator) / g}`;
}

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function checkAnswer(mission: Mission, inputs: { [key: string]: string }): CheckResult {
  const { type, data, topic } = mission;

  if (type === 'SIMPLE_EQ') {
    return { correct: parse(inputs.x || '') === data.x, expected: { x: String(data.x) } };
  }
  if (type === 'ESTIMATION') {
    if (data.answer !== undefined) {
      return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
    }
    const val = Math.round(Math.sqrt(data.value));
    return { correct: parseInt(inputs.ans || '') === val, expected: { ans: String(val) } };
  }
  if (type === 'PERCENTAGE') {
    if (data.answer !== undefined) {
      return { correct: Math.abs(parse(inputs.ans || '') - data.answer) < 0.01, expected: { ans: round(data.answer) } };
    }
    const { initial, rate, years } = data;
    const val = initial * Math.pow(1 + rate, years);
    return { correct: Math.abs(parse(inputs.ans || '') - val) < 0.01, expected: { ans: round(val) } };
  }
  if (type === 'QUADRATIC' && topic === 'Calculus') {
    return { correct: parse(inputs.x || '') === data.p2[0], expected: { x: String(data.p2[0]) } };
  }
  if (type === 'LINEAR') {
    if (!data.points) return { correct: false, expected: {} };
    const [[x1, y1], [x2, y2]] = data.points;
    const m = (y2 - y1) / (x2 - x1);
    const c = y1 - m * x1;
    const ok = Math.abs(parse(inputs.m || '') - m) < 0.01 && Math.abs(parse(inputs.c || '') - c) < 0.01;
    return { correct: ok, expected: { m: round(m), c: round(c) } };
  }
  if (type === 'FUNC_VAL') {
    const { m, b, x, a } = data;
    if (m !== undefined) {
      const val = m * x + b;
      return { correct: Math.abs(parse(inputs.y || '') - val) < 0.01, expected: { y: round(val) } };
    }
    const val = -data.b / (2 * a);
    return { correct: Math.abs(parse(inputs.t || '') - val) < 0.01, expected: { t: round(val) } };
  }
  if (type === 'DERIVATIVE') {
    if (data.func === '3x^2-3') {
      return { correct: Math.abs(parse(inputs.x || '') - data.x) < 0.01, expected: { x: String(data.x) } };
    }
    const val = 2 * data.x;
    return { correct: Math.abs(parse(inputs.k || '') - val) < 0.01, expected: { k: round(val) } };
  }
  if (type === 'AREA') {
    if (data.answer !== undefined) {
      return { correct: Math.abs(parse(inputs.area || '') - data.answer) < 0.01, expected: { area: round(data.answer) } };
    }
    const { length, width, r, pi, mode } = data;
    let val: number;
    if (mode === 'sphere_area') {
      val = 4 * pi * r * r;
    } else if (data.a !== undefined && data.b !== undefined && data.h !== undefined) {
      val = (data.a + data.b) * data.h / 2;
    } else {
      val = length * width;
    }
    return { correct: Math.abs(parse(inputs.area || '') - val) < 0.01, expected: { area: round(val) } };
  }
  if (type === 'QUADRATIC') {
    if (!data.p1 || !data.p2) return { correct: false, expected: {} };
    const [x1, y1] = data.p1;
    const [x2, y2] = data.p2;
    const cVal = y1;
    const aVal = (y2 - y1) / (x2 * x2);
    const ok = Math.abs(parse(inputs.a || '') - aVal) < 0.01 && Math.abs(parse(inputs.c || '') - cVal) < 0.01;
    return { correct: ok, expected: { a: round(aVal), c: round(cVal) } };
  }
  if (type === 'INDICES') {
    const { e1, e2, op } = data;
    const val = op === 'div' ? e1 - e2 : e1 + e2;
    return { correct: parse(inputs.x || '') === val, expected: { x: String(val) } };
  }
  if (type === 'PYTHAGORAS') {
    const { a, b, c } = data;
    if (c !== undefined) {
      const val = Math.sqrt(c * c - a * a);
      return { correct: Math.abs(parse(inputs.c || '') - val) < 0.01, expected: { c: round(val) } };
    }
    const val = Math.sqrt(a * a + b * b);
    return { correct: Math.abs(parse(inputs.c || '') - val) < 0.01, expected: { c: round(val) } };
  }
  if (type === 'SIMULTANEOUS') {
    if (data.eq1) {
      const [a1, b1, c1] = data.eq1;
      const [a2, b2, c2] = data.eq2;
      const det = a1 * b2 - a2 * b1;
      const xVal = (c1 * b2 - c2 * b1) / det;
      const yVal = (a1 * c2 - a2 * c1) / det;
      const ok = Math.abs(parse(inputs.x || '') - xVal) < 0.01 && Math.abs(parse(inputs.y || '') - yVal) < 0.01;
      return { correct: ok, expected: { x: round(xVal), y: round(yVal) } };
    }
    const ok = parse(inputs.x || '') === data.x && parse(inputs.y || '') === data.y;
    return { correct: ok, expected: { x: String(data.x), y: String(data.y) } };
  }
  if (type === 'ANGLES') {
    if (data.answer !== undefined) {
      return { correct: parse(inputs.x || '') === data.answer, expected: { x: String(data.answer) } };
    }
    // Fallback: complementary/supplementary angle (Y7 style)
    const total = data.total || 180;
    const val = total - (data.givenAngle ?? data.angle);
    return { correct: parse(inputs.x || '') === val, expected: { x: String(val) } };
  }
  if (type === 'VOLUME') {
    if (data.answer !== undefined) {
      return { correct: Math.abs(parse(inputs.v || '') - data.answer) < 0.01, expected: { v: round(data.answer) } };
    }
    const { radius, height, pi, mode } = data;
    let val = pi * radius * radius * height;
    if (mode === 'cone') val = (1 / 3) * pi * radius * radius * height;
    return { correct: Math.abs(parse(inputs.v || '') - val) < 0.01, expected: { v: round(val) } };
  }
  if (type === 'TRIGONOMETRY') {
    if (data.func === 'sin') {
      const sinVal = data.angle === 30 ? 0.5 : Math.sin(data.angle * Math.PI / 180);
      const val = data.opposite / sinVal;
      return { correct: Math.abs(parse(inputs.c || '') - val) < 0.01, expected: { c: round(val) } };
    }
    if (data.func === 'tan_inv') {
      const val = Math.atan2(data.opposite, data.adjacent) * 180 / Math.PI;
      return { correct: Math.abs(parse(inputs.angle || '') - val) < 0.01, expected: { angle: round(val) } };
    }
    const val = data.opposite / data.adjacent;
    return { correct: Math.abs(parse(inputs.tan || '') - val) < 0.01, expected: { tan: round(val) } };
  }
  if (type === 'PROBABILITY') {
    if (data.p1 !== undefined) {
      const val = data.p1 * data.p2;
      return { correct: Math.abs(parse(inputs.p || '') - val) < 0.01, expected: { p: toFraction(val) } };
    }
    const val = data.target / data.total;
    return { correct: Math.abs(parse(inputs.p || '') - val) < 0.01, expected: { p: probFraction(data.target, data.total) } };
  }
  if (type === 'INTEGRATION') {
    const { lower, upper, func, a, b } = data;
    const l = lower !== undefined ? lower : a;
    const u = upper !== undefined ? upper : b;
    let val = 0;
    if (func === 'x') val = 0.5 * (u * u - l * l);
    else if (func === '3x^2') val = u * u * u - l * l * l;
    else val = u * u - l * l;
    return { correct: Math.abs(parse(inputs.area || '') - val) < 0.01, expected: { area: round(val) } };
  }
  if (type === 'ARITHMETIC') {
    const val = data.a1 + (data.n - 1) * data.d;
    return { correct: parse(inputs.ans || '') === val, expected: { ans: String(val) } };
  }
  if (type === 'ROOTS') {
    const { a, b, c } = data;
    const disc = b * b - 4 * a * c;
    const x1 = (-b + Math.sqrt(disc)) / (2 * a);
    const x2 = (-b - Math.sqrt(disc)) / (2 * a);
    const inputX = parse(inputs.x || '');
    const ok = Math.abs(inputX - x1) < 0.01 || Math.abs(inputX - x2) < 0.01;
    return { correct: ok, expected: { x: `${round(x1)} or ${round(x2)}` } };
  }
  if (type === 'CIRCLE') {
    if (data.answer !== undefined) {
      const field = data.mode === 'area' ? 'area' : 'c';
      return { correct: Math.abs(parse(inputs[field] || '') - data.answer) < 0.01, expected: { [field]: round(data.answer) } };
    }
    const { r, pi, mode } = data;
    if (mode === 'area') {
      const val = pi * r * r;
      return { correct: Math.abs(parse(inputs.area || '') - val) < 0.01, expected: { area: round(val) } };
    }
    const val = 2 * pi * r;
    return { correct: Math.abs(parse(inputs.c || '') - val) < 0.01, expected: { c: round(val) } };
  }
  if (type === 'STATISTICS') {
    const { values, mode } = data;
    if (mode === 'mean') {
      const val = values.reduce((a: number, b: number) => a + b, 0) / values.length;
      return { correct: Math.abs(parse(inputs.ans || '') - val) < 0.01, expected: { ans: round(val) } };
    }
    if (mode === 'median') {
      const sorted = [...values].sort((a: number, b: number) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const val = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      return { correct: Math.abs(parse(inputs.ans || '') - val) < 0.01, expected: { ans: round(val) } };
    }
    if (mode === 'range') {
      const sorted = [...values].sort((a: number, b: number) => a - b);
      const val = sorted[sorted.length - 1] - sorted[0];
      return { correct: Math.abs(parse(inputs.ans || '') - val) < 0.01, expected: { ans: round(val) } };
    }
    if (mode === 'mode') {
      // Mode = most frequent value
      return { correct: parse(inputs.ans || '') === data.modeValue, expected: { ans: String(data.modeValue) } };
    }
  }
  if (type === 'RATIO') {
    if (data.answer !== undefined && inputs.ans !== undefined) {
      return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
    }
    const { a, b } = data;
    const x = parse(inputs.x || '');
    const y = parse(inputs.y || '');
    return { correct: Math.abs(x / y - a / b) < 0.01, expected: { x: String(a), y: String(b) } };
  }
  if (type === 'SIMILARITY') {
    const val = (data.a / data.b) * data.c;
    return { correct: Math.abs(parse(inputs.x || '') - val) < 0.01, expected: { x: round(val) } };
  }
  if (type === 'HCF') {
    // Compute HCF from data.numbers array
    const nums = data.numbers as number[];
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      result = gcd(result, nums[i]);
    }
    return { correct: parse(inputs.ans || '') === result, expected: { ans: String(result) } };
  }
  if (type === 'LCM') {
    // Compute LCM from data.numbers array
    const nums = data.numbers as number[];
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      result = (result * nums[i]) / gcd(result, nums[i]);
    }
    return { correct: parse(inputs.ans || '') === result, expected: { ans: String(result) } };
  }
  if (type === 'INTEGER_ADD') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'FRAC_ADD' || type === 'FRAC_MUL') {
    // data.ansNum and data.ansDen store the simplified fraction answer
    const userVal = parse(inputs.ans || '');
    const expected = data.ansNum / data.ansDen;
    const g = gcd(Math.abs(data.ansNum), Math.abs(data.ansDen));
    const simpNum = data.ansNum / g;
    const simpDen = data.ansDen / g;
    const correct = Math.abs(userVal - expected) < 0.001;
    const expectedStr = simpDen === 1 ? String(simpNum) : `${simpNum}/${simpDen}`;
    return { correct, expected: { ans: expectedStr } };
  }
  if (type === 'FACTOR_TREE') {
    // data.primeCount is the total number of prime factors (with repetition)
    return { correct: parse(inputs.ans || '') === data.primeCount, expected: { ans: String(data.primeCount) } };
  }
  if (type === 'PRIME') {
    const isPrime = data.isPrime ? 1 : 0;
    return { correct: parse(inputs.ans || '') === isPrime, expected: { ans: String(isPrime) } };
  }
  if (type === 'SQUARE_CUBE') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'SQUARE_ROOT') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'SUBSTITUTION') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'PERIMETER') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'FACTORS_LIST') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'INTEGER_MUL') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'FDP_CONVERT') {
    return { correct: Math.abs(parse(inputs.ans || '') - data.answer) < 0.01, expected: { ans: String(data.answer) } };
  }
  if (type === 'BODMAS') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'SIMPLIFY') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'MIXED_IMPROPER') {
    return { correct: parse(inputs.ans || '') === data.answer, expected: { ans: String(data.answer) } };
  }
  if (type === 'COORDINATES') {
    const ok = parse(inputs.x || '') === data.targetX && parse(inputs.y || '') === data.targetY;
    return { correct: ok, expected: { x: String(data.targetX), y: String(data.targetY) } };
  }
  if (type === 'EXPAND') {
    return { correct: Math.abs(parse(inputs.ans || '') - data.answer) < 0.01, expected: { ans: String(data.answer) } };
  }
  if (type === 'FACTORISE') {
    return { correct: Math.abs(parse(inputs.ans || '') - data.answer) < 0.01, expected: { ans: String(data.answer) } };
  }
  if (type === 'INEQUALITY') {
    return { correct: Math.abs(parse(inputs.ans || '') - data.answer) < 0.01, expected: { ans: String(data.answer) } };
  }
  if (type === 'STD_FORM') {
    const okA = Math.abs(parse(inputs.a || '') - data.a) < 0.01;
    const okN = parse(inputs.n || '') === data.n;
    return { correct: okA && okN, expected: { a: round(data.a), n: String(data.n) } };
  }
  if (type === 'SYMMETRY') {
    const ok = parse(inputs.x || '') === data.ansX && parse(inputs.y || '') === data.ansY;
    return { correct: ok, expected: { x: String(data.ansX), y: String(data.ansY) } };
  }
  return { correct: false, expected: {} };
}

// --- Partial credit logic ---
// Question types that explicitly support partial credit
const PARTIAL_CREDIT_TYPES = new Set([
  'LINEAR', 'SIMULTANEOUS', 'QUADRATIC', 'STD_FORM', 'COORDINATES', 'SYMMETRY',
  // Single numeric types — tolerance-based partial credit
  'AREA', 'VOLUME', 'PERCENTAGE', 'PYTHAGORAS', 'TRIGONOMETRY', 'CIRCLE',
  'PROBABILITY', 'INTEGRATION', 'STATISTICS', 'SIMILARITY', 'FUNC_VAL',
  'DERIVATIVE', 'SIMPLE_EQ', 'ANGLES', 'RATIO', 'INDICES',
  'FRAC_ADD', 'FRAC_MUL', 'SUBSTITUTION', 'PERIMETER', 'EXPAND',
  'FACTORISE', 'INEQUALITY', 'FDP_CONVERT', 'BODMAS', 'SIMPLIFY',
  'ARITHMETIC', 'ESTIMATION', 'SQUARE_CUBE', 'SQUARE_ROOT',
  'INTEGER_ADD', 'INTEGER_MUL', 'HCF', 'LCM',
]);

// Types that NEVER get partial credit (boolean/discrete answers)
const NO_PARTIAL_TYPES = new Set(['PRIME', 'FACTOR_TREE', 'FACTORS_LIST', 'MIXED_IMPROPER']);

/** Check if a result qualifies for partial credit */
export function checkPartialCredit(mission: Mission, inputs: { [key: string]: string }, result: CheckResult): CheckResult {
  if (result.correct || NO_PARTIAL_TYPES.has(mission.type)) return result;
  if (!PARTIAL_CREDIT_TYPES.has(mission.type)) return result;

  const expected = result.expected;
  const fields = Object.keys(expected);
  if (fields.length === 0) return result;

  // Multi-field types: partial if at least one field is correct
  if (fields.length >= 2) {
    let correctFields = 0;
    for (const f of fields) {
      const userVal = parse(inputs[f] || '');
      const expVal = parse(expected[f] || '');
      if (!isNaN(expVal) && !isNaN(userVal) && Math.abs(userVal - expVal) < 0.01) {
        correctFields++;
      }
    }
    if (correctFields > 0 && correctFields < fields.length) {
      return { correct: false, partial: true, expected };
    }
  }

  // Single-field types: partial if within 15% error margin
  if (fields.length === 1) {
    const f = fields[0];
    const userVal = parse(inputs[f] || '');
    const expVal = parse(expected[f] || '');
    if (!isNaN(expVal) && !isNaN(userVal) && expVal !== 0) {
      const relError = Math.abs(userVal - expVal) / Math.abs(expVal);
      if (relError > 0 && relError < 0.15) {
        return { correct: false, partial: true, expected };
      }
    }
  }

  return result;
}

/** Backward-compatible wrapper — returns boolean only */
export function checkCorrectness(mission: Mission, inputs: { [key: string]: string }): boolean {
  return checkAnswer(mission, inputs).correct;
}
