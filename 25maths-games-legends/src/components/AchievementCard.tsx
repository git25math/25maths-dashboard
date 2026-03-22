import { memo } from 'react';
import { motion } from 'motion/react';
import { CharacterAvatar } from './CharacterAvatar';
import { lt } from '../i18n/resolveText';
import { AnimatedCounter } from './AnimatedCounter';

type Props = {
  characterId: string;
  missionTitle: { zh: string; en: string };
  score: number;
  duration: number;
  hp: number;
  difficulty: 'green' | 'amber' | 'red';
  lang: 'zh' | 'en';
  onClose: () => void;
};

const LABELS = {
  zh: {
    header: '战果报告',
    merit: '功勋',
    time: '用时',
    hp: '体力',
    difficulty: '难度',
    returnMap: '返回地图',
    brand: '25 数学三国',
    difficultyNames: { green: '名师指路', amber: '锦囊相助', red: '独当一面' },
  },
  zh_TW: {
    header: '戰果報告',
    merit: '功勳',
    time: '用時',
    hp: '體力',
    difficulty: '難度',
    returnMap: '返回地圖',
    brand: '25 數學三國',
    difficultyNames: { green: '名師指路', amber: '錦囊相助', red: '獨當一面' },
  },
  en: {
    header: 'Battle Report',
    merit: 'Merit',
    time: 'Time',
    hp: 'HP',
    difficulty: 'Difficulty',
    returnMap: 'Return to Map',
    brand: '25 Math Legends',
    difficultyNames: { green: "Master's Guide", amber: 'Tactical Hints', red: 'Solo Command' },
  },
} as const;

const DIFFICULTY_COLORS = {
  green: { bg: '#22c55e', text: '#fff' },
  amber: { bg: '#f59e0b', text: '#fff' },
  red: { bg: '#ef4444', text: '#fff' },
};

const statItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const AchievementCard = memo(function AchievementCard({
  characterId,
  missionTitle,
  score,
  duration,
  hp,
  difficulty,
  lang,
  onClose,
}: Props) {
  const t = LABELS[lang];
  const maxHp = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-[360px] max-h-[640px] overflow-hidden rounded-lg"
        style={{
          border: '4px solid #3d2b1f',
          background: 'linear-gradient(to bottom, #f4e4bc, #e8d5a7, #f4e4bc)',
          boxShadow: '0 0 24px rgba(0,0,0,0.4), inset 0 0 30px rgba(184,134,11,0.08)',
        }}
      >
        {/* === Header === */}
        <div className="flex flex-col items-center pt-6 pb-2">
          {/* Gold ornamental line */}
          <div
            className="mb-2 h-[2px] w-48"
            style={{ background: 'linear-gradient(to right, transparent, #b8860b, transparent)' }}
          />
          <h1
            className="font-black text-2xl tracking-wider text-ink"
          >
            {t.header}
          </h1>
          <div
            className="mt-2 h-[2px] w-48"
            style={{ background: 'linear-gradient(to right, transparent, #b8860b, transparent)' }}
          />
        </div>

        {/* === Character Avatar === */}
        <div className="flex justify-center py-3">
          <CharacterAvatar characterId={characterId} size={80} />
        </div>

        {/* === Mission Title === */}
        <p
          className="text-center font-bold text-lg px-6 pb-3 text-ink"
        >
          {lt(missionTitle, lang)}
        </p>

        {/* === Stats Grid (2x2) === */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
          className="grid grid-cols-2 gap-3 px-6 pb-4"
        >
          {/* Score / Merit */}
          <motion.div
            variants={statItem}
            className="flex flex-col items-center rounded-lg py-3"
            style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.25)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b5a3e' }}>
              {t.merit}
            </span>
            <span className="mt-1 text-2xl font-black" style={{ color: '#b8860b' }}>
              <AnimatedCounter value={score} />
            </span>
          </motion.div>

          {/* Time */}
          <motion.div
            variants={statItem}
            className="flex flex-col items-center rounded-lg py-3"
            style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.25)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b5a3e' }}>
              {t.time}
            </span>
            <span className="mt-1 text-2xl font-black text-ink">              {duration}s
            </span>
          </motion.div>

          {/* HP */}
          <motion.div
            variants={statItem}
            className="flex flex-col items-center rounded-lg py-3"
            style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.25)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b5a3e' }}>
              {t.hp}
            </span>
            <div className="mt-1 flex gap-1.5">
              {Array.from({ length: maxHp }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-5 w-5 rounded-full border-2"
                  style={{
                    borderColor: '#b8860b',
                    background: i < hp ? '#ef4444' : 'transparent',
                    opacity: i < hp ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Difficulty */}
          <motion.div
            variants={statItem}
            className="flex flex-col items-center rounded-lg py-3"
            style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.25)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6b5a3e' }}>
              {t.difficulty}
            </span>
            <span
              className="mt-1 inline-block rounded-full px-3 py-0.5 text-sm font-bold"
              style={{
                backgroundColor: DIFFICULTY_COLORS[difficulty].bg,
                color: DIFFICULTY_COLORS[difficulty].text,
              }}
            >
              {t.difficultyNames[difficulty]}
            </span>
          </motion.div>
        </motion.div>

        {/* === Brand Footer === */}
        <div className="flex flex-col items-center pb-3 pt-1">
          <div
            className="mb-1.5 h-[1px] w-36"
            style={{ background: 'linear-gradient(to right, transparent, #b8860b, transparent)' }}
          />
          <span className="text-xs tracking-widest" style={{ color: '#8b7355' }}>
            {t.brand}
          </span>
        </div>

        {/* === Return Button === */}
        <div className="flex justify-center pb-6">
          <button
            onClick={onClose}
            className="rounded-lg px-8 py-2.5 text-base font-bold tracking-wider transition-transform active:scale-95"
            style={{
              backgroundColor: '#3d2b1f',
              color: '#f4e4bc',
              boxShadow: '0 2px 8px rgba(61,43,31,0.4)',
            }}
          >
            {t.returnMap}
          </button>
        </div>
      </motion.div>
    </div>
  );
});
