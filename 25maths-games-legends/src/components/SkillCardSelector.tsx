import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield as ShieldIcon, Zap, Eye } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../i18n/translations';
import { lt } from '../i18n/resolveText';
import { useAudio } from '../audio';
import { DURATION } from '../utils/animationPresets';

export type SkillCard = {
  id: 'shield' | 'double' | 'reveal';
  icon: ReactNode;
  name: { zh: string; en: string };
  description: { zh: string; en: string };
  color: string;
};

export const SKILL_CARDS: SkillCard[] = [
  {
    id: 'shield',
    icon: <ShieldIcon size={48} className="drop-shadow-lg" />,
    name: { zh: '\u62A4\u76FE', en: 'Shield' },
    description: { zh: '2 \u6B21\u7B54\u9519\u514D\u6263\u8840', en: "2 wrong answers don't cost HP" },
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'double',
    icon: <Zap size={48} className="drop-shadow-lg" />,
    name: { zh: '\u53CC\u500D', en: 'Double' },
    description: { zh: '\u7B2C 3 \u9898\u8D77\u5F97\u5206\u7FFB\u500D', en: 'Double score from question 3 onwards' },
    color: 'from-amber-500 to-amber-700',
  },
  {
    id: 'reveal',
    icon: <Eye size={48} className="drop-shadow-lg" />,
    name: { zh: '\u900F\u89C6', en: 'Reveal' },
    description: { zh: '\u7B2C 1 \u9898\u663E\u793A\u516C\u5F0F\u63D0\u793A', en: 'Show formula hint on question 1' },
    color: 'from-purple-600 to-purple-800',
  },
];

export const SkillCardSelector = ({
  lang,
  onSelect,
}: {
  lang: Language;
  onSelect: (cardId: string) => void;
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const t = translations[lang];
  const { playCardPick, playShieldOn, playDoubleOn, playReveal } = useAudio();

  const skillSounds: Record<string, () => void> = {
    shield: playShieldOn,
    double: playDoubleOn,
    reveal: playReveal,
  };

  const handleSelect = (id: string) => {
    if (selectedId) return; // prevent double click
    playCardPick();
    skillSounds[id]?.();
    setSelectedId(id);
    setTimeout(() => onSelect(id), DURATION.normal * 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <motion.h2
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 mb-2 tracking-widest"
      >
        {t.chooseSkillCard}
      </motion.h2>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-10"
      />

      {/* Cards */}
      <div className="relative flex flex-col md:flex-row gap-6 md:gap-8">
        <AnimatePresence>
          {SKILL_CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              initial={{ y: 40, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: selectedId === card.id ? 1.1 : selectedId ? 0.9 : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                delay: selectedId ? 0 : 0.2 + i * 0.1,
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              onClick={() => handleSelect(card.id)}
              disabled={!!selectedId}
              className={`relative w-52 md:w-56 rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
                ${selectedId === card.id
                  ? 'border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)]'
                  : selectedId
                    ? 'border-white/10 opacity-50'
                    : 'border-amber-700/50 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                }
              `}
            >
              {/* Card background gradient */}
              <div className={`bg-gradient-to-b ${card.color} p-6 pb-4 flex flex-col items-center`}>
                <span className="text-white mb-3">{card.icon}</span>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-wider drop-shadow">
                  {lt(card.name, lang)}
                </h3>
              </div>
              {/* Card description area */}
              <div className="bg-slate-900/90 border-t-2 border-amber-700/30 px-4 py-4">
                <p className="text-sm text-slate-300 font-bold leading-relaxed">
                  {lt(card.description, lang)}
                </p>
              </div>

              {/* Gold corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500/50 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500/50 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500/50 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500/50 rounded-br-2xl" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
