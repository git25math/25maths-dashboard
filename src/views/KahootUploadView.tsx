import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileQuestion,
  Gamepad2,
  ImageUp,
  Link2,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Rocket,
  Save,
  Search,
  Server,
  Sparkles,
  Terminal,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { randomAlphaId } from '../lib/id';
import { cn } from '../lib/utils';
import { KahootDeployOptions, LocalAgentJob, localAgentService } from '../services/localAgentService';
import { uploadFile } from '../services/storageService';
import { KahootBoard, KahootItem, KahootQuestion, KahootTimeLimit, KahootTrack, KahootUploadStatus } from '../types';

type DetailTab = 'overview' | 'questions' | 'assets' | 'publish';
type BoardFilter = 'all' | KahootBoard;
type TrackFilter = 'all' | KahootTrack;
type StatusFilter = 'all' | KahootUploadStatus;
type AgentHealthStatus = 'idle' | 'checking' | 'online' | 'offline';

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface KahootUploadViewProps {
  kahootItems: KahootItem[];
  onAddKahoot: (seed?: Partial<Omit<KahootItem, 'id'>>) => Promise<KahootItem | undefined>;
  onUpdateKahoot: (id: string, updates: Partial<KahootItem>) => Promise<void>;
  onDeleteKahoot: (id: string) => Promise<void> | void;
  onDuplicateKahoot: (id: string) => Promise<KahootItem | undefined>;
  toast: ToastApi;
}

