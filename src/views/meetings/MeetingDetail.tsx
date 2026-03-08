import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Mic, Square, Pause, Play, RefreshCw, ChevronDown, ChevronUp, Calendar, Clock, Users, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { MeetingRecord, Task } from '../../types';
import { geminiService } from '../../services/geminiService';
import { TipTapEditor } from '../../components/TipTapEditor';
import { ensureHtml, stripHtml } from '../../lib/htmlUtils';
import { CATEGORY_COLORS, STATUS_COLORS, formatDuration } from './constants';
import { AISummaryPanel } from './AISummaryPanel';
import { RelatedTasksPanel } from './RelatedTasksPanel';

interface MeetingDetailProps {
  meeting: MeetingRecord;
  onBack: () => void;
  onUpdate: (updates: Partial<MeetingRecord>) => Promise<unknown>;
  onAddTask?: (data: Omit<Task, 'id' | 'created_at'>) => void;
  tasks?: Task[];
  onCycleTaskStatus?: (id: string) => void;
  onAddSOP?: (data: { title: string; category: string; content: string }) => void;
}

export function MeetingDetail({ meeting, onBack, onUpdate, onAddTask, tasks, onCycleTaskStatus, onAddSOP }: MeetingDetailProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showTranscript, setShowTranscript] = useState(true);

  const relatedTasks = useMemo(
    () => (tasks || []).filter(t => t.source_type === 'meeting' && t.source_id === meeting.id),
    [tasks, meeting.id],
  );

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

      mediaRecorder.start(1000);
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
        mediaRecorderRef.current!.stream.getTracks().forEach(t => t.stop());
        resolve(blob);
      };
      mediaRecorderRef.current!.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    });
  }, []);

  const handleStopAndProcess = useCallback(async () => {
    setError(null);
    const audioBlob = await stopRecording();
    if (!audioBlob || audioBlob.size === 0) return;

    setIsTranscribing(true);
    await onUpdate({ duration: recordingTime, status: 'transcribing' });

    try {
      const rawTranscript = await geminiService.transcribeAudio(audioBlob);
      await onUpdate({ transcript: ensureHtml(rawTranscript), status: 'summarizing' });
      setIsTranscribing(false);

      setIsSummarizing(true);
      try {
        const summary = await geminiService.generateMeetingSummary(rawTranscript);
        await onUpdate({ ai_summary: summary, status: 'completed' });
        if (onAddTask) {
          onAddTask({ title: `整理录音稿: ${meeting.title}`, status: 'inbox', priority: 'medium', source_type: 'meeting', source_id: meeting.id });
          onAddTask({ title: `Review action items: ${meeting.title}`, status: 'inbox', priority: 'medium', source_type: 'meeting', source_id: meeting.id });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Failed to generate summary: ${msg}`);
        await onUpdate({ status: 'draft' });
      }
      setIsSummarizing(false);
    } catch (err) {
      console.error('Transcription failed:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to transcribe audio: ${msg}`);
      await onUpdate({ status: 'draft' });
      setIsTranscribing(false);
    }
  }, [stopRecording, recordingTime, onUpdate, onAddTask, meeting.id, meeting.title]);

  const handleRegenerateSummary = useCallback(async () => {
    if (!meeting.transcript) return;
    setError(null);
    setIsSummarizing(true);
    await onUpdate({ status: 'summarizing' });
    try {
      const plainText = stripHtml(meeting.transcript);
      const summary = await geminiService.generateMeetingSummary(plainText);
      await onUpdate({ ai_summary: summary, status: 'completed' });
    } catch (err) {
      setError('Failed to generate summary.');
      await onUpdate({ status: 'draft' });
    }
    setIsSummarizing(false);
  }, [meeting.transcript, onUpdate]);

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

      {meeting.transcript && (
        <div className="glass-card p-6">
          <button onClick={() => setShowTranscript(!showTranscript)} className="flex items-center justify-between w-full">
            <h3 className="font-bold text-slate-900">Transcript</h3>
            {showTranscript ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>
          {showTranscript && (
            <div className="mt-4">
              <TipTapEditor
                content={meeting.transcript}
                onUpdate={(html) => { void onUpdate({ transcript: html }); }}
                editable={meeting.status !== 'transcribing' && meeting.status !== 'summarizing'}
                placeholder="Transcript will appear here..."
                debounceMs={1000}
              />
            </div>
          )}
        </div>
      )}

      {meeting.ai_summary && (
        <AISummaryPanel
          summary={meeting.ai_summary}
          onRegenerate={handleRegenerateSummary}
          isRegenerating={isSummarizing}
          onAddTask={onAddTask}
          meetingId={meeting.id}
          meetingTitle={meeting.title}
          meetingDate={meeting.date}
          meetingCategory={meeting.category}
          participants={meeting.participants}
          onAddSOP={onAddSOP}
        />
      )}

      {relatedTasks.length > 0 && (
        <RelatedTasksPanel tasks={relatedTasks} onCycleTaskStatus={onCycleTaskStatus} />
      )}

      {meeting.transcript && !meeting.ai_summary && !isSummarizing && (
        <button onClick={handleRegenerateSummary} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
          <RefreshCw size={16} /> Generate Summary
        </button>
      )}
    </div>
  );
}
