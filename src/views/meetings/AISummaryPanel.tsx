import { useState, memo } from 'react';
import { RefreshCw, CheckCircle2, Tag, AlertCircle, Loader2, Sparkles, ArrowRightCircle, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AISummary, Task, SmartTaskPreview } from '../../types';
import { geminiService } from '../../services/geminiService';
import { SmartExtractModal } from '../../components/SmartExtractModal';
import { ActionPlanModal } from '../../components/ActionPlanModal';

interface AISummaryPanelProps {
  summary: AISummary;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onAddTask?: (data: Omit<Task, 'id' | 'created_at'>) => void;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  meetingCategory: string;
  participants: string[];
  onAddSOP?: (data: { title: string; category: string; content: string }) => void;
}

export const AISummaryPanel = memo(function AISummaryPanel({ summary, onRegenerate, isRegenerating, onAddTask, meetingId, meetingTitle, meetingDate, meetingCategory, participants, onAddSOP }: AISummaryPanelProps) {
  const [isSmartExtracting, setIsSmartExtracting] = useState(false);
  const [smartExtractPreview, setSmartExtractPreview] = useState<SmartTaskPreview[] | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [actionPlanMarkdown, setActionPlanMarkdown] = useState<string | null>(null);
  const [convertedItems, setConvertedItems] = useState<Set<string>>(new Set());

  const handleSmartExtract = async () => {
    if (!onAddTask) return;
    setIsSmartExtracting(true);
    try {
      const tasks = await geminiService.generateSmartTasks({
        summary,
        meetingTitle,
        meetingDate,
        meetingCategory,
        participants,
      });
      setSmartExtractPreview(tasks);
    } catch (err) {
      console.error('Smart extract failed:', err);
    }
    setIsSmartExtracting(false);
  };

  const handleSmartExtractConfirm = async (tasks: Omit<Task, 'id' | 'created_at'>[]) => {
    if (!onAddTask) return;
    for (const task of tasks) {
      try {
        await onAddTask(task);
      } catch {
        // error already toasted by addTask
      }
    }
    setSmartExtractPreview(null);
  };

  const handleGenerateActionPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const markdown = await geminiService.generateActionPlan({
        summary,
        meetingTitle,
        meetingDate,
        meetingCategory,
        participants,
      });
      setActionPlanMarkdown(markdown);
    } catch (err) {
      console.error('Action plan generation failed:', err);
    }
    setIsGeneratingPlan(false);
  };

  const convertKeyPoint = (point: string, idx: number) => {
    if (!onAddTask) return;
    const key = `kp-${idx}`;
    if (convertedItems.has(key)) return;
    onAddTask({
      title: point.length > 80 ? point.slice(0, 80) + '...' : point,
      description: point,
      status: 'inbox',
      priority: 'medium',
      source_type: 'meeting',
      source_id: meetingId,
      tags: ['follow-up'],
    });
    setConvertedItems(prev => new Set(prev).add(key));
  };

  const convertDecision = (decision: string, idx: number) => {
    if (!onAddTask) return;
    const key = `dec-${idx}`;
    if (convertedItems.has(key)) return;
    const title = `执行决定: ${decision.length > 60 ? decision.slice(0, 60) + '...' : decision}`;
    onAddTask({
      title,
      description: decision,
      status: 'inbox',
      priority: 'high',
      source_type: 'meeting',
      source_id: meetingId,
      tags: ['decision'],
    });
    setConvertedItems(prev => new Set(prev).add(key));
  };

  const convertActionItem = (item: { content: string; assignee: string; deadline: string }, idx: number) => {
    if (!onAddTask) return;
    const key = `ai-${idx}`;
    if (convertedItems.has(key)) return;
    onAddTask({
      title: item.content,
      status: 'inbox',
      priority: 'medium',
      source_type: 'meeting',
      source_id: meetingId,
      assignee: item.assignee || undefined,
      due_date: item.deadline || undefined,
    });
    setConvertedItems(prev => new Set(prev).add(key));
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900">Summary</h3>
          <div className="flex items-center gap-2">
            <button onClick={onRegenerate} disabled={isRegenerating} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-40">
              <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} /> Regenerate
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{summary.summary}</p>
      </div>

      {summary.key_points.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">Key Points</h3>
          <ul className="space-y-2">
            {summary.key_points.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 group/item">
                {convertedItems.has(`kp-${i}`) ? (
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                )}
                <span className="flex-1">{point}</span>
                {onAddTask && (
                  <button
                    onClick={() => convertKeyPoint(point, i)}
                    className={cn(
                      "shrink-0 mt-0.5 transition-all",
                      convertedItems.has(`kp-${i}`)
                        ? "text-emerald-500"
                        : "opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-teal-600"
                    )}
                    title={convertedItems.has(`kp-${i}`) ? 'Converted to task' : 'Convert to task'}
                  >
                    {convertedItems.has(`kp-${i}`) ? <CheckCircle2 size={14} /> : <ArrowRightCircle size={14} />}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.action_items.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">Action Items</h3>
            {onAddTask && (
              <button
                onClick={handleSmartExtract}
                disabled={isSmartExtracting}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100 disabled:opacity-40"
              >
                {isSmartExtracting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isSmartExtracting ? 'Analyzing...' : 'AI Smart Extract'}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {summary.action_items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl group/item">
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
                {onAddTask && (
                  <button
                    onClick={() => convertActionItem(item, i)}
                    className={cn(
                      "shrink-0 mt-0.5 transition-all",
                      convertedItems.has(`ai-${i}`)
                        ? "text-emerald-500"
                        : "opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-teal-600"
                    )}
                    title={convertedItems.has(`ai-${i}`) ? 'Converted to task' : 'Convert to task'}
                  >
                    {convertedItems.has(`ai-${i}`) ? <CheckCircle2 size={14} /> : <ArrowRightCircle size={14} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.decisions.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-3">Decisions</h3>
          <ul className="space-y-2">
            {summary.decisions.map((decision, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 group/item">
                <AlertCircle size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                <span className="flex-1">{decision}</span>
                {onAddTask && (
                  <button
                    onClick={() => convertDecision(decision, i)}
                    className={cn(
                      "shrink-0 mt-0.5 transition-all",
                      convertedItems.has(`dec-${i}`)
                        ? "text-emerald-500"
                        : "opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-teal-600"
                    )}
                    title={convertedItems.has(`dec-${i}`) ? 'Converted to task' : 'Convert to task'}
                  >
                    {convertedItems.has(`dec-${i}`) ? <CheckCircle2 size={14} /> : <ArrowRightCircle size={14} />}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleGenerateActionPlan}
          disabled={isGeneratingPlan}
          className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-medium text-sm hover:bg-teal-700 transition-colors disabled:opacity-40 shadow-lg shadow-teal-200"
        >
          {isGeneratingPlan ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {isGeneratingPlan ? 'Generating Action Plan...' : 'Generate Action Plan'}
        </button>
      </div>

      {smartExtractPreview && (
        <SmartExtractModal
          tasks={smartExtractPreview}
          meetingId={meetingId}
          onConfirm={handleSmartExtractConfirm}
          onCancel={() => setSmartExtractPreview(null)}
        />
      )}

      {actionPlanMarkdown && (
        <ActionPlanModal
          markdown={actionPlanMarkdown}
          meetingTitle={meetingTitle}
          onSaveAsSOP={onAddSOP}
          onClose={() => setActionPlanMarkdown(null)}
        />
      )}
    </div>
  );
});
