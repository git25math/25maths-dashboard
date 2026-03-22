import { useState } from 'react';
import { motion } from 'motion/react';
import type { Language } from '../types';
import { translations } from '../i18n/translations';
import { buttonBase, INPUT_FOCUS_CLASS } from '../utils/animationPresets';

export const GradeSelectScreen = ({
  lang,
  onSelect,
}: {
  lang: Language;
  onSelect: (grade: number, className?: string) => void;
}) => {
  const t = translations[lang];
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [className, setClassName] = useState('');

  const LABELS = {
    zh: { classPrompt: '你的班级是？', placeholder: '如 7B（可跳过）', confirm: '确认', skip: '跳过' },
    zh_TW: { classPrompt: '你的班級是？', placeholder: '如 7B（可跳過）', confirm: '確認', skip: '跳過' },
    en: { classPrompt: 'What is your class?', placeholder: 'e.g. 7B (optional)', confirm: 'Confirm', skip: 'Skip' },
  };
  const l = LABELS[lang] || LABELS.zh;

  const handleConfirm = () => {
    if (selectedGrade) {
      onSelect(selectedGrade, className.trim() || undefined);
    }
  };

  return (
    <motion.div key="grade-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center space-y-12 py-20">
      <h2 className="text-5xl font-black text-white tracking-tighter">{t.chooseGrade}</h2>

      {/* Grade buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[7, 8, 9, 10, 11].map(g => (
          <motion.button
            key={g}
            {...buttonBase}
            onClick={() => setSelectedGrade(g)}
            animate={selectedGrade === g ? { scale: 1.05, borderColor: '#818cf8' } : { scale: 1, borderColor: 'rgba(255,255,255,0.1)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`p-8 border-2 rounded-3xl text-white group ${
              selectedGrade === g
                ? 'bg-indigo-600'
                : 'bg-white/5 hover:bg-indigo-600/50'
            }`}
          >
            <span className="block text-4xl font-black mb-2">{g}</span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">{t.year}</span>
          </motion.button>
        ))}
      </div>

      {/* Class name input — appears after grade is selected */}
      {selectedGrade && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-lg font-bold text-white/80">{l.classPrompt}</p>
          <input
            type="text"
            value={className}
            onChange={e => setClassName(e.target.value.toUpperCase())}
            placeholder={l.placeholder}
            className={`bg-white/10 border-2 border-white/20 rounded-xl px-6 py-3 text-center text-white text-xl font-bold w-48 placeholder:text-white/30 transition-colors ${INPUT_FOCUS_CLASS}`}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          />
          <div className="flex gap-3">
            <motion.button
              {...buttonBase}
              onClick={() => onSelect(selectedGrade)}
              className="px-6 py-2 bg-white/10 border border-white/20 text-white/60 font-bold rounded-xl text-sm hover:bg-white/20 transition-all"
            >
              {l.skip}
            </motion.button>
            <motion.button
              {...buttonBase}
              onClick={handleConfirm}
              className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-500 transition-all"
            >
              {l.confirm}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
