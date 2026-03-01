import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { SYLLABUS } from '../constants';

export const SyllabusModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [selectedYear, setSelectedYear] = useState<string>('Year 7');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Curriculum Syllabus</h3>
                <p className="text-sm text-slate-500">Browse units by year group</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-48 border-r border-slate-100 bg-slate-50/30 p-4 space-y-2">
                {Object.keys(SYLLABUS).map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      selectedYear === year
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SYLLABUS[selectedYear].map((unit, index) => (
                    <motion.div
                      key={unit}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                          {unit.split(': ')[1] || unit}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
