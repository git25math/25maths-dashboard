import type { Language, BilingualText } from '../types';

/**
 * Resolve a formula (string or BilingualText) to a display string.
 * Strips $ delimiters. For BilingualText, picks the right language and auto-converts zh_TW.
 */
export function resolveFormula(formula: string | BilingualText, lang: Language): string {
  if (typeof formula === 'string') return formula.replace(/\$/g, '');
  const base = lang === 'en' ? formula.en : formula.zh;
  const resolved = lang === 'zh_TW' ? toTraditional(base) : base;
  return resolved.replace(/\$/g, '');
}
import { toTraditional } from './zhHantMap';
import { translations } from './translations';

/**
 * Resolve a BilingualText to a single string based on Language.
 * For 'zh_TW', automatically converts Simplified Chinese to Traditional.
 */
export function resolveText(text: BilingualText, lang: Language): string {
  if (lang === 'en') return text.en;
  if (lang === 'zh_TW') return toTraditional(text.zh);
  return text.zh;
}

/**
 * Get the translations object for a given language.
 * zh_TW has its own dedicated translations for UI strings.
 */
export function getTranslations(lang: Language) {
  if (lang === 'zh_TW') return translations.zh_TW;
  if (lang === 'en') return translations.en;
  return translations.zh;
}

/**
 * Get the base language key for accessing BilingualText fields.
 * zh_TW → 'zh' (we auto-convert), en → 'en', zh → 'zh'
 */
export function baseLang(lang: Language): 'zh' | 'en' {
  return lang === 'en' ? 'en' : 'zh';
}

/**
 * Shorthand: access BilingualText[lang] with auto Traditional Chinese conversion.
 * Use this everywhere instead of `text[lang]`.
 */
export function lt(text: { zh: string; en: string }, lang: Language): string {
  const base = lang === 'en' ? text.en : text.zh;
  return lang === 'zh_TW' ? toTraditional(base) : base;
}
