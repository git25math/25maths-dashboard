import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, Mail, Loader2, CheckSquare, ChevronDown, ChevronUp, ArrowRightCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { EmailDigest, EmailDigestItem, Task } from '../types';
import { geminiService } from '../services/geminiService';

type ViewMode = 'list' | 'detail' | 'new';

const TASK_STATUS_COLORS: Record<Task['status'], string> = {
  inbox: 'bg-slate-100 text-slate-600',
  next: 'bg-blue-50 text-blue-600',
  waiting: 'bg-amber-50 text-amber-600',
  someday: 'bg-purple-50 text-purple-600',
  done: 'bg-emerald-50 text-emerald-600',
};

const TASK_STATUS_CYCLE: Task['status'][] = ['inbox', 'next', 'waiting', 'someday', 'done'];

interface EmailDigestViewProps {
  emailDigests: EmailDigest[];
  onAddEmailDigest: (data: Omit<EmailDigest, 'id'>) => Promise<EmailDigest>;
  onUpdateEmailDigest: (id: string, updates: Partial<EmailDigest>) => void;
  onDeleteEmailDigest: (id: string) => void;
  onAddTask?: (data: Omit<Task, 'id' | 'created_at'>) => void;
  tasks?: Task[];
  onCycleTaskStatus?: (id: string) => void;
}

