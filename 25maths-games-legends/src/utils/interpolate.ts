/**
 * Interpolates {key} placeholders in a string with values from a params object.
 * Used to parameterize mission story/description text so generators only change numbers.
 *
 * Example: interpolate("已知 $x+{a}={b}$", { a: 5, b: 12 }) → "已知 $x+5=12$"
 */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const val = params[key];
    return val !== undefined ? String(val) : match;
  });
}

/** Interpolate both zh and en fields of a BilingualText with the same params. */
export function interpolateBilingual(
  template: { zh: string; en: string },
  params: Record<string, string | number>,
): { zh: string; en: string } {
  return {
    zh: interpolate(template.zh, params),
    en: interpolate(template.en, params),
  };
}
