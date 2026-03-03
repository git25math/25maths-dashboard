import { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, Calendar, BookOpen, FileText, CalendarDays } from 'lucide-react';
import { cn } from '../lib/utils';
import { LessonRecord, ClassProfile } from '../types';

interface LessonRecordsViewProps {
  lessonRecords: LessonRecord[];
  classes: ClassProfile[];
  onAdd: (data: Omit<LessonRecord, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<LessonRecord>) => void;
  onDelete: (id: string) => void;
  onViewInCalendar?: (date: string) => void;
}

export const LessonRecordsView = ({ lessonRecords, classes, onAdd, onUpdate, onDelete, onViewInCalendar }: LessonRecordsViewProps) => {
  const [classFilter, setClassFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<LessonRecord>>({});

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
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdate(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleAdd = () => {
    if (!newForm.class_name.trim() || !newForm.topic.trim()) return;
    onAdd(newForm);
    setNewForm({
      date: new Date().toISOString().split('T')[0],
      class_name: '',
      topic: '',
      progress: '',
      homework_assigned: '',
      notes: '',
      next_lesson_plan: '',
    });
    setIsAdding(false);
  };

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
        <button
          onClick={() => setClassFilter('all')}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
            classFilter === 'all'
              ? "bg-teal-50 border-teal-200 text-teal-600"
              : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
          )}
        >
          All Classes
        </button>
        {classNames.map(name => (
          <button
            key={name}
            onClick={() => setClassFilter(name)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
              classFilter === name
                ? "bg-teal-50 border-teal-200 text-teal-600"
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
            )}
          >
            {name}
          </button>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Progress</label>
              <input
                type="text"
                value={newForm.progress}
                onChange={e => setNewForm({ ...newForm, progress: e.target.value })}
                placeholder="What was covered..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Homework Assigned</label>
              <input
                type="text"
                value={newForm.homework_assigned}
                onChange={e => setNewForm({ ...newForm, homework_assigned: e.target.value })}
                placeholder="Homework details..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={newForm.notes}
                onChange={e => setNewForm({ ...newForm, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Next Lesson Plan</label>
              <textarea
                value={newForm.next_lesson_plan}
                onChange={e => setNewForm({ ...newForm, next_lesson_plan: e.target.value })}
                placeholder="Plan for next lesson..."
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
              />
            </div>
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
      <div className="space-y-4">
        {sorted.map(record => (
          <div key={record.id} className="glass-card p-5 group relative">
            {/* Action buttons */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
              {editingId !== record.id && (
                <>
                  {onViewInCalendar && (
                    <button
                      onClick={() => onViewInCalendar(record.date)}
                      className="text-slate-300 hover:text-teal-500 transition-colors"
                      title="View in Calendar"
                    >
                      <CalendarDays size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(record)}
                    className="text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this lesson record?')) onDelete(record.id); }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>

            {editingId === record.id ? (
              /* Inline edit form */
              <div className="space-y-4">
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
                    <label className="block text-xs font-medium text-slate-500 mb-1">Progress</label>
                    <input
                      type="text"
                      value={editForm.progress || ''}
                      onChange={e => setEditForm({ ...editForm, progress: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Homework Assigned</label>
                    <input
                      type="text"
                      value={editForm.homework_assigned || ''}
                      onChange={e => setEditForm({ ...editForm, homework_assigned: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                    <textarea
                      value={editForm.notes || ''}
                      onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Next Lesson Plan</label>
                    <textarea
                      value={editForm.next_lesson_plan || ''}
                      onChange={e => setEditForm({ ...editForm, next_lesson_plan: e.target.value })}
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                    />
                  </div>
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
              /* Display mode */
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-teal-50 text-teal-600">
                    {record.class_name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar size={12} /> {record.date}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-teal-500" />
                  {record.topic || 'No topic'}
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {record.progress && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Progress</span>
                      <p className="text-slate-600">{record.progress}</p>
                    </div>
                  )}
                  {record.homework_assigned && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Homework</span>
                      <p className="text-slate-600">{record.homework_assigned}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div className="md:col-span-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Notes</span>
                      <p className="text-slate-600">{record.notes}</p>
                    </div>
                  )}
                  {record.next_lesson_plan && (
                    <div className="md:col-span-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">Next Lesson Plan</span>
                      <p className="text-slate-600">{record.next_lesson_plan}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
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
