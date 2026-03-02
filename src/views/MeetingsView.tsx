import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, ArrowLeft, Mic, Square, Pause, Play, RefreshCw, ChevronDown, ChevronUp, Users, Calendar, Tag, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { MeetingRecord, AISummary } from '../types';
import { geminiService } from '../services/geminiService';

type CategoryFilter = 'all' | MeetingRecord['category'];
type ViewMode = 'list' | 'detail' | 'new';

const CATEGORIES: { value: MeetingRecord['category']; label: string }[] = [
  { value: 'department', label: 'Department' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'parent', label: 'Parent' },
  { value: 'staff', label: 'Staff' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<MeetingRecord['status'], string> = {
  draft: 'bg-slate-100 text-slate-600',
  transcribing: 'bg-amber-50 text-amber-600',
  summarizing: 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-600',
};

const CATEGORY_COLORS: Record<MeetingRecord['category'], string> = {
  department: 'bg-indigo-50 text-indigo-600',
  tutor: 'bg-emerald-50 text-emerald-600',
  parent: 'bg-amber-50 text-amber-600',
  staff: 'bg-purple-50 text-purple-600',
  other: 'bg-slate-100 text-slate-500',
};

interface MeetingsViewProps {
  meetings: MeetingRecord[];
  onAddMeeting: (data: Omit<MeetingRecord, 'id'>) => Promise<MeetingRecord>;
  onUpdateMeeting: (id: string, updates: Partial<MeetingRecord>) => void;
  onDeleteMeeting: (id: string) => void;
}

export const MeetingsView = ({ meetings, onAddMeeting, onUpdateMeeting, onDeleteMeeting }: MeetingsViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New meeting form
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newCategory, setNewCategory] = useState<MeetingRecord['category']>('department');
  const [newParticipants, setNewParticipants] = useState('');

  // Editing fields
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<MeetingRecord['category']>('department');
  const [editParticipants, setEditParticipants] = useState('');

  const filteredMeetings = categoryFilter === 'all'
    ? meetings
    : meetings.filter(m => m.category === categoryFilter);

  const sortedMeetings = [...filteredMeetings].sort((a, b) => b.created_at.localeCompare(a.created_at));

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

  const saveEdit = (id: string) => {
    onUpdateMeeting(id, {
      title: editTitle.trim(),
      category: editCategory,
      participants: editParticipants.split(',').map(p => p.trim()).filter(Boolean),
    });
    setEditingId(null);
  };

  // Keep selectedMeeting in sync with meetings array
  useEffect(() => {
    if (selectedMeeting) {
      const updated = meetings.find(m => m.id === selectedMeeting.id);
      if (updated) setSelectedMeeting(updated);
    }
  }, [meetings, selectedMeeting?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- List View ---
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
            <button
              key={filter}
              onClick={() => setCategoryFilter(filter as CategoryFilter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                categoryFilter === filter
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
              )}
            >
              {filter === 'all' ? 'All' : CATEGORIES.find(c => c.value === filter)?.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMeetings.map(meeting => (
            <div
              key={meeting.id}
              className="glass-card p-5 hover:shadow-md transition-shadow group relative cursor-pointer"
              onClick={() => editingId !== meeting.id && openDetail(meeting)}
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                <button
                  onClick={(e) => { e.stopPropagation(); startEdit(meeting); }}
                  className="text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Delete this meeting?')) onDeleteMeeting(meeting.id); }}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {editingId === meeting.id ? (
                <div className="space-y-3" onClick={e => e.stopPropagation()}>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-sm" />
                  <select value={editCategory} onChange={e => setEditCategory(e.target.value as MeetingRecord['category'])} className="w-full border rounded-lg px-3 py-1.5 text-sm">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <input value={editParticipants} onChange={e => setEditParticipants(e.target.value)} placeholder="Participants (comma-separated)" className="w-full border rounded-lg px-3 py-1.5 text-sm" />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(meeting.id)} className="btn-primary text-xs px-3 py-1">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", CATEGORY_COLORS[meeting.category])}>
                      {meeting.category}
                    </span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", STATUS_COLORS[meeting.status])}>
                      {meeting.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">{meeting.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {meeting.date}</span>
                    {meeting.duration > 0 && <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(meeting.duration)}</span>}
                    {meeting.participants.length > 0 && <span className="flex items-center gap-1"><Users size={12} /> {meeting.participants.length}</span>}
                  </div>
                </>
              )}
            </div>
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

  // --- New Meeting Form ---
  if (viewMode === 'new') {
    return (
      <div className="space-y-6">
        <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to Meetings
        </button>
        <h2 className="text-2xl font-bold text-slate-900">New Meeting</h2>
        <div className="glass-card p-6 space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Meeting title..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value as MeetingRecord['category'])} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Participants (comma-separated)</label>
            <input value={newParticipants} onChange={e => setNewParticipants(e.target.value)} placeholder="Alice, Bob, Charlie" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreate} disabled={!newTitle.trim()} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-40">Create Meeting</button>
            <button onClick={() => setViewMode('list')} className="text-sm text-slate-400 hover:text-slate-600 px-4 py-2.5">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  // --- Detail View ---
  if (viewMode === 'detail' && selectedMeeting) {
    return (
      <MeetingDetail
        meeting={selectedMeeting}
        onBack={() => { setViewMode('list'); setSelectedMeeting(null); }}
        onUpdate={(updates) => onUpdateMeeting(selectedMeeting.id, updates)}
      />
    );
  }

  return null;
};

// --- Meeting Detail Component ---

interface MeetingDetailProps {
  meeting: MeetingRecord;
  onBack: () => void;
  onUpdate: (updates: Partial<MeetingRecord>) => void;
}

function MeetingDetail({ meeting, onBack, onUpdate }: MeetingDetailProps) {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Processing state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Collapsible sections
  const [showTranscript, setShowTranscript] = useState(true);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(1000); // collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<Blob>((resolve) => {
      mediaRecorderRef.current!.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        resolve(blob);
      };
      mediaRecorderRef.current!.stop();
      mediaRecorderRef.current!.stream.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    });
  }, []);

  const handleStopAndProcess = useCallback(async () => {
    setError(null);
    const audioBlob = await stopRecording();
    if (!audioBlob || audioBlob.size === 0) return;

    // Save duration
    onUpdate({ duration: recordingTime, status: 'transcribing' });

    // Transcribe
    setIsTranscribing(true);
    try {
      const transcript = await geminiService.transcribeAudio(audioBlob);
      onUpdate({ transcript, status: 'summarizing' });
      setIsTranscribing(false);

      // Generate summary
      setIsSummarizing(true);
      try {
        const summary = await geminiService.generateMeetingSummary(transcript);
        onUpdate({ ai_summary: summary, status: 'completed' });
      } catch (err) {
        setError('Failed to generate summary. You can retry with the button below.');
        onUpdate({ status: 'draft' });
      }
      setIsSummarizing(false);
    } catch (err) {
      setError('Failed to transcribe audio. Please try recording again.');
      onUpdate({ status: 'draft' });
      setIsTranscribing(false);
    }
  }, [stopRecording, recordingTime, onUpdate]);

  const handleRegenerateSummary = useCallback(async () => {
    if (!meeting.transcript) return;
    setError(null);
    setIsSummarizing(true);
    onUpdate({ status: 'summarizing' });
    try {
      const summary = await geminiService.generateMeetingSummary(meeting.transcript);
      onUpdate({ ai_summary: summary, status: 'completed' });
    } catch (err) {
      setError('Failed to generate summary.');
      onUpdate({ status: 'draft' });
    }
    setIsSummarizing(false);
  }, [meeting.transcript, onUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Back to Meetings
      </button>

      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", CATEGORY_COLORS[meeting.category])}>
            {meeting.category}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded", STATUS_COLORS[meeting.status])}>
            {meeting.status}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{meeting.title}</h2>
        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
          <span className="flex items-center gap-1"><Calendar size={14} /> {meeting.date}</span>
          {meeting.duration > 0 && <span className="flex items-center gap-1"><Clock size={14} /> {formatDuration(meeting.duration)}</span>}
          {meeting.participants.length > 0 && (
            <span className="flex items-center gap-1"><Users size={14} /> {meeting.participants.join(', ')}</span>
          )}
        </div>
      </div>

      {/* Recording */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-slate-900 mb-4">Recording</h3>
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <button onClick={startRecording} disabled={isTranscribing || isSummarizing} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-40">
              <Mic size={18} /> Start Recording
            </button>
          ) : (
            <>
              <button onClick={pauseRecording} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-medium text-sm hover:bg-amber-600 transition-colors">
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button onClick={handleStopAndProcess} className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors">
                <Square size={18} /> Stop & Process
              </button>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isPaused ? "bg-amber-400" : "bg-red-400")} />
                  <span className={cn("relative inline-flex rounded-full h-3 w-3", isPaused ? "bg-amber-500" : "bg-red-500")} />
                </span>
                <span className="font-mono text-sm text-slate-600">{formatDuration(recordingTime)}</span>
              </div>
            </>
          )}
        </div>
        {(isTranscribing || isSummarizing) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-indigo-600">
            <Loader2 size={16} className="animate-spin" />
            {isTranscribing ? 'Transcribing audio...' : 'Generating meeting summary...'}
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      {/* Transcript */}
      {meeting.transcript && (
        <div className="glass-card p-6">
          <button onClick={() => setShowTranscript(!showTranscript)} className="flex items-center justify-between w-full">
            <h3 className="font-bold text-slate-900">Transcript</h3>
            {showTranscript ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>
          {showTranscript && (
            <p className="mt-4 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{meeting.transcript}</p>
          )}
        </div>
      )}

      {/* AI Summary */}
      {meeting.ai_summary && (
        <AISummaryPanel summary={meeting.ai_summary} onRegenerate={handleRegenerateSummary} isRegenerating={isSummarizing} />
      )}

      {/* Regenerate button when transcript exists but no summary */}
      {meeting.transcript && !meeting.ai_summary && !isSummarizing && (
        <button onClick={handleRegenerateSummary} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
          <RefreshCw size={16} /> Generate Summary
        </button>
      )}
    </div>
  );
}

// --- AI Summary Panel ---

function AISummaryPanel({ summary, onRegenerate, isRegenerating }: { summary: AISummary; onRegenerate: () => void; isRegenerating: boolean }) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900">Summary</h3>
          <button onClick={onRegenerate} disabled={isRegenerating} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-40">
            <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} /> Regenerate
          </button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{summary.summary}</p>
      </div>

      {/* Key Points */}
      {summary.key_points.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">Key Points</h3>
          <ul className="space-y-2">
            {summary.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items */}
      {summary.action_items.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">Action Items</h3>
          <div className="space-y-3">
            {summary.action_items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <Tag size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.content}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    {item.assignee && <span>Assignee: {item.assignee}</span>}
                    {item.deadline && <span>Deadline: {item.deadline}</span>}
                    <span className={cn("px-1.5 py-0.5 rounded font-medium", item.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decisions */}
      {summary.decisions.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">Decisions</h3>
          <ul className="space-y-2">
            {summary.decisions.map((decision, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <AlertCircle size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                {decision}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Helpers ---

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
