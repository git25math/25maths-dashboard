import { memo } from 'react';
import { motion } from 'motion/react';
import { CharacterAvatar } from './CharacterAvatar';
import { MathView } from './MathView';
import { lt } from '../i18n/resolveText';

type Props = {
  characterId: string;
  skillName: { zh: string; en: string };
  skillSummary: { zh: string; en: string };
  formula: string;
  missionTitle: { zh: string; en: string };
  lang: 'zh' | 'en';
  onClose: () => void;
};

const LABELS = {
  zh: {
    header: '技能习得',
    mastered: '已掌握',
    summary: '技巧总结',
    continue: '继续',
    brand: '25 数学三国',
  },
  zh_TW: {
    header: '技能習得',
    mastered: '已掌握',
    summary: '技巧總結',
    continue: '繼續',
    brand: '25 數學三國',
  },
  en: {
    header: 'Skill Acquired',
    mastered: 'Mastered',
    summary: 'Key Technique',
    continue: 'Continue',
    brand: '25 Math Legends',
  },
} as const;

export const SkillBadgeCard = memo(function SkillBadgeCard({
  characterId,
  skillName,
  skillSummary,
  formula,
  missionTitle,
  lang,
  onClose,
}: Props) {
  const t = LABELS[lang];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotateY: -30 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.6, opacity: 0, rotateY: 30 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
        className="relative w-full max-w-[340px] overflow-hidden rounded-xl"
        style={{
          border: '4px solid #b8860b',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 0 40px rgba(184,134,11,0.3), inset 0 0 30px rgba(184,134,11,0.05)',
        }}
      >
        {/* Gold header bar */}
        <div
          className="py-3 text-center"
          style={{ background: 'linear-gradient(to right, #b8860b, #daa520, #b8860b)' }}
        >
          <h1 className="font-black text-lg tracking-wider text-[#1a1a2e]">
            {t.header}
          </h1>
        </div>

        {/* Badge body */}
        <div className="flex flex-col items-center px-6 pt-5 pb-3">
          {/* Character avatar with golden ring */}
          <div className="relative mb-3">
            <div
              className="rounded-full p-1"
              style={{ background: 'linear-gradient(135deg, #b8860b, #daa520, #b8860b)' }}
            >
              <div className="bg-[#1a1a2e] rounded-full p-1">
                <CharacterAvatar characterId={characterId} size={72} />
              </div>
            </div>
            {/* Stars */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + i * 0.15, type: 'spring', bounce: 0.5 }}
                  className="text-yellow-400 text-sm"
                >
                  ★
                </motion.span>
              ))}
            </div>
          </div>

          {/* Mission title (small) */}
          <p className="text-white/40 text-xs mb-1">{lt(missionTitle, lang)}</p>

          {/* Skill name (large, golden) */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-black text-2xl tracking-wider mb-4"
            style={{ color: '#daa520' }}
          >
            {lt(skillName, lang)}
          </motion.h2>

          {/* Mastered badge */}
          <div
            className="px-4 py-1 rounded-full text-xs font-bold tracking-wider mb-4"
            style={{ background: 'rgba(184,134,11,0.2)', border: '1px solid rgba(184,134,11,0.4)', color: '#daa520' }}
          >
            {t.mastered} ★★★
          </div>

          {/* Skill summary */}
          <div
            className="w-full rounded-lg p-4 mb-3"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(184,134,11,0.15)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: '#b8860b' }}>
              {t.summary}
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              {lt(skillSummary, lang)}
            </p>
            {formula && (
              <div className="flex justify-center">
                <MathView tex={formula.replace(/\$/g, '')} className="text-base text-yellow-300" />
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="flex flex-col items-center py-1">
            <div
              className="h-[1px] w-24 mb-1.5"
              style={{ background: 'linear-gradient(to right, transparent, #b8860b, transparent)' }}
            />
            <span className="text-[10px] tracking-widest" style={{ color: '#6b5a3e' }}>
              {t.brand}
            </span>
          </div>
        </div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="flex justify-center pb-5 px-6"
        >
          <button
            onClick={onClose}
            className="w-full rounded-lg px-8 py-2.5 text-base font-bold tracking-wider transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(to right, #b8860b, #daa520, #b8860b)',
              color: '#1a1a2e',
              boxShadow: '0 2px 12px rgba(184,134,11,0.4)',
            }}
          >
            {t.continue}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
});
