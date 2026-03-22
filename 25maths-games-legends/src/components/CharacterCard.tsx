import { motion } from 'motion/react';
import type { Character, Language } from '../types';
import { translations } from '../i18n/translations';
import { lt } from '../i18n/resolveText';
import { MathView, LatexText } from './MathView';
import { CharacterAvatar } from './CharacterAvatar';

export const CharacterCard = ({ character, isSelected, onSelect, lang }: { character: Character; isSelected: boolean; onSelect: () => void; lang: Language; key?: string }) => (
  <motion.div
    whileHover={isSelected ? undefined : { scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onSelect}
    animate={isSelected ? { borderColor: ["#b8860b", "#daa520", "#b8860b"] } : {}}
    transition={isSelected ? { repeat: Infinity, duration: 2 } : undefined}
    className={`cursor-pointer p-4 rounded-2xl border-4 transition-all ${
      isSelected ? 'shadow-xl scale-105 bg-white/10' : 'border-transparent bg-white/5'
    }`}
    style={isSelected ? { borderColor: '#b8860b' } : undefined}
  >
    <div className="mx-auto mb-4 flex justify-center">
      <CharacterAvatar characterId={character.id} size={96} />
    </div>
    <h3 className="text-lg font-bold text-white text-center">{lt(character.name, lang)}</h3>
    <p className="text-yellow-300 text-xs text-center font-medium mb-3">{lt(character.role, lang)}</p>

    <div className="bg-black/20 p-2 rounded-lg mb-3">
      <p className="text-[10px] text-indigo-300 font-bold mb-1">{lang === 'zh' ? '武将技能' : 'Skill'}:</p>
      <LatexText text={lt(character.skill, lang)} className="text-[10px] text-white/80 leading-tight italic" />
    </div>

    <div className="space-y-1 mb-3">
      {Object.entries(character.stats).map(([key, val]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase w-8">{translations[lang].stats[key as keyof typeof character.stats]}</span>
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${character.color}`} style={{ width: `${val}%` }} />
          </div>
          <MathView tex={val} className="text-[10px] text-white font-bold" />
        </div>
      ))}
    </div>
    <p className="text-gray-400 text-[10px] text-center leading-tight">{lt(character.description, lang)}</p>
  </motion.div>
);
