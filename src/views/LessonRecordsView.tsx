import { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, Calendar, BookOpen, FileText, CalendarDays, Award, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { LessonRecord, ClassProfile, Student, HousePointAward } from '../types';
import { FilterChip } from '../components/FilterChip';
import { RichTextEditor, MarkdownRenderer } from '../components/RichTextEditor';
import { HousePointAwardsEditor } from '../components/HousePointAwardsEditor';

interface LessonRecordsViewProps {
  lessonRecords: LessonRecord[];
  classes: ClassProfile[];
  students: Student[];
  onAdd: (data: Omit<LessonRecord, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<LessonRecord>) => void;
  onDelete: (id: string) => void;
  onViewInCalendar?: (date: string) => void;
}

export const LessonRecordsView = ({ lessonRecords, classes, students, onAdd, onUpdate, onDelete, onViewInCalendar }: LessonRecordsViewProps) => {
  const [classFilter, setClassFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<LessonRecord>>({});
  const [editAwards, setEditAwards] = useState<HousePointAward[]>([]);

  // New record awards state
  const [newAwards, setNewAwards] = useState<HousePointAward[]>([]);

  // New record form state
  const [newForm, setNewForm] = useState<Omit<LessonRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    class_name: '',
    topic: '',
    progress: '',
    homework_assigned: '',
    notes: '',
    next_lesson_plan: '',
  });

  // Get unique class names from records + classes
  const classNames = Array.from(new Set([
    ...classes.map(c => c.name),
    ...lessonRecords.map(r => r.class_name),
  ])).sort();

  const filtered = classFilter === 'all'
    ? lessonRecords
    : lessonRecords.filter(r => r.class_name === classFilter);

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const startEdit = (record: LessonRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
    setEditAwards(record.house_point_awards || []);
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdate(editingId, { ...editForm, house_point_awards: editAwards });
      setEditingId(null);
      setEditForm({});
      setEditAwards([]);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditAwards([]);
  };

  const handleAdd = () => {
    if (!newForm.class_name.trim() || !newForm.topic.trim()) return;
    onAdd({ ...newForm, house_point_awards: newAwards });
    setNewForm({
      date: new Date().toISOString().split('T')[0],
      class_name: '',
      topic: '',
      progress: '',
      homework_assigned: '',
      notes: '',
      next_lesson_plan: '',
    });
    setNewAwards([]);
    setIsAdding(false);
  };

  // Students filtered by selected class for the new form
  const newFormStudents = newForm.class_name
    ? students.filter(s => s.class_name === newForm.class_name)
    : [];

  // Students filtered by selected class for the edit form
  const editFormStudents = editForm.class_name
    ? students.filter(s => s.class_name === editForm.class_name)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
            <FileText size={22} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Lesson Records</h2>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={18} /> New Record
        </button>
      </div>

      {/* Class filter tabs */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          onClick={() => setClassFilter('all')}
          active={classFilter === 'all'}
          tone="teal"
        >
          All Classes
        </FilterChip>
        {classNames.map(name => (
          <FilterChip
            key={name}
            onClick={() => setClassFilter(name)}
            active={classFilter === name}
            tone="teal"
          >
            {name}
          </FilterChip>
        ))}
      </div>

      {/* New record form */}
      {isAdding && (
        <div className="glass-card p-6 space-y-4 border-2 border-teal-200">
          <h3 className="font-bold text-slate-900">New Lesson Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={newForm.date}
                onChange={e => setNewForm({ ...newForm, date: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select
                value={newForm.class_name}
                onChange={e => setNewForm({ ...newForm, class_name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              >
                <option value="">Select class...</option>
                {classNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={newForm.topic}
                onChange={e => setNewForm({ ...newForm, topic: e.target.value })}
                placeholder="Lesson topic..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <RichTextEditor
                label="Progress"
                value={newForm.progress}
                onChange={val => setNewForm({ ...newForm, progress: val })}
                placeholder="What was covered... Supports Markdown and LaTeX..."
                editorHeightClass="h-24"
                previewMinHeightClass="min-h-[6rem]"
              />
            </div>
            <div>
              <RichTextEditor
                label="Homework Assigned"
                value={newForm.homework_assigned}
                onChange={val => setNewForm({ ...newForm, homework_assigned: val })}
                placeholder="Homework details... Supports Markdown and LaTeX..."
                editorHeightClass="h-24"
                previewMinHeightClass="min-h-[6rem]"
              />
            </div>
            <div className="md:col-span-2">
              <RichTextEditor
                label="Notes"
                value={newForm.notes}
                onChange={val => setNewForm({ ...newForm, notes: val })}
                placeholder="Additional notes (supports Markdown and LaTeX)..."
              />
            </div>
            <div className="md:col-span-2">
              <RichTextEditor
                label="Next Lesson Plan"
                value={newForm.next_lesson_plan}
                onChange={val => setNewForm({ ...newForm, next_lesson_plan: val })}
                placeholder="Plan for next lesson (supports Markdown and LaTeX)..."
              />
            </div>
            {newForm.class_name && newFormStudents.length > 0 && (
              <div className="md:col-span-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <HousePointAwardsEditor
                  awards={newAwards}
                  onChange={setNewAwards}
                  students={newFormStudents}
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAdd}
              disabled={!newForm.class_name.trim() || !newForm.topic.trim()}
              className="btn-primary text-sm px-6 py-2.5 disabled:opacity-40"
            >
              Create Record
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="text-sm text-slate-400 hover:text-slate-600 px-4 py-2.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Records list */}
      <div className="space-y-2">
        {sorted.map(record => {
          const isExpanded = expandedId === record.id;
          const isEditing = editingId === record.id;
          const hasDetails = record.progress || record.homework_assigned || record.notes || record.next_lesson_plan || (record.house_point_awards && record.house_point_awards.length > 0);
          return (
            <div key={record.id} className="glass-card group relative">
              {isEditing ? (
                /* Inline edit form */
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date || ''}
                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Class</label>
                      <select
                        value={editForm.class_name || ''}
                        onChange={e => setEditForm({ ...editForm, class_name: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      >
                        {classNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Topic</label>
                      <input
                        type="text"
                        value={editForm.topic || ''}
                        onChange={e => setEditForm({ ...editForm, topic: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <RichTextEditor
                        label="Progress"
                        value={editForm.progress || ''}
                        onChange={val => setEditForm({ ...editForm, progress: val })}
                        placeholder="What was covered... Supports Markdown and LaTeX..."
                        editorHeightClass="h-24"
                        previewMinHeightClass="min-h-[6rem]"
                      />
                    </div>
                    <div>
                      <RichTextEditor
                        label="Homework Assigned"
                        value={editForm.homework_assigned || ''}
                        onChange={val => setEditForm({ ...editForm, homework_assigned: val })}
                        placeholder="Homework details... Supports Markdown and LaTeX..."
                        editorHeightClass="h-24"
                        previewMinHeightClass="min-h-[6rem]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <RichTextEditor
                        label="Notes"
                        value={editForm.notes || ''}
                        onChange={val => setEditForm({ ...editForm, notes: val })}
                        placeholder="Additional notes (supports Markdown and LaTeX)..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <RichTextEditor
                        label="Next Lesson Plan"
                        value={editForm.next_lesson_plan || ''}
                        onChange={val => setEditForm({ ...editForm, next_lesson_plan: val })}
                        placeholder="Plan for next lesson (supports Markdown and LaTeX)..."
                      />
                    </div>
                    {editFormStudents.length > 0 && (
                      <div className="md:col-span-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                        <HousePointAwardsEditor
                          awards={editAwards}
                          onChange={setEditAwards}
                          students={editFormStudents}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1">
                      <Save size={12} /> Save
                    </button>
                    <button onClick={cancelEdit} className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Collapsed row — always visible */}
                  <div
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  >
                    <span className="text-sm text-slate-400 font-mono w-[90px] shrink-0">{record.date}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-teal-50 text-teal-600 shrink-0">
                      {record.class_name}
                    </span>
                    <span className="font-medium text-slate-900 flex-1 truncate">{record.topic || 'No topic'}</span>
                    {record.house_point_awards && record.house_point_awards.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-500 shrink-0">
                        <Award size={12} />
                      </span>
                    )}
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0" onClick={e => e.stopPropagation()}>
                      {onViewInCalendar && (
                        <button
                          onClick={() => onViewInCalendar(record.date)}
                          className="p-1 text-slate-300 hover:text-teal-500 transition-colors"
                          title="View in Calendar"
                        >
                          <CalendarDays size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(record)}
                        className="p-1 text-slate-300 hover:text-indigo-500 transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this lesson record?')) onDelete(record.id); }}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <ChevronDown size={16} className={cn(
                      "text-slate-300 transition-transform shrink-0",
                      isExpanded && "rotate-180"
                    )} />
                  </div>

                  {/* Expanded details */}
                  {isExpanded && hasDetails && (
                    <div className="px-5 pb-4 pt-1 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
                        {record.progress && (
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Progress</span>
                            <MarkdownRenderer content={record.progress} className="text-sm text-slate-600" />
                          </div>
                        )}
                        {record.homework_assigned && (
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">Homework</span>
                            <MarkdownRenderer content={record.homework_assigned} className="text-sm text-slate-600" />
                          </div>
                        )}
                        {record.notes && (
                          <div className="md:col-span-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Notes</span>
                            <MarkdownRenderer content={record.notes} className="text-sm text-slate-600" />
                          </div>
                        )}
                        {record.next_lesson_plan && (
                          <div className="md:col-span-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Next Lesson Plan</span>
                            <MarkdownRenderer content={record.next_lesson_plan} className="text-sm text-slate-600" />
                          </div>
                        )}
                        {record.house_point_awards && record.house_point_awards.length > 0 && (
                          <div className="md:col-span-2">
                            <span className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1">
                              <Award size={12} /> House Points
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {record.house_point_awards.map(a => (
                                <span
                                  key={a.student_id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100"
                                >
                                  {a.student_name} +{a.points}
                                  {a.reason && <span className="text-emerald-400">({a.reason})</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          {classFilter === 'all'
            ? 'No lesson records yet. Records are created automatically when you save a lesson in the timetable, or click "New Record" to add one manually.'
            : `No lesson records for ${classFilter}.`}
        </div>
      )}
    </div>
  );
};
