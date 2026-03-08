import { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { MeetingRecord, Task } from '../types';
import { FilterChip } from '../components/FilterChip';
import { CATEGORIES } from './meetings/constants';
import { MeetingCard } from './meetings/MeetingCard';
import { NewMeetingForm } from './meetings/NewMeetingForm';
import { MeetingDetail } from './meetings/MeetingDetail';

type CategoryFilter = 'all' | MeetingRecord['category'];
type ViewMode = 'list' | 'detail' | 'new';

interface MeetingsViewProps {
  meetings: MeetingRecord[];
  onAddMeeting: (data: Omit<MeetingRecord, 'id'>) => Promise<MeetingRecord>;
  onUpdateMeeting: (id: string, updates: Partial<MeetingRecord>) => Promise<unknown>;
  onDeleteMeeting: (id: string) => void;
  onAddTask?: (data: Omit<Task, 'id' | 'created_at'>) => void;
  tasks?: Task[];
  onCycleTaskStatus?: (id: string) => void;
  onAddSOP?: (data: { title: string; category: string; content: string }) => void;
}

export const MeetingsView = ({ meetings, onAddMeeting, onUpdateMeeting, onDeleteMeeting, onAddTask, tasks, onCycleTaskStatus, onAddSOP }: MeetingsViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState<MeetingRecord['category']>('flag-raising');
  const [newParticipants, setNewParticipants] = useState('');

  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MeetingRecord['category']>('flag-raising');
  const [editParticipants, setEditParticipants] = useState('');

  const filteredMeetings = useMemo(
    () => categoryFilter === 'all'
      ? meetings
      : meetings.filter(m => m.category === categoryFilter),
    [meetings, categoryFilter],
  );

  const sortedMeetings = useMemo(
    () => [...filteredMeetings].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [filteredMeetings],
  );

  const openDetail = (meeting: MeetingRecord) => {
    setSelectedMeeting(meeting);
    setViewMode('detail');
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const created = await onAddMeeting({
      title: newTitle.trim(),
      date: newDate,
      duration: 0,
      transcript: '',
      ai_summary: null,
      category: newCategory,
      participants: newParticipants.split(',').map(p => p.trim()).filter(Boolean),
      status: 'draft',
      created_at: new Date().toISOString(),
    });
    setSelectedMeeting(created);
    setViewMode('detail');
    setNewTitle('');
    setNewParticipants('');
  };

  const startEdit = (meeting: MeetingRecord) => {
    setEditingId(meeting.id);
    setEditTitle(meeting.title);
    setEditCategory(meeting.category);
    setEditParticipants(meeting.participants.join(', '));
  };

  const saveEdit = async (id: string) => {
    await onUpdateMeeting(id, {
      title: editTitle.trim(),
      category: editCategory,
      participants: editParticipants.split(',').map(p => p.trim()).filter(Boolean),
    });
    setEditingId(null);
  };

  useEffect(() => {
    if (selectedMeeting) {
      const updated = meetings.find(m => m.id === selectedMeeting.id);
      if (updated) setSelectedMeeting(updated);
    }
  }, [meetings, selectedMeeting?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Meeting Records</h2>
          <button onClick={() => setViewMode('new')} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={18} /> New Meeting
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', ...CATEGORIES.map(c => c.value)] as const).map(filter => (
            <FilterChip
              key={filter}
              onClick={() => setCategoryFilter(filter as CategoryFilter)}
              active={categoryFilter === filter}
            >
              {filter === 'all' ? 'All' : CATEGORIES.find(c => c.value === filter)?.label}
            </FilterChip>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMeetings.map(meeting => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              isEditing={editingId === meeting.id}
              editTitle={editTitle}
              editCategory={editCategory}
              editParticipants={editParticipants}
              onEditTitleChange={setEditTitle}
              onEditCategoryChange={setEditCategory}
              onEditParticipantsChange={setEditParticipants}
              onStartEdit={() => startEdit(meeting)}
              onSaveEdit={() => saveEdit(meeting.id)}
              onCancelEdit={() => setEditingId(null)}
              onDelete={() => onDeleteMeeting(meeting.id)}
              onOpen={() => openDetail(meeting)}
            />
          ))}
        </div>
        {sortedMeetings.length === 0 && (
          <div className="glass-card p-12 text-center text-slate-400">
            {categoryFilter === 'all' ? 'No meetings yet. Click "New Meeting" to create one.' : `No ${categoryFilter} meetings found.`}
          </div>
        )}
      </div>
    );
  }

  if (viewMode === 'new') {
    return (
      <NewMeetingForm
        newTitle={newTitle}
        newDate={newDate}
        newCategory={newCategory}
        newParticipants={newParticipants}
        onTitleChange={setNewTitle}
        onDateChange={setNewDate}
        onCategoryChange={setNewCategory}
        onParticipantsChange={setNewParticipants}
        onCreate={handleCreate}
        onBack={() => setViewMode('list')}
      />
    );
  }

  if (viewMode === 'detail' && selectedMeeting) {
    return (
      <MeetingDetail
        meeting={selectedMeeting}
        onBack={() => { setViewMode('list'); setSelectedMeeting(null); }}
        onUpdate={(updates) => onUpdateMeeting(selectedMeeting.id, updates)}
        onAddTask={onAddTask}
        tasks={tasks}
        onCycleTaskStatus={onCycleTaskStatus}
        onAddSOP={onAddSOP}
      />
    );
  }

  return null;
};
