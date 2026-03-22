/**
 * Parse mathematical input strings into numbers.
 * Supports: fractions (3/4), square roots (√5, sqrt(5)), negatives (-3), decimals (0.5), integers (7)
 */
export function parseAnswer(input: string): number {
  if (!input || !input.trim()) return NaN;
  const s = input.trim();

  // Fraction: "3/4", "-1/2", "19/27"
  const fracMatch = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den === 0) return NaN;
    return num / den;
  }

  // Square root: "√5", "sqrt(5)", "√(5)", "sqrt5"
  const sqrtMatch = s.match(/^(?:√|sqrt)\(?(\d+(?:\.\d+)?)\)?$/i);
  if (sqrtMatch) {
    return Math.sqrt(parseFloat(sqrtMatch[1]));
  }

  // Negative square root: "-√5"
  const negSqrtMatch = s.match(/^-(?:√|sqrt)\(?(\d+(?:\.\d+)?)\)?$/i);
  if (negSqrtMatch) {
    return -Math.sqrt(parseFloat(negSqrtMatch[1]));
  }

  // Plain number (integer, decimal, negative)
  const num = parseFloat(s);
  return num;
}

/**
 * Format a number as a fraction string if it's a clean ratio, otherwise as decimal.
 * Used for displaying expected answers (especially probability).
 */
export function toFraction(value: number, maxDenom: number = 1000): string {
  if (Number.isInteger(value)) return String(value);

  // Find best fraction approximation
  let bestNum = 0, bestDen = 1, bestErr = Math.abs(value);
  for (let den = 2; den <= maxDenom; den++) {
    const num = Math.round(value * den);
    const err = Math.abs(value - num / den);
    if (err < bestErr) {
      bestErr = err;
      bestNum = num;
      bestDen = den;
      if (err < 1e-10) break; // exact match
    }
  }

  if (bestErr < 0.001) {
    // Simplify
    const g = gcd(Math.abs(bestNum), bestDen);
    return `${bestNum / g}/${bestDen / g}`;
  }

  // Fallback to decimal
  return String(Math.round(value * 10000) / 10000);
}

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}