const STATUS_META: Record<KahootUploadStatus, { label: string; tone: string; icon: typeof Sparkles }> = {
  ai_generated: {
    label: 'AI Generated',
    tone: 'bg-sky-100 text-sky-700 border-sky-200',
    icon: Sparkles,
  },
  human_review: {
    label: 'Human Review',
    tone: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: TriangleAlert,
  },
  uploaded: {
    label: 'Uploaded',
    tone: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
};

const BOARD_LABELS: Record<KahootBoard, string> = {
  cie0580: 'CIE 0580',
  'edexcel-4ma1': 'Edexcel 4MA1',
};

const TRACK_LABELS: Record<KahootTrack, string> = {
  core: 'Core',
  extended: 'Extended',
  foundation: 'Foundation',
  higher: 'Higher',
};

const TIME_LIMIT_OPTIONS: KahootTimeLimit[] = [5, 10, 20, 30, 60, 90, 120];
const DEPLOY_OPTIONS_STORAGE_KEY = 'kahoot-deploy-options';
const DEFAULT_DEPLOY_OPTIONS: KahootDeployOptions = {
  use_ai_fill: true,
  sync_website: true,
  update_listing: true,
  headless: false,
  manual_fallback: true,
  slow_mo: 250,
};

function formatDateTime(value?: string) {
  if (!value) return 'Not set';

  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function cloneItem(item: KahootItem | null) {
  return item ? JSON.parse(JSON.stringify(item)) as KahootItem : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readStoredDeployOptions(): KahootDeployOptions {
  try {
    const raw = localStorage.getItem(DEPLOY_OPTIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_DEPLOY_OPTIONS;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      ...DEFAULT_DEPLOY_OPTIONS,
      use_ai_fill: typeof parsed.use_ai_fill === 'boolean' ? parsed.use_ai_fill : DEFAULT_DEPLOY_OPTIONS.use_ai_fill,
      sync_website: typeof parsed.sync_website === 'boolean' ? parsed.sync_website : DEFAULT_DEPLOY_OPTIONS.sync_website,
      update_listing: typeof parsed.update_listing === 'boolean' ? parsed.update_listing : DEFAULT_DEPLOY_OPTIONS.update_listing,
      headless: typeof parsed.headless === 'boolean' ? parsed.headless : DEFAULT_DEPLOY_OPTIONS.headless,
      manual_fallback: typeof parsed.manual_fallback === 'boolean' ? parsed.manual_fallback : DEFAULT_DEPLOY_OPTIONS.manual_fallback,
      slow_mo: typeof parsed.slow_mo === 'number' ? parsed.slow_mo : DEFAULT_DEPLOY_OPTIONS.slow_mo,
    };
  } catch {
    return DEFAULT_DEPLOY_OPTIONS;
  }
}

function createDraftQuestion(index: number): KahootQuestion {
  return {
    id: `question-${randomAlphaId()}`,
    prompt: `Question ${index}`,
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    time_limit: 20,
  };
}

function getQuestionIssueCount(question: KahootQuestion) {
  let count = 0;
  if (!question.prompt.trim()) count += 1;
  if (![question.option_a, question.option_b, question.option_c, question.option_d].every(option => option.trim())) count += 1;
  return count;
}

function getItemIssues(item: KahootItem) {
  const issues: string[] = [];

  if (!item.cover_url) issues.push('Missing cover');
  if (!item.challenge_url) issues.push('Missing challenge link');
  if (!item.page_url) issues.push('Missing page link');
  if (!item.description.trim()) issues.push('Missing description');
  if (item.tags.length === 0) issues.push('Missing tags');
  if (item.questions.length === 0) issues.push('No questions');
  if (item.questions.some(question => getQuestionIssueCount(question) > 0)) issues.push('Question validation errors');

  return issues;
}

function countCompleteLinks(item: KahootItem) {
  return [item.page_url, item.challenge_url, item.creator_url].filter(Boolean).length;
}

function getPublishChecklist(item: KahootItem) {
  return [
    { label: 'Title and description are filled', done: Boolean(item.title.trim() && item.description.trim()) },
    { label: 'Cover asset is attached', done: Boolean(item.cover_url) },
    { label: 'Question set has at least one valid question', done: item.questions.length > 0 && item.questions.every(question => getQuestionIssueCount(question) === 0) },
    { label: 'Page link is filled', done: Boolean(item.page_url) },
    { label: 'Play link is filled', done: Boolean(item.challenge_url) },
  ];
}

function getQuestionSummary(item: KahootItem) {
  const issueCount = item.questions.reduce((sum, question) => sum + getQuestionIssueCount(question), 0);
  const flagged = item.questions.filter(question => getQuestionIssueCount(question) > 0).length;
  const avgTime = item.questions.length > 0
    ? Math.round(item.questions.reduce((sum, question) => sum + question.time_limit, 0) / item.questions.length)
    : 0;

  return {
    total: item.questions.length,
    issueCount,
    flagged,
    valid: Math.max(item.questions.length - flagged, 0),
    avgTime,
  };
}

export function KahootUploadView({
  kahootItems,
  onAddKahoot,
  onUpdateKahoot,
  onDeleteKahoot,
  onDuplicateKahoot,
  toast,
}: KahootUploadViewProps) {
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState<BoardFilter>('all');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [selectedId, setSelectedId] = useState<string | null>(kahootItems[0]?.id ?? null);
  const [draft, setDraft] = useState<KahootItem | null>(cloneItem(kahootItems[0] ?? null));
  const [tagInput, setTagInput] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [agentUrl, setAgentUrl] = useState(() => localStorage.getItem('kahoot-agent-url') || 'http://127.0.0.1:4318');
  const [agentHealth, setAgentHealth] = useState<AgentHealthStatus>('idle');
  const [agentMessage, setAgentMessage] = useState('Agent not checked');
  const [agentWebsiteRoot, setAgentWebsiteRoot] = useState('');
  const [deployOptions, setDeployOptions] = useState<KahootDeployOptions>(() => readStoredDeployOptions());
  const [deployJob, setDeployJob] = useState<LocalAgentJob | null>(null);
  const [isStartingDeploy, setIsStartingDeploy] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const processedDeployJobsRef = useRef<Set<string>>(new Set());

  const stats = useMemo(() => ({
    total: kahootItems.length,
    ai_generated: kahootItems.filter(item => item.upload_status === 'ai_generated').length,
    human_review: kahootItems.filter(item => item.upload_status === 'human_review').length,
    uploaded: kahootItems.filter(item => item.upload_status === 'uploaded').length,
    missing_cover: kahootItems.filter(item => !item.cover_url).length,
    missing_challenge: kahootItems.filter(item => !item.challenge_url).length,
  }), [kahootItems]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...kahootItems]
      .filter(item => boardFilter === 'all' || item.board === boardFilter)
      .filter(item => trackFilter === 'all' || item.track === trackFilter)
      .filter(item => statusFilter === 'all' || item.upload_status === statusFilter)
      .filter(item => {
        if (!normalizedSearch) return true;

        return [
          item.title,
          item.topic_code,
          item.description,
          item.tags.join(' '),
          item.challenge_url || '',
        ].join(' ').toLowerCase().includes(normalizedSearch);
      })
      .sort((left, right) => right.updated_at.localeCompare(left.updated_at));
  }, [boardFilter, kahootItems, search, statusFilter, trackFilter]);

  const selectedItem = useMemo(
    () => kahootItems.find(item => item.id === selectedId) ?? null,
    [kahootItems, selectedId],
  );

  const draftIssues = useMemo(() => draft ? getItemIssues(draft) : [], [draft]);
  const draftChecklist = useMemo(() => draft ? getPublishChecklist(draft) : [], [draft]);
  const draftReadiness = useMemo(() => {
    if (!draftChecklist.length) {
      return { complete: 0, total: 0, percent: 0 };
    }

    const complete = draftChecklist.filter(item => item.done).length;
    return {
      complete,
      total: draftChecklist.length,
      percent: Math.round((complete / draftChecklist.length) * 100),
    };
  }, [draftChecklist]);
  const draftQuestionSummary = useMemo(() => draft ? getQuestionSummary(draft) : {
    total: 0,
    issueCount: 0,
    flagged: 0,
    valid: 0,
    avgTime: 0,
  }, [draft]);
  const hasUnsavedChanges = useMemo(() => {
    if (!selectedItem || !draft) return false;
    return JSON.stringify(selectedItem) !== JSON.stringify(draft);
  }, [draft, selectedItem]);

  useEffect(() => {
    if (kahootItems.length === 0) {
      setSelectedId(null);
      setDraft(null);
      return;
    }

    if (!selectedId || !kahootItems.some(item => item.id === selectedId)) {
      setSelectedId(kahootItems[0].id);
    }
  }, [kahootItems, selectedId]);

  useEffect(() => {
    setDraft(cloneItem(selectedItem));
    setTagInput('');
  }, [selectedItem]);

  useEffect(() => {
    localStorage.setItem('kahoot-agent-url', agentUrl);
  }, [agentUrl]);

  useEffect(() => {
    localStorage.setItem(DEPLOY_OPTIONS_STORAGE_KEY, JSON.stringify(deployOptions));
  }, [deployOptions]);

  useEffect(() => {
    if (!deployJob || !['queued', 'running'].includes(deployJob.status)) return;

    const timer = window.setInterval(async () => {
      try {
        const nextJob = await localAgentService.getJob(agentUrl, deployJob.id);
        setDeployJob(nextJob);
      } catch (error) {
        setAgentHealth('offline');
        setAgentMessage('Polling local agent failed');
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [agentUrl, deployJob]);

  useEffect(() => {
    if (!deployJob || deployJob.status !== 'completed') return;
    if (processedDeployJobsRef.current.has(deployJob.id)) return;
    processedDeployJobsRef.current.add(deployJob.id);

    const itemId = deployJob.meta?.item_id;
    const result = asRecord(deployJob.result);
    const resultItem = asRecord(result.item) as Partial<KahootItem>;
    const dryRun = result.dry_run === true;
    const challengeUrl = asString(result.challenge_url || resultItem.challenge_url);
    const creatorUrl = asString(result.creator_url || resultItem.creator_url);
    const websiteLinkId = asString(result.website_link_id || resultItem.website_link_id);
    const listingPath = asString(resultItem.listing_path);
    const syncResult = asRecord(result.sync);
    const uploaded = asRecord(result.upload).uploaded === true;

    if (!itemId) return;

    if (!dryRun) {
      const updates: Partial<KahootItem> = {
        ...resultItem,
        challenge_url: challengeUrl || resultItem.challenge_url,
        creator_url: creatorUrl || resultItem.creator_url,
        website_link_id: websiteLinkId || resultItem.website_link_id,
        listing_path: listingPath || resultItem.listing_path,
      };

      updateDraft(current => current && current.id === itemId ? { ...current, ...updates } : current);

      onUpdateKahoot(itemId, updates).catch(() => {
        toast.error('Deploy finished but item auto-save failed');
      });

      if (uploaded) {
        toast.success(syncResult.synced === true ? 'Kahoot uploaded and website synced' : 'Kahoot upload finished');
      }
      return;
    }

    if (challengeUrl || creatorUrl || websiteLinkId || listingPath) {
      updateDraft(current => current && current.id === itemId
        ? {
            ...current,
            challenge_url: challengeUrl || current.challenge_url,
            creator_url: creatorUrl || current.creator_url,
            website_link_id: websiteLinkId || current.website_link_id,
            listing_path: listingPath || current.listing_path,
          }
        : current);
    }
  }, [deployJob, onUpdateKahoot, toast]);

  const updateDraft = (updater: (current: KahootItem) => KahootItem) => {
    setDraft(current => current ? updater(current) : current);
  };

  const handleSave = async () => {
    if (!draft) return;
    await onUpdateKahoot(draft.id, draft);
  };

  const handleCreate = async () => {
    const created = await onAddKahoot({
      board: boardFilter === 'all' ? 'cie0580' : boardFilter,
      track: trackFilter === 'all' ? 'core' : trackFilter,
      title: 'New Kahoot Upload',
      topic_code: 'NEW-TOPIC',
      tags: [],
    });

    if (created) {
      setSelectedId(created.id);
      setDetailTab('overview');
    }
  };

  const handleDuplicate = async () => {
    if (!selectedItem) return;
    const duplicated = await onDuplicateKahoot(selectedItem.id);
    if (duplicated) {
      setSelectedId(duplicated.id);
      setDetailTab('overview');
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!window.confirm(`Delete "${selectedItem.title}"?`)) return;
    await onDeleteKahoot(selectedItem.id);
  };

  const handleCopy = async (value: string | undefined, label: string) => {
    if (!value) {
      toast.error(`${label} is empty`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleAddTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag || !draft) return;

    updateDraft(current => ({
      ...current,
      tags: current.tags.includes(nextTag) ? current.tags : [...current.tags, nextTag],
    }));
    setTagInput('');
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file || !draft) return;

    try {
      setIsUploadingCover(true);
      const url = await uploadFile(file);
      updateDraft(current => ({ ...current, cover_url: url }));
      toast.success('Cover uploaded to storage');
    } catch (error) {
      toast.error('Cover upload failed. Check Supabase storage configuration.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleCheckAgent = async () => {
    try {
      setAgentHealth('checking');
      setAgentMessage('Checking local agent...');
      const response = await localAgentService.ping(agentUrl);
      setAgentHealth('online');
      setAgentWebsiteRoot(response.website_root || '');
      setAgentMessage(response.website_root ? `${response.service} online · ${response.website_root}` : `${response.service} online`);
      toast.success('Local agent is reachable');
    } catch (error) {
      setAgentHealth('offline');
      setAgentWebsiteRoot('');
      setAgentMessage('Could not reach local agent');
      toast.error('Local agent is offline');
    }
  };

  const handleStartDeploy = async (dryRun: boolean) => {
    if (!draft) return;

    try {
      setIsStartingDeploy(true);
      const job = await localAgentService.startKahootUpload(agentUrl, draft, dryRun, deployOptions);
      setDeployJob(job);
      setAgentHealth('online');
      setAgentMessage(dryRun ? 'Dry-run job started' : 'Deploy job started');
      toast.success(dryRun ? 'Dry-run started' : 'Deploy started');
    } catch (error) {
      setAgentHealth('offline');
      setAgentMessage('Failed to start deploy job');
      toast.error('Could not start local deploy job');
    } finally {
      setIsStartingDeploy(false);
    }
  };

  const detailTabs = draft ? ([
    {
      key: 'overview' as DetailTab,
      label: 'Overview',
      icon: Sparkles,
      summary: `${draftReadiness.percent}% ready`,
    },
    {
      key: 'questions' as DetailTab,
      label: 'Questions',
      icon: FileQuestion,
      summary: `${draftQuestionSummary.total} items`,
    },
    {
      key: 'assets' as DetailTab,
      label: 'Assets',
      icon: ImageUp,
      summary: `${countCompleteLinks(draft)}/3 links`,
    },
    {
      key: 'publish' as DetailTab,
      label: 'Publish',
      icon: Rocket,
      summary: draft.upload_status === 'uploaded' ? 'Ready to sync' : STATUS_META[draft.upload_status].label,
    },
  ]) : [];

  return (
    <div className="space-y-6">
      <div className="glass-card overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.25fr)_430px]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.38),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#172554_42%,_#1e293b_100%)] px-6 py-6 text-white sm:px-7">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent)] xl:block" />
            <div className="relative space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-100/80">Publishing Pipeline</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Kahoot Upload</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200/90">
                  Run the full Kahoot workflow from one surface: metadata, questions, assets, deployment, and website backfill.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: 'Pipeline',
                    value: agentHealth === 'online' ? 'Live agent' : 'Ready for agent',
                    note: 'Browser automation, artifact build, and sync in one run.',
                  },
                  {
                    label: 'Current focus',
                    value: draft ? draft.topic_code || 'Selected item' : 'No item selected',
                    note: draft ? `${draftQuestionSummary.total} questions · ${draftReadiness.percent}% ready` : 'Choose an item to inspect readiness and deploy state.',
                  },
                  {
                    label: 'Risk surface',
                    value: draftIssues.length > 0 ? `${draftIssues.length} blockers` : 'Clean metadata',
                    note: draftIssues.length > 0 ? draftIssues.slice(0, 2).join(' · ') : 'Core metadata, links, and question structure are in place.',
                  },
                ].map(card => (
                  <div key={card.label} className="rounded-[24px] border border-white/15 bg-white/8 p-4 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">{card.label}</p>
                    <p className="mt-2 text-lg font-bold text-white">{card.value}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{card.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5 bg-white/80 p-5 sm:p-6">
            <div className="flex flex-wrap gap-2">
              <button onClick={handleCreate} className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={16} /> New Kahoot
              </button>
              <button
                onClick={handleDuplicate}
                disabled={!selectedItem}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Duplicate
              </button>
              <button
                onClick={handleSave}
                disabled={!draft || !hasUnsavedChanges}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="inline-flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </span>
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Total', value: stats.total, tone: 'text-slate-900', note: 'items in this workspace' },
                { label: 'Human Review', value: stats.human_review, tone: 'text-amber-700', note: 'waiting for QA' },
                { label: 'Uploaded', value: stats.uploaded, tone: 'text-emerald-700', note: 'already on Kahoot' },
                { label: 'Missing Play Link', value: stats.missing_challenge, tone: 'text-rose-700', note: 'cannot sync to website yet' },
              ].map(stat => (
                <div key={stat.label} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
                  <p className={cn('mt-2 text-2xl font-bold', stat.tone)}>{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Selection Snapshot</p>
                  <p className="text-sm text-slate-500">Quick readiness read before you open the full detail view.</p>
                </div>
                <Gamepad2 size={18} className="text-slate-400" />
              </div>

              {!draft && (
                <p className="mt-3 text-sm text-slate-500">No item selected.</p>
              )}

              {draft && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      {draft.topic_code}
                    </span>
                    <span className={cn('rounded-full border px-3 py-1 text-[11px] font-bold', STATUS_META[draft.upload_status].tone)}>
                      {STATUS_META[draft.upload_status].label}
                    </span>
                    {hasUnsavedChanges && (
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-700">Unsaved</span>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{draft.title || 'Untitled Kahoot'}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {draftQuestionSummary.total} questions · {countCompleteLinks(draft)}/3 links · {draftReadiness.percent}% ready
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-all"
                      style={{ width: `${draftReadiness.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {[
          { label: 'Total', value: stats.total, tone: 'text-slate-900', accent: 'bg-slate-900' },
          { label: 'AI Generated', value: stats.ai_generated, tone: 'text-sky-700', accent: 'bg-sky-500' },
          { label: 'Human Review', value: stats.human_review, tone: 'text-amber-700', accent: 'bg-amber-500' },
          { label: 'Uploaded', value: stats.uploaded, tone: 'text-emerald-700', accent: 'bg-emerald-500' },
          { label: 'Missing Cover', value: stats.missing_cover, tone: 'text-rose-700', accent: 'bg-rose-500' },
          { label: 'Missing Play Link', value: stats.missing_challenge, tone: 'text-rose-700', accent: 'bg-rose-500' },
        ].map(stat => (
          <div key={stat.label} className="glass-card overflow-hidden p-4">
            <div className={cn('h-1 rounded-full', stat.accent)} />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
            <p className={cn('mt-2 text-2xl font-bold', stat.tone)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="glass-card space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Explorer</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Filter the upload queue</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                {filteredItems.length} shown
              </div>
            </div>

            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search title, tags, link..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </label>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Board</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={boardFilter === 'all'} onClick={() => setBoardFilter('all')}>All</FilterChip>
                {(Object.keys(BOARD_LABELS) as KahootBoard[]).map(board => (
                  <FilterChip key={board} active={boardFilter === board} onClick={() => setBoardFilter(board)}>
                    {BOARD_LABELS[board]}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Track</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={trackFilter === 'all'} onClick={() => setTrackFilter('all')} tone="teal">All</FilterChip>
                {(Object.keys(TRACK_LABELS) as KahootTrack[]).map(track => (
                  <FilterChip key={track} active={trackFilter === track} onClick={() => setTrackFilter(track)} tone="teal">
                    {TRACK_LABELS[track]}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} tone="emerald">All</FilterChip>
                {(Object.keys(STATUS_META) as KahootUploadStatus[]).map(status => (
                  <FilterChip key={status} active={statusFilter === status} onClick={() => setStatusFilter(status)} tone="emerald">
                    {STATUS_META[status].label}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Items</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Queue and readiness</p>
              </div>
              <p className="text-xs font-bold text-slate-500">{filteredItems.length}</p>
            </div>

            <div className="space-y-2">
              {filteredItems.map(item => {
                const status = STATUS_META[item.upload_status];
                const issueCount = getItemIssues(item).length;
                const questionSummary = getQuestionSummary(item);
                const checklist = getPublishChecklist(item);
                const readiness = Math.round((checklist.filter(entry => entry.done).length / checklist.length) * 100);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'w-full rounded-[26px] border p-3 text-left transition',
                      selectedId === item.id
                        ? 'border-indigo-300 bg-indigo-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-200">
                        {item.cover_url ? (
                          <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <Gamepad2 size={20} className="text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {item.topic_code} · {TRACK_LABELS[item.track]}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">{item.title}</p>
                          </div>
                          <status.icon size={16} className={cn('mt-0.5 shrink-0', item.upload_status === 'uploaded' ? 'text-emerald-600' : item.upload_status === 'human_review' ? 'text-amber-600' : 'text-sky-600')} />
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className={cn('rounded-full border px-2 py-1 font-bold', status.tone)}>{status.label}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-500">
                            {questionSummary.total} Qs
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-500">
                            {countCompleteLinks(item)}/3 links
                          </span>
                          {issueCount > 0 && (
                            <span className="rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-700">
                              {issueCount} issues
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            <span>Readiness</span>
                            <span>{readiness}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                readiness >= 80 ? 'bg-emerald-500' : readiness >= 50 ? 'bg-amber-500' : 'bg-rose-500',
                              )}
                              style={{ width: `${readiness}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                  No Kahoot items match the current filters.
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          {!draft && (
            <div className="glass-card flex min-h-[520px] flex-col items-center justify-center gap-3 p-10 text-center">
              <Gamepad2 size={28} className="text-slate-300" />
              <p className="text-lg font-bold text-slate-700">No Kahoot item selected</p>
              <p className="max-w-md text-sm text-slate-400">
                Create a new item or choose one from the list to manage metadata, questions, assets, links, and upload status.
              </p>
            </div>
          )}

          {draft && (
            <div className="space-y-4">
              <div className="glass-card overflow-hidden">
                <div className="grid gap-0 xl:grid-cols-[190px_minmax(0,1fr)_280px]">
                  <div className="relative min-h-[220px] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-indigo-100/70">
                    {draft.cover_url ? (
                      <img src={draft.cover_url} alt={draft.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <Gamepad2 size={34} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-4 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">{draft.topic_code}</p>
                      <p className="mt-1 text-sm font-bold">{TRACK_LABELS[draft.track]} Track</p>
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {BOARD_LABELS[draft.board]}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {TRACK_LABELS[draft.track]}
                      </span>
                      <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', STATUS_META[draft.upload_status].tone)}>
                        {STATUS_META[draft.upload_status].label}
                      </span>
                      {hasUnsavedChanges && (
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                          Unsaved changes
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{draft.title || 'Untitled Kahoot'}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {draft.topic_code} · {draft.questions.length} questions · last updated {formatDateTime(draft.updated_at)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          label: 'Readiness',
                          value: `${draftReadiness.percent}%`,
                          note: `${draftReadiness.complete}/${draftReadiness.total} publish checks passed`,
                        },
                        {
                          label: 'Question Health',
                          value: draftQuestionSummary.flagged > 0 ? `${draftQuestionSummary.flagged} flagged` : 'All clean',
                          note: `${draftQuestionSummary.valid} valid · avg ${draftQuestionSummary.avgTime || 0}s`,
                        },
                        {
                          label: 'Link Coverage',
                          value: `${countCompleteLinks(draft)}/3 ready`,
                          note: draft.challenge_url ? 'Play link available' : 'Challenge link still missing',
                        },
                      ].map(card => (
                        <div key={card.label} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                          <p className="mt-2 text-base font-bold text-slate-900">{card.value}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{card.note}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <span>Deployment Readiness</span>
                        <span>{draftReadiness.percent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-all"
                          style={{ width: `${draftReadiness.percent}%` }}
                        />
                      </div>
                    </div>

                    {draftIssues.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {draftIssues.slice(0, 4).map(issue => (
                          <span key={issue} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50/70 p-5 xl:border-l xl:border-t-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quick Actions</p>
                    <div className="mt-4 grid gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(draft.challenge_url, 'Play link')}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Copy size={14} /> Copy Play Link
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(draft.creator_url, 'Creator link')}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Link2 size={14} /> Copy Creator Link
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 size={14} /> Delete
                        </span>
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {[
                        ['Last updated', formatDateTime(draft.updated_at)],
                        ['AI generated', formatDateTime(draft.ai_generated_at)],
                        ['Uploaded', formatDateTime(draft.uploaded_at)],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                          <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {detailTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDetailTab(tab.key)}
                      className={cn(
                        'rounded-[24px] border p-4 text-left transition',
                        detailTab === tab.key
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className={cn(
                          'rounded-full p-2',
                          detailTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500',
                        )}>
                          <Icon size={16} />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{tab.summary}</span>
                      </div>
                      <p className="mt-4 text-base font-bold">{tab.label}</p>
                    </button>
                  );
                })}
              </div>

              {detailTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: 'Readiness',
                        value: `${draftReadiness.percent}%`,
                        note: `${draftReadiness.complete}/${draftReadiness.total} checks passed`,
                      },
                      {
                        label: 'Question Set',
                        value: `${draftQuestionSummary.total} total`,
                        note: draftQuestionSummary.flagged > 0 ? `${draftQuestionSummary.flagged} flagged questions` : 'No validation flags',
                      },
                      {
                        label: 'Tags',
                        value: `${draft.tags.length}`,
                        note: draft.tags.length > 0 ? draft.tags.slice(0, 3).join(' · ') : 'No tagging yet',
                      },
                      {
                        label: 'Website Mapping',
                        value: draft.website_link_id ? 'Mapped' : 'Pending',
                        note: draft.website_link_id || 'Add the website link id before sync',
                      },
                    ].map(card => (
                      <div key={card.label} className="glass-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">{card.value}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{card.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
                  <div className="glass-card space-y-5 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Title</span>
                        <input
                          value={draft.title}
                          onChange={event => updateDraft(current => ({ ...current, title: event.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Topic Code</span>
                        <input
                          value={draft.topic_code}
                          onChange={event => updateDraft(current => ({ ...current, topic_code: event.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Board</span>
                        <select
                          value={draft.board}
                          onChange={event => updateDraft(current => ({ ...current, board: event.target.value as KahootBoard }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        >
                          {(Object.keys(BOARD_LABELS) as KahootBoard[]).map(board => (
                            <option key={board} value={board}>{BOARD_LABELS[board]}</option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Track</span>
                        <select
                          value={draft.track}
                          onChange={event => updateDraft(current => ({ ...current, track: event.target.value as KahootTrack }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        >
                          {(Object.keys(TRACK_LABELS) as KahootTrack[]).map(track => (
                            <option key={track} value={track}>{TRACK_LABELS[track]}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Description</span>
                      <textarea
                        value={draft.description}
                        onChange={event => updateDraft(current => ({ ...current, description: event.target.value }))}
                        rows={6}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Tags</span>
                        <span className="text-xs font-bold text-slate-400">{draft.tags.length} tags</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {draft.tags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => updateDraft(current => ({ ...current, tags: current.tags.filter(item => item !== tag) }))}
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
                          >
                            {tag} ×
                          </button>
                        ))}
                        {draft.tags.length === 0 && (
                          <span className="rounded-full border border-dashed border-slate-200 px-3 py-1.5 text-xs text-slate-400">
                            No tags yet
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          value={tagInput}
                          onChange={event => setTagInput(event.target.value)}
                          onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ',') {
                              event.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add a tag and press Enter"
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card space-y-4 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Card Preview</p>
                      <div className="mt-3 overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                        {draft.cover_url ? (
                          <img src={draft.cover_url} alt={draft.title} className="h-44 w-full object-cover" />
                        ) : (
                          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-400">
                            Cover preview
                          </div>
                        )}

                        <div className="space-y-3 p-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">{draft.topic_code}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">{TRACK_LABELS[draft.track]}</span>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-slate-900">{draft.title || 'Untitled Kahoot'}</p>
                            <MarkdownRenderer
                              content={draft.description || 'Add a short Kahoot intro or upload notes here.'}
                              className="mt-2 text-sm text-slate-500 [&_p]:m-0"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {draft.tags.map(tag => (
                              <span key={tag} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Readiness Check</p>
                      <div className="mt-3 space-y-2">
                        {draftIssues.length === 0 && (
                          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                            No blocking metadata issues detected.
                          </div>
                        )}
                        {draftIssues.map(issue => (
                          <div key={issue} className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {detailTab === 'questions' && (
                <div className="glass-card space-y-5 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Question Set</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Edit the Kahoot prompt, answer options, correct answer, and time limit before upload.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateDraft(current => ({
                        ...current,
                        questions: [...current.questions, createDraftQuestion(current.questions.length + 1)],
                      }))}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Plus size={14} /> Add Question
                      </span>
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    {[
                      {
                        label: 'Total',
                        value: draftQuestionSummary.total,
                        note: 'questions in this kahoot',
                      },
                      {
                        label: 'Valid',
                        value: draftQuestionSummary.valid,
                        note: 'no structure issues',
                      },
                      {
                        label: 'Flagged',
                        value: draftQuestionSummary.flagged,
                        note: `${draftQuestionSummary.issueCount} field-level issues`,
                      },
                      {
                        label: 'Average Time',
                        value: `${draftQuestionSummary.avgTime || 0}s`,
                        note: 'per question',
                      },
                    ].map(card => (
                      <div key={card.label} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">{card.value}</p>
                        <p className="mt-1 text-xs text-slate-500">{card.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {draft.questions.map((question, index) => {
                      const issueCount = getQuestionIssueCount(question);

                      return (
                        <div key={question.id} className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                  Q{index + 1}
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                  {question.time_limit}s
                                </span>
                                {issueCount > 0 && (
                                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                                    {issueCount} issue{issueCount > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => updateDraft(current => {
                                  const questions = [...current.questions];
                                  if (index === 0) return current;
                                  [questions[index - 1], questions[index]] = [questions[index], questions[index - 1]];
                                  return { ...current, questions };
                                })}
                                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateDraft(current => {
                                  const questions = [...current.questions];
                                  if (index === questions.length - 1) return current;
                                  [questions[index + 1], questions[index]] = [questions[index], questions[index + 1]];
                                  return { ...current, questions };
                                })}
                                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateDraft(current => ({
                                  ...current,
                                  questions: current.questions.filter(item => item.id !== question.id),
                                }))}
                                className="rounded-xl border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 space-y-4">
                            <label className="block space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Question Prompt</span>
                              <textarea
                                value={question.prompt}
                                onChange={event => updateDraft(current => ({
                                  ...current,
                                  questions: current.questions.map(item => item.id === question.id ? { ...item, prompt: event.target.value } : item),
                                }))}
                                rows={3}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                              />
                            </label>

                            <div className="grid gap-3 md:grid-cols-2">
                              {([
                                ['option_a', 'Option A'],
                                ['option_b', 'Option B'],
                                ['option_c', 'Option C'],
                                ['option_d', 'Option D'],
                              ] as Array<[keyof KahootQuestion, string]>).map(([key, label]) => (
                                <label key={key} className="space-y-2">
                                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span>
                                  <input
                                    value={question[key] as string}
                                    onChange={event => updateDraft(current => ({
                                      ...current,
                                      questions: current.questions.map(item => item.id === question.id ? { ...item, [key]: event.target.value } : item),
                                    }))}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                  />
                                </label>
                              ))}
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                              <label className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Correct Option</span>
                                <select
                                  value={question.correct_option}
                                  onChange={event => updateDraft(current => ({
                                    ...current,
                                    questions: current.questions.map(item => item.id === question.id ? { ...item, correct_option: event.target.value as KahootQuestion['correct_option'] } : item),
                                  }))}
                                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                >
                                  {(['A', 'B', 'C', 'D'] as const).map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              </label>

                              <label className="space-y-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Time Limit</span>
                                <select
                                  value={question.time_limit}
                                  onChange={event => updateDraft(current => ({
                                    ...current,
                                    questions: current.questions.map(item => item.id === question.id ? { ...item, time_limit: Number(event.target.value) as KahootTimeLimit } : item),
                                  }))}
                                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                >
                                  {TIME_LIMIT_OPTIONS.map(limit => (
                                    <option key={limit} value={limit}>{limit} seconds</option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {draft.questions.length === 0 && (
                      <div className="rounded-[28px] border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-400">
                        No questions yet. Add at least one before uploading to Kahoot.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTab === 'assets' && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: 'Cover',
                        value: draft.cover_url ? 'Attached' : 'Missing',
                        note: draft.cover_url ? 'Preview available in the right rail' : 'Upload or paste a cover asset URL',
                      },
                      {
                        label: 'Page Link',
                        value: draft.page_url ? 'Ready' : 'Missing',
                        note: draft.page_url || '25Maths page URL not set',
                      },
                      {
                        label: 'Play Link',
                        value: draft.challenge_url ? 'Ready' : 'Missing',
                        note: draft.challenge_url || 'Challenge URL will be created or pasted here',
                      },
                      {
                        label: 'Creator Link',
                        value: draft.creator_url ? 'Ready' : 'Pending',
                        note: draft.creator_url || 'Resolved during deploy when available',
                      },
                    ].map(card => (
                      <div key={card.label} className="glass-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                        <p className="mt-2 text-xl font-bold text-slate-900">{card.value}</p>
                        <p className="mt-1 break-all text-xs leading-5 text-slate-500">{card.note}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="glass-card space-y-5 p-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Cover URL</span>
                        <input
                          value={draft.cover_url || ''}
                          onChange={event => updateDraft(current => ({ ...current, cover_url: event.target.value || undefined }))}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>

                      <label className="space-y-2 md:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Page Link</span>
                        <input
                          value={draft.page_url || ''}
                          onChange={event => updateDraft(current => ({ ...current, page_url: event.target.value || undefined }))}
                          placeholder="https://www.25maths.com/..."
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Play Link</span>
                        <input
                          value={draft.challenge_url || ''}
                          onChange={event => updateDraft(current => ({ ...current, challenge_url: event.target.value || undefined }))}
                          placeholder="https://kahoot.it/challenge/..."
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Creator Link</span>
                        <input
                          value={draft.creator_url || ''}
                          onChange={event => updateDraft(current => ({ ...current, creator_url: event.target.value || undefined }))}
                          placeholder="https://create.kahoot.it/details/..."
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Cover Asset</p>
                          <p className="text-sm text-slate-500">
                            Paste a URL or upload to Supabase storage using the existing dashboard uploader.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={event => handleCoverUpload(event.target.files?.[0])}
                          />
                          <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={isUploadingCover}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="inline-flex items-center gap-2">
                              <ImageUp size={14} /> {isUploadingCover ? 'Uploading...' : 'Upload Cover'}
                            </span>
                          </button>
                          {draft.cover_url && (
                            <a
                              href={draft.cover_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                            >
                              <span className="inline-flex items-center gap-2">
                                <ExternalLink size={14} /> Open
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card space-y-4 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Asset Preview</p>
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                      {draft.cover_url ? (
                        <img src={draft.cover_url} alt={draft.title} className="h-64 w-full object-cover" />
                      ) : (
                        <div className="flex h-64 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                          No cover configured
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {[
                        ['Page Link', draft.page_url],
                        ['Play Link', draft.challenge_url],
                        ['Creator Link', draft.creator_url],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                          <div className="mt-2 flex items-center justify-between gap-3">
                            <p className="min-w-0 truncate text-sm text-slate-600">{value || 'Not set'}</p>
                            {value && (
                              <a href={value} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-slate-700">
                                <ExternalLink size={15} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>
                </div>
              )}

              {detailTab === 'publish' && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: 'AI Draft',
                        value: draft.ai_generated_at ? 'Complete' : 'Pending',
                        tone: draft.ai_generated_at ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-slate-50 text-slate-600 border-slate-200',
                      },
                      {
                        label: 'Manual Review',
                        value: draft.upload_status === 'human_review' || draft.upload_status === 'uploaded' ? 'Complete' : 'Pending',
                        tone: draft.upload_status === 'human_review' || draft.upload_status === 'uploaded' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200',
                      },
                      {
                        label: 'Kahoot Upload',
                        value: draft.upload_status === 'uploaded' ? 'Complete' : 'Pending',
                        tone: draft.upload_status === 'uploaded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200',
                      },
                      {
                        label: 'Website Sync',
                        value: draft.challenge_url && draft.website_link_id ? 'Ready' : 'Needs mapping',
                        tone: draft.challenge_url && draft.website_link_id ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200',
                      },
                    ].map(step => (
                      <div key={step.label} className={cn('rounded-[24px] border p-4', step.tone)}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">{step.label}</p>
                        <p className="mt-2 text-lg font-bold">{step.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="glass-card space-y-5 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Upload Status</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        {(Object.keys(STATUS_META) as KahootUploadStatus[]).map(status => {
                          const meta = STATUS_META[status];
                          const Icon = meta.icon;

                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => updateDraft(current => ({ ...current, upload_status: status }))}
                              className={cn(
                                'rounded-[24px] border p-4 text-left transition',
                                draft.upload_status === status
                                  ? cn(meta.tone, 'shadow-sm')
                                  : 'border-slate-200 bg-white hover:border-slate-300',
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={18} />
                                <div>
                                  <p className="text-sm font-bold">{meta.label}</p>
                                  <p className="text-xs opacity-70">
                                    {status === 'ai_generated' ? 'Initial draft' : status === 'human_review' ? 'Ready for manual QA' : 'Published and linked'}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Review Notes</span>
                      <textarea
                        value={draft.review_notes || ''}
                        onChange={event => updateDraft(current => ({ ...current, review_notes: event.target.value }))}
                        rows={6}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Website Link ID</span>
                        <input
                          value={draft.website_link_id || ''}
                          onChange={event => updateDraft(current => ({ ...current, website_link_id: event.target.value || undefined }))}
                          placeholder="cie0580:number-c1:c1-02-sets"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Listing Path</span>
                        <input
                          value={draft.listing_path || ''}
                          onChange={event => updateDraft(current => ({ ...current, listing_path: event.target.value || undefined }))}
                          placeholder="payhip/presale/listing-assets/l1/..."
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        />
                      </label>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                      <p className="text-sm font-bold text-slate-900">Deploy Options</p>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {[
                          ['use_ai_fill', 'AI-fill missing metadata and questions'],
                          ['sync_website', 'Sync website CSV and JSON after upload'],
                          ['update_listing', 'Update matching Listing.md link'],
                          ['headless', 'Run browser headless'],
                          ['manual_fallback', 'Allow manual browser fallback'],
                        ].map(([key, label]) => (
                          <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={Boolean(deployOptions[key as keyof KahootDeployOptions])}
                              onChange={event => setDeployOptions(current => ({ ...current, [key]: event.target.checked }))}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Slow Mo</span>
                          <select
                            value={deployOptions.slow_mo || 250}
                            onChange={event => setDeployOptions(current => ({ ...current, slow_mo: Number(event.target.value) }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                          >
                            {[0, 150, 250, 500, 1000].map(option => (
                              <option key={option} value={option}>{option} ms</option>
                            ))}
                          </select>
                        </label>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Agent Website Root</p>
                          <p className="mt-2 break-all text-sm text-slate-600">{agentWebsiteRoot || 'Check agent to inspect the detected website repo.'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-900">Publish Checklist</p>
                      <div className="mt-3 space-y-2">
                        {draftChecklist.map(item => (
                          <div key={item.label} className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium',
                            item.done ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                          )}>
                            {item.done ? <CheckCircle2 size={16} /> : <TriangleAlert size={16} />}
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Local Deploy Agent</p>
                          <p className="text-sm text-slate-500">
                            The web UI calls your local agent, and the agent runs the terminal command on your machine.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'rounded-full px-3 py-1 text-xs font-bold',
                            agentHealth === 'online'
                              ? 'bg-emerald-100 text-emerald-700'
                              : agentHealth === 'offline'
                                ? 'bg-rose-100 text-rose-700'
                                : agentHealth === 'checking'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-100 text-slate-500',
                          )}>
                            {agentHealth === 'online' ? 'Online' : agentHealth === 'offline' ? 'Offline' : agentHealth === 'checking' ? 'Checking' : 'Idle'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <label className="block space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Agent URL</span>
                          <input
                            value={agentUrl}
                            onChange={event => setAgentUrl(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                          />
                        </label>

                        <p className="text-sm text-slate-500">{agentMessage}</p>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={handleCheckAgent}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                          >
                            <span className="inline-flex items-center gap-2">
                              <RefreshCcw size={14} /> Check Agent
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartDeploy(true)}
                            disabled={isStartingDeploy}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="inline-flex items-center gap-2">
                              {isStartingDeploy ? <LoaderCircle size={14} className="animate-spin" /> : <Terminal size={14} />}
                              Dry Run
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartDeploy(false)}
                            disabled={isStartingDeploy}
                            className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="inline-flex items-center gap-2">
                              {isStartingDeploy ? <LoaderCircle size={14} className="animate-spin" /> : <Rocket size={14} />}
                              Deploy to Kahoot
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card space-y-4 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Timeline</p>
                    <div className="space-y-3">
                      {[
                        { label: 'AI Generated', value: draft.ai_generated_at, icon: Sparkles },
                        { label: 'Human Reviewed', value: draft.human_reviewed_at, icon: FileQuestion },
                        { label: 'Uploaded', value: draft.uploaded_at, icon: Link2 },
                      ].map(entry => {
                        const Icon = entry.icon;

                        return (
                          <div key={entry.label} className="rounded-[24px] border border-slate-200 bg-white px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-slate-100 p-2 text-slate-500">
                                <Icon size={15} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{entry.label}</p>
                                <p className="text-sm text-slate-500">{formatDateTime(entry.value)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-900">Link Actions</p>
                      <div className="mt-3 grid gap-2">
                        {[
                          ['Page Link', draft.page_url],
                          ['Play Link', draft.challenge_url],
                          ['Creator Link', draft.creator_url],
                        ].map(([label, value]) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => handleCopy(value, label)}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                          >
                            <span>{label}</span>
                            <Copy size={14} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Deploy Run</p>
                          <p className="text-sm text-slate-500">Latest local terminal execution and logs.</p>
                        </div>
                        <Server size={16} className="text-slate-400" />
                      </div>

                      {!deployJob && (
                        <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
                          No deploy job started yet.
                        </div>
                      )}

                      {deployJob && (
                        <div className="mt-3 space-y-3">
                          <div className="grid gap-2 text-sm md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status</p>
                              <p className="mt-1 font-bold text-slate-900">{deployJob.status}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Started</p>
                              <p className="mt-1 font-bold text-slate-900">{formatDateTime(deployJob.started_at || deployJob.created_at)}</p>
                            </div>
                          </div>

                          {deployJob.command && (
                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Command</p>
                              <p className="mt-1 break-all font-mono text-xs text-slate-600">{deployJob.command}</p>
                            </div>
                          )}

                          {deployJob.error && (
                            <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                              {deployJob.error}
                            </div>
                          )}

                          {typeof deployJob.result?.challenge_url === 'string' && deployJob.result.challenge_url && (
                            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                              Returned challenge link: {deployJob.result.challenge_url}
                            </div>
                          )}

                          {(typeof deployJob.result?.creator_url === 'string' && deployJob.result.creator_url) && (
                            <div className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700">
                              Creator URL: {deployJob.result.creator_url}
                            </div>
                          )}

                          {deployJob.result && (
                            <div className="grid gap-2 text-sm">
                              {[
                                ['Artifact Dir', asString(deployJob.result.artifact_dir)],
                                ['XLSX', asString(deployJob.result.xlsx_path)],
                                ['Website Link ID', asString(deployJob.result.website_link_id)],
                              ].filter(([, value]) => value).map(([label, value]) => (
                                <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                                  <p className="mt-1 break-all font-mono text-xs text-slate-600">{value}</p>
                                </div>
                              ))}

                              {(() => {
                                const sync = asRecord(deployJob.result?.sync);
                                if (!Object.keys(sync).length) return null;

                                const reason = asString(sync.reason);
                                const synced = sync.synced === true;
                                const skipped = sync.skipped === true;

                                return (
                                  <div className={cn(
                                    'rounded-xl px-3 py-2 text-sm font-medium',
                                    synced
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : skipped
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-slate-100 text-slate-600',
                                  )}>
                                    {synced ? 'Website backfill completed.' : skipped ? `Website backfill skipped: ${reason || 'no reason returned'}` : 'Website backfill pending.'}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-950 p-3">
                            {(deployJob.logs || []).map((line, index) => (
                              <div key={`${line.at}-${index}`} className="font-mono text-xs leading-5 text-slate-200">
                                <span className="text-slate-500">{line.at}</span>{' '}
                                <span className={line.stream === 'stderr' ? 'text-rose-300' : 'text-emerald-300'}>
                                  [{line.stream}]
                                </span>{' '}
                                <span>{line.message}</span>
                              </div>
                            ))}
                            {deployJob.logs.length === 0 && (
                              <p className="font-mono text-xs text-slate-500">No logs yet.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
