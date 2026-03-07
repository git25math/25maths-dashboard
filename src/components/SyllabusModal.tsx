import { useState } from 'react';
import { X, CheckCircle2, Plus, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { SYLLABUS } from '../constants';
import { TeachingUnit } from '../types';
import { isTeachingUnitSyllabusMatch } from '../lib/teachingUnitOrder';

interface SyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachingUnits: TeachingUnit[];
  onNavigateToUnit: (unitId: string) => void;
  onCreateUnit: (yearGroup: string, title: string) => void;
}

function matchSyllabusEntry(entry: string, units: TeachingUnit[], yearGroup: string): TeachingUnit | undefined {
  return units.find(u => u.year_group === yearGroup && isTeachingUnitSyllabusMatch(entry, u));
}

export const SyllabusModal = ({ isOpen, onClose, teachingUnits, onNavigateToUnit, onCreateUnit }: SyllabusModalProps) => {
  const [selectedYear, setSelectedYear] = useState<string>('Year 7');

  const yearEntries = SYLLABUS[selectedYear] || [];

  // Compute coverage for each entry
  const entryCoverage = yearEntries.map(entry => ({
    entry,
    matchedUnit: matchSyllabusEntry(entry, teachingUnits, selectedYear),
  }));

  const coveredCount = entryCoverage.filter(e => e.matchedUnit).length;
  const totalEntries = yearEntries.length;
  const coveragePct = totalEntries > 0 ? Math.round((coveredCount / totalEntries) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Curriculum Syllabus</h3>
                <p className="text-sm text-slate-500">Browse units by year group &middot; Click to navigate or create</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-48 border-r border-slate-100 bg-slate-50/30 p-4 space-y-2">
                {Object.keys(SYLLABUS).map(year => {
                  const yEntries = SYLLABUS[year] || [];
                  const yCovered = yEntries.filter(e => matchSyllabusEntry(e, teachingUnits, year)).length;
                  return (
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
                      <div className="flex justify-between items-center">
                        <span>{year}</span>
                        <span className={cn(
                          "text-[10px] font-bold",
                          selectedYear === year ? "text-indigo-200" : "text-slate-400"
                        )}>
                          {yCovered}/{yEntries.length}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {/* Coverage summary bar */}
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>{coveredCount}/{totalEntries} units covered</span>
                      <span>{coveragePct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${coveragePct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entryCoverage.map(({ entry, matchedUnit }, index) => {
                    const topicName = entry.split(': ')[1] || entry;
                    const isCovered = !!matchedUnit;

                    if (isCovered) {
                      // Compute progress for the matched unit
                      const allLOs = matchedUnit!.sub_units.flatMap(su => su.learning_objectives);
                      const totalLOs = allLOs.length;
                      const completedLOs = allLOs.filter(lo => lo.status === 'completed').length;
                      const pct = totalLOs > 0 ? Math.round((completedLOs / totalLOs) * 100) : 0;
                      const subCount = matchedUnit!.sub_units.length;

                      return (
                        <motion.div
                          key={entry}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => {
                            onNavigateToUnit(matchedUnit!.id);
                            onClose();
                          }}
                          className="p-4 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl shadow-sm hover:border-emerald-400 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
                                {topicName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-emerald-600">
                                  {pct}% complete &middot; {subCount} sub-units
                                </span>
                              </div>
                              {totalLOs > 0 && (
                                <div className="w-full h-1 bg-emerald-200 rounded-full overflow-hidden mt-2">
                                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                                </div>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-emerald-300 group-hover:text-emerald-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </motion.div>
                      );
                    }

                    // Not covered — click to create
                    return (
                      <motion.div
                        key={entry}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => {
                          onCreateUnit(selectedYear, topicName);
                          onClose();
                        }}
                        className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                              {topicName}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 group-hover:text-indigo-500 transition-colors">
                              Click to create unit
                            </p>
                          </div>
                          <Plus size={16} className="text-slate-300 group-hover:text-indigo-500 shrink-0 mt-1" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
