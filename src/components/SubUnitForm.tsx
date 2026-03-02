import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Trash2, Paperclip, Loader2 } from 'lucide-react';
import { SubUnit, VocabularyItem, TeachingReflection, LearningObjective } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { uploadFile } from '../services/storageService';

interface SubUnitFormProps {
  subUnit?: SubUnit | null;
  onSave: (subUnit: SubUnit) => void;
  onCancel: () => void;
}

const genId = () => Math.random().toString(36).substr(2, 9);

function UrlWithUpload({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-500">{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
          placeholder={placeholder || 'https://...'}
        />
        <label className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 cursor-pointer transition-colors ${uploading ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
          {uploading ? (
            <Loader2 size={18} className="text-indigo-500 animate-spin" />
          ) : (
            <Paperclip size={18} className="text-slate-400" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

const emptyReflection: TeachingReflection = {
  lesson_date: '',
  student_reception: '',
  planned_content: '',
  actual_content: '',
  improvements: '',
};

export const SubUnitForm = ({ subUnit, onSave, onCancel }: SubUnitFormProps) => {
  const emptyLO = (): LearningObjective => ({ id: genId(), objective: '', status: 'not_started', periods: 1 });
  const [title, setTitle] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([emptyLO()]);
  const [periods, setPeriods] = useState(1);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([{ english: '', chinese: '' }]);
  const [classroomExercises, setClassroomExercises] = useState('');
  const [worksheetUrl, setWorksheetUrl] = useState('');
  const [onlinePracticeUrl, setOnlinePracticeUrl] = useState('');
  const [kahootUrl, setKahootUrl] = useState('');
  const [homeworkUrl, setHomeworkUrl] = useState('');
  const [vocabPracticeUrl, setVocabPracticeUrl] = useState('');
  const [homeworkContent, setHomeworkContent] = useState('');
  const [reflection, setReflection] = useState<TeachingReflection>(emptyReflection);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    if (subUnit) {
      setTitle(subUnit.title);
      setLearningObjectives(subUnit.learning_objectives.length > 0 ? subUnit.learning_objectives : [emptyLO()]);
      setPeriods(subUnit.periods);
      setVocabulary(subUnit.vocabulary.length > 0 ? subUnit.vocabulary : [{ english: '', chinese: '' }]);
      setClassroomExercises(subUnit.classroom_exercises);
      setWorksheetUrl(subUnit.worksheet_url || '');
      setOnlinePracticeUrl(subUnit.online_practice_url || '');
      setKahootUrl(subUnit.kahoot_url || '');
      setHomeworkUrl(subUnit.homework_url || '');
      setVocabPracticeUrl(subUnit.vocab_practice_url || '');
      setHomeworkContent(subUnit.homework_content || '');
      setReflection(subUnit.reflection || emptyReflection);
      setAiSummary(subUnit.ai_summary || '');
    }
  }, [subUnit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: subUnit?.id || genId(),
      title,
      learning_objectives: learningObjectives.filter(lo => lo.objective.trim()),
      periods,
      vocabulary: vocabulary.filter(v => v.english.trim() || v.chinese.trim()),
      classroom_exercises: classroomExercises,
      worksheet_url: worksheetUrl || undefined,
      online_practice_url: onlinePracticeUrl || undefined,
      kahoot_url: kahootUrl || undefined,
      homework_url: homeworkUrl || undefined,
      vocab_practice_url: vocabPracticeUrl || undefined,
      homework_content: homeworkContent || undefined,
      reflection: reflection,
      ai_summary: aiSummary || undefined,
    });
  };

  const addLO = () => setLearningObjectives([...learningObjectives, emptyLO()]);
  const updateLO = (i: number, field: keyof LearningObjective, val: string | number) => {
    const arr = [...learningObjectives];
    arr[i] = { ...arr[i], [field]: val };
    setLearningObjectives(arr);
  };
  const removeLO = (i: number) => setLearningObjectives(learningObjectives.filter((_, idx) => idx !== i));

  const addVocab = () => setVocabulary([...vocabulary, { english: '', chinese: '' }]);
  const updateVocab = (i: number, field: keyof VocabularyItem, val: string) => {
    const arr = [...vocabulary];
    arr[i] = { ...arr[i], [field]: val };
    setVocabulary(arr);
  };
  const removeVocab = (i: number) => setVocabulary(vocabulary.filter((_, idx) => idx !== i));

  const updateReflection = (field: keyof TeachingReflection, val: string) => {
    setReflection({ ...reflection, [field]: val });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">
            {subUnit ? '编辑小单元 Edit Sub-Unit' : '添加小单元 Add Sub-Unit'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
          {/* Title & Periods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">小单元名称 Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Linear Equations Introduction"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">课时安排 Periods</label>
              <input
                type="number"
                min={1}
                value={periods}
                onChange={e => setPeriods(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">教学目标 Learning Objectives</label>
              <button type="button" onClick={addLO} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {learningObjectives.map((lo, i) => (
                <div key={lo.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex gap-2">
                    <textarea
                      value={lo.objective}
                      onChange={e => updateLO(i, 'objective', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm resize-none h-16"
                      placeholder={`Learning Objective ${i + 1}`}
                    />
                    <button type="button" onClick={() => removeLO(i)} className="p-2 text-red-400 hover:text-red-600 self-start">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500">Status</label>
                      <select
                        value={lo.status}
                        onChange={e => updateLO(i, 'status', e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-500">Periods</label>
                      <input
                        type="number"
                        min={1}
                        value={lo.periods}
                        onChange={e => updateLO(i, 'periods', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vocabulary */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">双语核心词汇 Vocabulary</label>
              <button type="button" onClick={addVocab} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {vocabulary.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={v.english}
                    onChange={e => updateVocab(i, 'english', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="English"
                  />
                  <input
                    type="text"
                    value={v.chinese}
                    onChange={e => updateVocab(i, 'chinese', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="中文"
                  />
                  <button type="button" onClick={() => removeVocab(i)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Classroom Exercises */}
          <RichTextEditor
            label="课堂讲练 Classroom Exercises"
            value={classroomExercises}
            onChange={setClassroomExercises}
            placeholder="Enter classroom exercises and worked examples..."
          />

          {/* Resource Links */}
          <section className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">资源链接 Resource Links</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UrlWithUpload label="练习单 Worksheet URL" value={worksheetUrl} onChange={setWorksheetUrl} />
              <UrlWithUpload label="线上练习 Online Practice URL" value={onlinePracticeUrl} onChange={setOnlinePracticeUrl} />
              <UrlWithUpload label="Kahoot URL" value={kahootUrl} onChange={setKahootUrl} />
              <UrlWithUpload label="课后作业 Homework URL" value={homeworkUrl} onChange={setHomeworkUrl} />
              <UrlWithUpload label="核心词汇练习 Vocab Practice URL" value={vocabPracticeUrl} onChange={setVocabPracticeUrl} />
            </div>
          </section>

          {/* Homework Content */}
          <RichTextEditor
            label="课后作业说明 Homework Content"
            value={homeworkContent}
            onChange={setHomeworkContent}
            placeholder="Describe homework assignments..."
          />

          {/* Teaching Reflection */}
          <section className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">教学总结及反思 Teaching Reflection</label>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">上课时间 Lesson Date</label>
                <input
                  type="date"
                  value={reflection.lesson_date || ''}
                  onChange={e => updateReflection('lesson_date', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">学生接受状态 Student Reception</label>
                <textarea
                  value={reflection.student_reception || ''}
                  onChange={e => updateReflection('student_reception', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm h-20 resize-none"
                  placeholder="How well did students receive the content?"
                />
              </div>
              <RichTextEditor
                label="计划讲解 Planned Content"
                value={reflection.planned_content || ''}
                onChange={val => updateReflection('planned_content', val)}
                placeholder="What was planned to be taught..."
              />
              <RichTextEditor
                label="实际讲解 Actual Content"
                value={reflection.actual_content || ''}
                onChange={val => updateReflection('actual_content', val)}
                placeholder="What was actually taught..."
              />
              <RichTextEditor
                label="下次改进方向 Improvements"
                value={reflection.improvements || ''}
                onChange={val => updateReflection('improvements', val)}
                placeholder="Areas for improvement next time..."
              />
            </div>
          </section>

          {/* AI Summary */}
          <RichTextEditor
            label="AI总结 AI Summary"
            value={aiSummary}
            onChange={setAiSummary}
            placeholder="AI-generated summary or notes..."
          />
        </form>

        <div className="px-4 sm:px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Save size={20} />
            Save Sub-Unit
          </button>
        </div>
      </div>
    </div>
  );
};