export const EmailDigestView = ({
  emailDigests,
  onAddEmailDigest,
  onUpdateEmailDigest,
  onDeleteEmailDigest,
  onAddTask,
  tasks = [],
  onCycleTaskStatus,
}: EmailDigestViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDigest, setSelectedDigest] = useState<EmailDigest | null>(null);

  // New digest form
  const [emailContent, setEmailContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const sortedDigests = [...emailDigests].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const openDetail = (digest: EmailDigest) => {
    setSelectedDigest(digest);
    setViewMode('detail');
  };

  const handleProcess = async () => {
    if (!emailContent.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await geminiService.processEmailDigest(emailContent.trim());
      const items: EmailDigestItem[] = result.items.map((item, i) => ({
        id: `item-${Date.now()}-${i}`,
        content: item.content,
        type: item.type,
        checked: false,
      }));
      const created = await onAddEmailDigest({
        subject: result.subject,
        original_content: emailContent.trim(),
        chinese_translation: result.chinese_translation,
        items,
        created_at: new Date().toISOString(),
      });
      setSelectedDigest(created);
      setViewMode('detail');
      setEmailContent('');
    } catch {
      // error handled by toast in parent
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItem = (digestId: string, itemId: string) => {
    const digest = emailDigests.find(d => d.id === digestId);
    if (!digest) return;
    const updatedItems = digest.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onUpdateEmailDigest(digestId, { items: updatedItems });
    if (selectedDigest?.id === digestId) {
      setSelectedDigest({ ...selectedDigest, items: updatedItems });
    }
  };

  const convertToTask = (digestId: string, item: EmailDigestItem) => {
    if (!onAddTask || item.task_id) return;
    const digest = emailDigests.find(d => d.id === digestId);
    if (!digest) return;

    const taskId = `task-${Date.now()}`;
    onAddTask({
      title: item.content,
      description: `From email: ${digest.subject}`,
      status: 'inbox',
      priority: 'medium',
      source_type: 'email-digest',
      source_id: digestId,
    });

    const updatedItems = digest.items.map(i =>
      i.id === item.id ? { ...i, task_id: taskId, checked: true } : i
    );
    onUpdateEmailDigest(digestId, { items: updatedItems });
    if (selectedDigest?.id === digestId) {
      setSelectedDigest({ ...selectedDigest, items: updatedItems });
    }
  };

  // --- List View ---
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Mail size={24} className="text-indigo-600" /> Email Digest
            </h2>
            <p className="text-sm text-slate-500 mt-1">Paste school emails for AI-powered Chinese summaries</p>
          </div>
          <button
            onClick={() => setViewMode('new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> New Digest
          </button>
        </div>

        {sortedDigests.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Mail size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No email digests yet</p>
            <p className="text-sm mt-1">Paste an English school email to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedDigests.map(digest => {
              const totalItems = digest.items.length;
              const checkedItems = digest.items.filter(i => i.checked).length;
              const actionCount = digest.items.filter(i => i.type === 'action').length;
              const memoCount = digest.items.filter(i => i.type === 'memo').length;

              return (
                <div
                  key={digest.id}
                  className="glass-card p-5 cursor-pointer hover:shadow-md transition-shadow group relative"
                  onClick={() => openDetail(digest)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{digest.subject}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteEmailDigest(digest.id); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(digest.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    {actionCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                        {actionCount} action{actionCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {memoCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        {memoCount} memo{memoCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {totalItems > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>{checkedItems}/{totalItems} completed</span>
                        <span>{Math.round((checkedItems / totalItems) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${(checkedItems / totalItems) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- New Digest View ---
  if (viewMode === 'new') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900">New Email Digest</h2>
        </div>

        <div className="glass-card p-6 space-y-4">
          <label className="block text-sm font-bold text-slate-700">Paste Email Content (English)</label>
          <textarea
            value={emailContent}
            onChange={e => setEmailContent(e.target.value)}
            placeholder="Paste the full email content here..."
            rows={14}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-y"
          />
          <button
            onClick={handleProcess}
            disabled={!emailContent.trim() || isProcessing}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors",
              emailContent.trim() && !isProcessing
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing with AI...
              </>
            ) : (
              <>
                <Mail size={16} /> Process with AI
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // --- Detail View ---
  if (viewMode === 'detail' && selectedDigest) {
    const digest = emailDigests.find(d => d.id === selectedDigest.id) || selectedDigest;
    const relatedTasks = tasks.filter(t => t.source_type === 'email-digest' && t.source_id === digest.id);

    return (
      <DigestDetail
        digest={digest}
        relatedTasks={relatedTasks}
        onBack={() => setViewMode('list')}
        onToggleItem={(itemId) => toggleItem(digest.id, itemId)}
        onConvertToTask={(item) => convertToTask(digest.id, item)}
        onCycleTaskStatus={onCycleTaskStatus}
      />
    );
  }

  return null;
};

// --- Detail Sub-component ---

interface DigestDetailProps {
  digest: EmailDigest;
  relatedTasks: Task[];
  onBack: () => void;
  onToggleItem: (itemId: string) => void;
  onConvertToTask: (item: EmailDigestItem) => void;
  onCycleTaskStatus?: (id: string) => void;
}

const DigestDetail = ({ digest, relatedTasks, onBack, onToggleItem, onConvertToTask, onCycleTaskStatus }: DigestDetailProps) => {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-900 truncate">{digest.subject}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(digest.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Original Email (collapsible) */}
      <div className="glass-card overflow-hidden">
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="w-full flex items-center justify-between p-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>Original Email (English)</span>
          {showOriginal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showOriginal && (
          <div className="px-4 pb-4">
            <pre className="whitespace-pre-wrap text-xs text-slate-600 bg-slate-50 p-4 rounded-xl max-h-64 overflow-y-auto">
              {digest.original_content}
            </pre>
          </div>
        )}
      </div>

      {/* Chinese Translation */}
      <div className="glass-card p-5 space-y-2">
        <h3 className="text-sm font-bold text-slate-700">Chinese Translation</h3>
        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {digest.chinese_translation}
        </div>
      </div>

      {/* Items List */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <CheckSquare size={16} className="text-indigo-600" /> Items ({digest.items.filter(i => i.checked).length}/{digest.items.length})
        </h3>
        <div className="space-y-2">
          {digest.items.map(item => (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl transition-colors",
                item.checked ? "bg-slate-50" : "bg-white border border-slate-100"
              )}
            >
              <button
                onClick={() => onToggleItem(item.id)}
                className={cn(
                  "w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                  item.checked
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-300 hover:border-indigo-400"
                )}
              >
                {item.checked && <CheckSquare size={12} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", item.checked ? "text-slate-400 line-through" : "text-slate-700")}>
                  {item.content}
                </p>
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                item.type === 'action' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
              )}>
                {item.type === 'action' ? 'Action' : 'Memo'}
              </span>
              {item.type === 'action' && !item.task_id && (
                <button
                  onClick={() => onConvertToTask(item)}
                  className="text-indigo-500 hover:text-indigo-700 shrink-0"
                  title="Convert to GTD Task"
                >
                  <ArrowRightCircle size={16} />
                </button>
              )}
              {item.task_id && (
                <span className="text-[10px] text-emerald-600 font-bold shrink-0">Tasked</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Related Tasks */}
      {relatedTasks.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-700">Related Tasks</h3>
          <div className="space-y-2">
            {relatedTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <button
                  onClick={() => onCycleTaskStatus?.(task.id)}
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer",
                    TASK_STATUS_COLORS[task.status]
                  )}
                  title={`Click to cycle: ${TASK_STATUS_CYCLE[(TASK_STATUS_CYCLE.indexOf(task.status) + 1) % TASK_STATUS_CYCLE.length]}`}
                >
                  {task.status}
                </button>
                <span className="text-sm text-slate-700 flex-1 truncate">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
