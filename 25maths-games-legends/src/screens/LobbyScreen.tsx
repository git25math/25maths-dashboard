import { motion } from 'motion/react';
import { Timer } from 'lucide-react';
import type { Language, Room } from '../types';
import { translations } from '../i18n/translations';
import { lt } from '../i18n/resolveText';
import { CHARACTERS } from '../data/characters';
import { buttonBase } from '../utils/animationPresets';

export const LobbyScreen = ({
  lang,
  room,
  userId,
  onReady,
  onStart,
  onLeave,
}: {
  lang: Language;
  room: Room;
  userId: string;
  onReady: () => void;
  onStart: () => void;
  onLeave: () => void;
}) => {
  const t = translations[lang];
  return (
    <motion.div key="lobby" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-[3rem] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-800 mb-2">
              {room.type === 'team' ? t.teamMode : t.pkMode}
            </h2>
            <p className="text-slate-500 flex items-center gap-2 font-bold">
              <Timer size={18} />
              {t.waitingPlayers}
            </p>
          </div>
          <div className="bg-slate-100 px-6 py-3 rounded-2xl font-black text-slate-600">
            ID: {room.id.slice(0, 6)}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {Object.entries(room.players).map(([uid, p]: [string, any]) => (
            <div key={uid} className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between border-2 border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-slate-200 flex items-center justify-center text-2xl font-black text-slate-500`}>
                  {p.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-black text-slate-800">{p.name}</p>
                  <p className="text-xs text-indigo-500 font-bold">{(() => { const ch = CHARACTERS.find(c => c.id === p.charId); return ch ? lt(ch.role, lang) : ''; })()}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${p.isReady ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                {p.isReady ? t.ready : '...'}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <motion.button {...buttonBase} onClick={onLeave} className="flex-1 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-colors">
            {t.leave}
          </motion.button>
          <motion.button
            {...buttonBase}
            onClick={onReady}
            className={`flex-[2] py-5 font-black rounded-2xl transition-colors ${
              room.players[userId]?.isReady ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {t.ready}
          </motion.button>
          {userId === room.hostId && (
            <motion.button {...buttonBase} onClick={onStart} className="flex-1 py-5 bg-yellow-400 text-slate-900 font-black rounded-2xl hover:bg-yellow-300 transition-colors">
              {t.startBattle}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
