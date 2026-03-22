import { motion } from 'motion/react';
import { AlertTriangle, ChevronRight, Star } from 'lucide-react';
import type { Language } from '../../types';
import { MathView } from '../MathView';
import { lt } from '../../i18n/resolveText';
import { INPUT_FIELDS } from './inputConfig';
import { staggerContainer, staggerItem } from '../../utils/animationPresets';
import { parseAnswer } from '../../utils/parseAnswer';

const LABELS = {
  zh: {
    title: '解题回顾',
    partialTitle: '接近正确！',
    partialHint: '方法正确，计算有误',
    yourAnswer: '你的答案',
    correctAnswer: '正确答案',
    explanation: '解题过程',
    continue: '我明白了，继续',
  },
  zh_TW: {
    title: '解題回顧',
    partialTitle: '接近正確！',
    partialHint: '方法正確，計算有誤',
    yourAnswer: '你的答案',
    correctAnswer: '正確答案',
    explanation: '解題過程',
    continue: '我明白了，繼續',
  },
  en: {
    title: 'Solution Review',
    partialTitle: 'Almost Right!',
    partialHint: 'Right method, calculation error',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    explanation: 'Solution steps',
    continue: 'Got it, continue',
  },
} as const;

type Props = {
  questionType: string;
  userInputs: Record<string, string>;
  expected: Record<string, string>;
  formula: string;
  tutorialSteps?: { text: { zh: string; en: string } }[];
  lang: Language;
  onContinue: () => void;
  continueLabel?: string;
  /** Story consequence text for wrong answer */
  storyText?: string;
  /** Partial credit mode: yellow border, encouraging message */
  isPartial?: boolean;
  /** Partial credit score earned */
  partialScore?: number;
};

export function WrongAnswerPanel({
  questionType,
  userInputs,
  expected,
  formula,
  tutorialSteps,
  lang,
  onContinue,
  continueLabel,
  storyText,
  isPartial = false,
  partialScore,
}: Props) {
  const t = LABELS[lang];
  const fc = INPUT_FIELDS[questionType as keyof typeof INPUT_FIELDS] || { zh: [], en: [] };
  const fields = fc[lang as keyof typeof fc] || fc[lang === 'zh_TW' ? 'zh' : 'zh'] || [];

  // Only show fields that have expected values
  const relevantFields = fields.filter(f => expected[f.id] !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-5 space-y-4 border-2 ${isPartial ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-200'}`}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 font-bold ${isPartial ? 'text-yellow-700' : 'text-red-700'}`}>
        {isPartial ? <Star size={20} className="text-yellow-500" /> : <AlertTriangle size={20} />}
        <span>{isPartial ? t.partialTitle : t.title}</span>
        {isPartial && partialScore !== undefined && partialScore > 0 && (
          <span className="ml-auto text-sm bg-yellow-200 px-2 py-0.5 rounded-full font-black text-yellow-800">+{partialScore} (50%)</span>
        )}
      </div>

      {/* Partial credit encouragement */}
      {isPartial && (
        <div className="bg-yellow-100 rounded-lg p-3 text-yellow-800 text-sm font-bold">
          {t.partialHint}
        </div>
      )}

      {/* Answer comparison */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
        {relevantFields.map(field => {
          const userVal = userInputs[field.id] || '—';
          const correctVal = expected[field.id] || '?';
          // In partial mode, check if this specific field was correct
          const fieldCorrect = isPartial && userVal !== '—' && correctVal !== '?' &&
            !isNaN(parseAnswer(userVal)) && !isNaN(parseAnswer(correctVal)) &&
            Math.abs(parseAnswer(userVal) - parseAnswer(correctVal)) < 0.01;
          return (
            <motion.div variants={staggerItem} key={field.id} className="grid grid-cols-2 gap-3">
              <div className={`rounded-lg p-3 text-center ${fieldCorrect ? 'bg-emerald-100' : isPartial ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <div className={`text-[10px] font-bold uppercase mb-1 ${fieldCorrect ? 'text-emerald-500' : isPartial ? 'text-yellow-500' : 'text-red-400'}`}>{t.yourAnswer}</div>
                <div className={`text-lg font-black ${fieldCorrect ? 'text-emerald-700' : isPartial ? 'text-yellow-700' : 'text-red-700'}`}>{userVal}</div>
              </div>
              <div className="bg-emerald-100 rounded-lg p-3 text-center">
                <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">{t.correctAnswer}</div>
                <div className="text-lg font-black text-emerald-700">{correctVal}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Story consequence */}
      {storyText && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 text-amber-800 text-sm italic leading-relaxed">
          {storyText}
        </div>
      )}

      {/* Formula reminder */}
      {formula && (
        <div className={`bg-white/60 rounded-lg p-3 border ${isPartial ? 'border-yellow-200' : 'border-red-100'}`}>
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{t.explanation}</div>
          <div className="flex justify-center">
            <MathView tex={formula.replace(/\$/g, '')} className="text-base text-slate-800" />
          </div>
        </div>
      )}

      {/* Tutorial steps if available (show last step = solution) */}
      {tutorialSteps && tutorialSteps.length > 0 && (
        <div className={`bg-white/60 rounded-lg p-3 border text-sm text-slate-700 leading-relaxed ${isPartial ? 'border-yellow-200' : 'border-red-100'}`}>
          {lt(tutorialSteps[tutorialSteps.length - 1].text, lang)}
        </div>
      )}

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onContinue}
        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {continueLabel || t.continue}
        <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
}
