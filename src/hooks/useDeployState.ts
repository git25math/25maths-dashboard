import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_DEPLOY_OPTIONS, DEPLOY_OPTIONS_KEY, KahootDeployOptions, LocalAgentJob, localAgentService } from '../services/localAgentService';
import { KahootItem } from '../types';

const AGENT_URL_KEY = 'kahoot-agent-url';
const DEPLOY_JOB_STATE_KEY = 'kahoot-deploy-job-ids';
const DEPLOY_AUDIT_LOG_KEY = 'kahoot-deploy-audit-log';

type AgentStatus = 'idle' | 'checking' | 'online' | 'offline';
export type DeployJobSlot = 'artifacts' | 'spreadsheet' | 'upload';

interface KahootDeployJobIds {
  artifacts?: string;
  spreadsheet?: string;
  upload?: string;
}

export interface DeployAuditEntry {
  jobId: string;
  slot: DeployJobSlot;
  status: LocalAgentJob['status'];
  dryRun: boolean;
  createdAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  summary: string;
  error?: string | null;
  artifactDir?: string;
  listingCopyPath?: string;
  questionSetPath?: string;
  coverSvgPath?: string;
  metadataPromptPath?: string;
  uploadManifestPath?: string;
  buildManifestPath?: string;
  xlsxPath?: string;
  challengeUrl?: string;
  creatorUrl?: string;
  openCreatorUrl?: string;
}

// --- Helpers ---

function loadDeployOptions(): KahootDeployOptions {
  try {
    const raw = localStorage.getItem(DEPLOY_OPTIONS_KEY);
    return raw ? { ...DEFAULT_DEPLOY_OPTIONS, ...JSON.parse(raw) } : DEFAULT_DEPLOY_OPTIONS;
  } catch {
    return DEFAULT_DEPLOY_OPTIONS;
  }
}

export function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function isRunningJob(job: LocalAgentJob | null) {
  return job?.status === 'queued' || job?.status === 'running';
}

function loadJobRegistry(): Record<string, KahootDeployJobIds> {
  try {
    const raw = localStorage.getItem(DEPLOY_JOB_STATE_KEY);
    return raw ? JSON.parse(raw) as Record<string, KahootDeployJobIds> : {};
  } catch {
    return {};
  }
}

function writeJobRegistry(registry: Record<string, KahootDeployJobIds>) {
  localStorage.setItem(DEPLOY_JOB_STATE_KEY, JSON.stringify(registry));
}

function loadAuditRegistry(): Record<string, DeployAuditEntry[]> {
  try {
    const raw = localStorage.getItem(DEPLOY_AUDIT_LOG_KEY);
    return raw ? JSON.parse(raw) as Record<string, DeployAuditEntry[]> : {};
  } catch {
    return {};
  }
}

function writeAuditRegistry(registry: Record<string, DeployAuditEntry[]>) {
  localStorage.setItem(DEPLOY_AUDIT_LOG_KEY, JSON.stringify(registry));
}

function slotForJobType(type: string): DeployJobSlot | null {
  if (type === 'kahoot-artifacts') return 'artifacts';
  if (type === 'kahoot-spreadsheet') return 'spreadsheet';
  if (type === 'kahoot-upload') return 'upload';
  return null;
}

export function slotLabel(slot: DeployJobSlot): string {
  if (slot === 'artifacts') return 'Export MD';
  if (slot === 'spreadsheet') return 'Build Excel';
  return 'Upload';
}

export function statusClasses(status: LocalAgentJob['status']) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'failed') return 'bg-rose-50 text-rose-700';
  return 'bg-amber-50 text-amber-700';
}

export function formatTimestamp(value?: string | null): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function summarizeJob(job: LocalAgentJob): string {
  if (job.status === 'failed') return job.error || 'Job failed';
  if (job.status === 'queued') return 'Queued';
  if (job.status === 'running') return 'Running';

  const result = asRecord(job.result);
  const sync = asRecord(result.sync);
  if (job.type === 'kahoot-artifacts') return 'Markdown artifacts exported';
  if (job.type === 'kahoot-spreadsheet') return 'Import workbook built';
  if (job.type === 'kahoot-upload') {
    if (result.dry_run === true || job.meta?.dry_run === true) return 'Dry run completed';
    if (sync.synced === true) return 'Uploaded and website synced';
    return 'Uploaded to Kahoot';
  }
  return 'Completed';
}

// --- Hook ---

interface UseDeployStateParams {
  item: KahootItem;
  onPersistItem?: (id: string, updates: Partial<KahootItem>) => Promise<void> | void;
  allowArtifacts?: boolean;
  allowSpreadsheet?: boolean;
  allowUpload?: boolean;
}

export function useDeployState({
  item,
  onPersistItem,
  allowArtifacts = true,
  allowSpreadsheet = true,
  allowUpload = true,
}: UseDeployStateParams) {
  const [agentUrl] = useState(() => localStorage.getItem(AGENT_URL_KEY) || 'http://127.0.0.1:4318');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [agentInfo, setAgentInfo] = useState('');
  const [options, setOptions] = useState<KahootDeployOptions>(loadDeployOptions);
  const [jobIds, setJobIds] = useState<KahootDeployJobIds>({});
  const [auditEntries, setAuditEntries] = useState<DeployAuditEntry[]>([]);
  const [startingAction, setStartingAction] = useState<string | null>(null);
  const [artifactsJob, setArtifactsJob] = useState<LocalAgentJob | null>(null);
  const [spreadsheetJob, setSpreadsheetJob] = useState<LocalAgentJob | null>(null);
  const [uploadJob, setUploadJob] = useState<LocalAgentJob | null>(null);

  // Persist options
  useEffect(() => {
    localStorage.setItem(DEPLOY_OPTIONS_KEY, JSON.stringify(options));
  }, [options]);

  // Reset state when item changes
  useEffect(() => {
    setArtifactsJob(null);
    setSpreadsheetJob(null);
    setUploadJob(null);
    setJobIds(loadJobRegistry()[item.id] || {});
    setAuditEntries(loadAuditRegistry()[item.id] || []);
  }, [item.id]);

  const storeJobId = useCallback((slot: DeployJobSlot, jobId: string) => {
    const registry = loadJobRegistry();
    const next = { ...(registry[item.id] || {}), [slot]: jobId };
    registry[item.id] = next;
    writeJobRegistry(registry);
    setJobIds(next);
  }, [item.id]);

  const clearJobId = useCallback((slot: DeployJobSlot) => {
    const registry = loadJobRegistry();
    const current = { ...(registry[item.id] || {}) };
    delete current[slot];
    if (Object.keys(current).length === 0) {
      delete registry[item.id];
    } else {
      registry[item.id] = current;
    }
    writeJobRegistry(registry);
    setJobIds(current);
  }, [item.id]);

  const syncAuditEntry = useCallback((job: LocalAgentJob) => {
    const slot = slotForJobType(job.type);
    if (!slot) return;

    const result = asRecord(job.result);
    const jobItemId = String(job.meta?.item_id || asString(result.item_id) || '');
    if (jobItemId && jobItemId !== item.id) return;

    const artifacts = asRecord(result.artifacts);
    const entry: DeployAuditEntry = {
      jobId: job.id,
      slot,
      status: job.status,
      dryRun: result.dry_run === true || job.meta?.dry_run === true,
      createdAt: job.created_at,
      startedAt: job.started_at,
      finishedAt: job.finished_at,
      summary: summarizeJob(job),
      error: job.error,
      artifactDir: asString(result.artifact_dir),
      listingCopyPath: asString(result.listing_copy_path) || asString(artifacts.listing_copy_path),
      questionSetPath: asString(result.question_set_path) || asString(artifacts.question_set_path),
      coverSvgPath: asString(result.cover_svg_path) || asString(artifacts.cover_svg_path),
      metadataPromptPath: asString(result.metadata_prompt_path),
      uploadManifestPath: asString(result.upload_manifest_path),
      buildManifestPath: asString(result.build_manifest_path) || asString(result.builder_manifest_path),
      xlsxPath: asString(result.xlsx_path),
      challengeUrl: asString(result.challenge_url),
      creatorUrl: asString(result.creator_url),
      openCreatorUrl: asString(result.open_creator_url),
    };

    const registry = loadAuditRegistry();
    const current = [...(registry[item.id] || [])];
    const existingIndex = current.findIndex(c => c.jobId === job.id);
    if (existingIndex === -1) {
      current.unshift(entry);
    } else {
      current[existingIndex] = { ...current[existingIndex], ...entry };
    }

    current.sort((a, b) => {
      const aKey = a.finishedAt || a.startedAt || a.createdAt;
      const bKey = b.finishedAt || b.startedAt || b.createdAt;
      return bKey.localeCompare(aKey);
    });

    registry[item.id] = current.slice(0, 15);
    writeAuditRegistry(registry);
    setAuditEntries(registry[item.id]);
  }, [item.id]);

  const checkAgent = useCallback(async () => {
    setAgentStatus('checking');
    try {
      const res = await localAgentService.ping(agentUrl);
      setAgentStatus('online');
      setAgentInfo(res.website_root ? `${res.service} - ${res.website_root}` : res.service);
    } catch {
      setAgentStatus('offline');
      setAgentInfo('Could not reach agent');
    }
  }, [agentUrl]);

  // Don't auto-ping on mount — avoids ERR_CONNECTION_REFUSED console noise
  // when the local agent isn't running. Agent status is checked on-demand
  // when the user clicks a deploy action or manually triggers a check.

  const applyJobResult = useCallback(async (job: LocalAgentJob) => {
    if (!onPersistItem || job.status !== 'completed') return;

    const result = asRecord(job.result);
    const jobItemId = String(job.meta?.item_id || asString(result.item_id) || '');
    if (jobItemId && jobItemId !== item.id) return;

    const itemResult = asRecord(result.item) as Partial<KahootItem>;
    const dryRun = result.dry_run === true || job.meta?.dry_run === true;
    const nextUpdates: Partial<KahootItem> = { ...itemResult };
    const basePipeline = item.pipeline || {
      ai_generated: false, reviewed: false, excel_exported: false,
      kahoot_uploaded: false, web_verified: false, published: false,
    };

    if (job.type === 'kahoot-spreadsheet') {
      nextUpdates.pipeline = { ...basePipeline, excel_exported: true };
      nextUpdates.upload_status = 'excel_exported';
    }

    if (job.type === 'kahoot-upload' && !dryRun) {
      const sync = asRecord(result.sync);
      nextUpdates.pipeline = {
        ...basePipeline,
        excel_exported: true,
        kahoot_uploaded: true,
        web_verified: sync.synced === true ? true : basePipeline.web_verified,
        published: sync.synced === true ? true : basePipeline.published,
      };
      nextUpdates.upload_status = sync.synced === true ? 'published' : 'kahoot_uploaded';
      nextUpdates.uploaded_at = asString(itemResult.uploaded_at) || new Date().toISOString();
    }

    const pipelineChanged = nextUpdates.pipeline
      ? Object.entries(nextUpdates.pipeline).some(([key, value]) => item.pipeline?.[key as keyof NonNullable<KahootItem['pipeline']>] !== value)
      : false;
    const fieldChanged = Object.entries(nextUpdates).some(([key, value]) => {
      if (key === 'pipeline') return false;
      return JSON.stringify(item[key as keyof KahootItem]) !== JSON.stringify(value);
    });

    if (pipelineChanged || fieldChanged) {
      await onPersistItem(item.id, nextUpdates);
    }
  }, [item, onPersistItem]);

  const hydrateStoredJobs = useCallback(async () => {
    const slots: Array<[DeployJobSlot, string | undefined]> = [
      ['artifacts', jobIds.artifacts],
      ['spreadsheet', jobIds.spreadsheet],
      ['upload', jobIds.upload],
    ];

    for (const [slot, jobId] of slots) {
      if (!jobId) continue;
      try {
        const job = await localAgentService.getJob(agentUrl, jobId);
        const jobItemId = String(job.meta?.item_id || '');
        if (jobItemId && jobItemId !== item.id) {
          clearJobId(slot);
          continue;
        }
        if (slot === 'artifacts') setArtifactsJob(job);
        if (slot === 'spreadsheet') setSpreadsheetJob(job);
        if (slot === 'upload') setUploadJob(job);
        syncAuditEntry(job);
        if (job.status === 'completed') {
          await applyJobResult(job);
        }
      } catch {
        clearJobId(slot);
      }
    }
  }, [agentUrl, applyJobResult, clearJobId, item.id, jobIds.artifacts, jobIds.spreadsheet, jobIds.upload, syncAuditEntry]);

  useEffect(() => {
    if (agentStatus !== 'online') return;
    if (!jobIds.artifacts && !jobIds.spreadsheet && !jobIds.upload) return;
    void hydrateStoredJobs();
  }, [agentStatus, hydrateStoredJobs, jobIds.artifacts, jobIds.spreadsheet, jobIds.upload]);

  const updateJobByType = useCallback((job: LocalAgentJob) => {
    if (job.type === 'kahoot-artifacts') setArtifactsJob(job);
    if (job.type === 'kahoot-spreadsheet') setSpreadsheetJob(job);
    if (job.type === 'kahoot-upload') setUploadJob(job);
  }, []);

  // Poll running jobs
  useEffect(() => {
    const runningJobs = [artifactsJob, spreadsheetJob, uploadJob].filter(j => isRunningJob(j)) as LocalAgentJob[];
    if (runningJobs.length === 0) return;

    const timer = window.setInterval(async () => {
      for (const job of runningJobs) {
        try {
          const next = await localAgentService.getJob(agentUrl, job.id);
          const jobItemId = String(next.meta?.item_id || '');
          if (jobItemId && jobItemId !== item.id) continue;
          updateJobByType(next);
          syncAuditEntry(next);
          if (next.status === 'completed') {
            await applyJobResult(next);
          }
        } catch {
          // Keep polling remaining jobs
        }
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [agentUrl, applyJobResult, artifactsJob, item.id, spreadsheetJob, syncAuditEntry, updateJobByType, uploadJob]);

  const busy = useMemo(
    () => Boolean(startingAction) || [artifactsJob, spreadsheetJob, uploadJob].some(j => isRunningJob(j)),
    [artifactsJob, spreadsheetJob, startingAction, uploadJob],
  );

  const titleReady = item.title.trim().length > 0;
  const questionsReady = item.questions.length > 0;
  const deployReady = titleReady && questionsReady;

  // --- Start actions ---

  const startArtifacts = useCallback(async () => {
    setStartingAction('artifacts');
    try {
      const job = await localAgentService.startKahootArtifacts(agentUrl, item, options);
      setArtifactsJob(job);
      storeJobId('artifacts', job.id);
      syncAuditEntry(job);
      setAgentStatus('online');
    } catch {
      setAgentStatus('offline');
      setAgentInfo('Could not reach agent');
    } finally {
      setStartingAction(null);
    }
  }, [agentUrl, item, options, storeJobId, syncAuditEntry]);

  const startSpreadsheet = useCallback(async () => {
    setStartingAction('spreadsheet');
    try {
      const job = await localAgentService.startKahootSpreadsheet(agentUrl, item, options);
      setSpreadsheetJob(job);
      storeJobId('spreadsheet', job.id);
      syncAuditEntry(job);
      setAgentStatus('online');
    } catch {
      setAgentStatus('offline');
      setAgentInfo('Could not reach agent');
    } finally {
      setStartingAction(null);
    }
  }, [agentUrl, item, options, storeJobId, syncAuditEntry]);

  const startUpload = useCallback(async (dryRun: boolean) => {
    setStartingAction(dryRun ? 'dry-run-upload' : 'upload');
    try {
      const job = await localAgentService.startKahootUpload(agentUrl, item, dryRun, options);
      setUploadJob(job);
      storeJobId('upload', job.id);
      syncAuditEntry(job);
      setAgentStatus('online');
    } catch {
      setAgentStatus('offline');
      setAgentInfo('Could not reach agent');
    } finally {
      setStartingAction(null);
    }
  }, [agentUrl, item, options, storeJobId, syncAuditEntry]);

  // --- Derived state ---

  const visibleAuditEntries = useMemo(
    () => auditEntries.filter(entry => {
      if (entry.slot === 'artifacts') return allowArtifacts;
      if (entry.slot === 'spreadsheet') return allowSpreadsheet;
      return allowUpload;
    }),
    [allowArtifacts, allowSpreadsheet, allowUpload, auditEntries],
  );

  const latestFailedEntry = useMemo(
    () => visibleAuditEntries.find(entry => entry.status === 'failed') || null,
    [visibleAuditEntries],
  );

  const successfulSlots = useMemo(() => {
    const slots = new Set<DeployJobSlot>();
    if (visibleAuditEntries.some(e => e.slot === 'artifacts' && e.status === 'completed')) slots.add('artifacts');
    if (item.pipeline.excel_exported || visibleAuditEntries.some(e => e.slot === 'spreadsheet' && e.status === 'completed')) slots.add('spreadsheet');
    if (item.pipeline.kahoot_uploaded || item.pipeline.published || visibleAuditEntries.some(e => e.slot === 'upload' && e.status === 'completed' && !e.dryRun)) slots.add('upload');
    return slots;
  }, [item.pipeline.excel_exported, item.pipeline.kahoot_uploaded, item.pipeline.published, visibleAuditEntries]);

  const recoveryAction = useMemo(() => {
    const orderedSlots = (['artifacts', 'spreadsheet', 'upload'] as DeployJobSlot[]).filter(slot => {
      if (slot === 'artifacts') return allowArtifacts;
      if (slot === 'spreadsheet') return allowSpreadsheet;
      return allowUpload;
    });

    if (latestFailedEntry) {
      return {
        slot: latestFailedEntry.slot,
        dryRun: latestFailedEntry.slot === 'upload' ? latestFailedEntry.dryRun : false,
        label: latestFailedEntry.slot === 'upload' && latestFailedEntry.dryRun
          ? 'Retry Failed Dry Run'
          : `Retry Failed ${slotLabel(latestFailedEntry.slot)}`,
        note: latestFailedEntry.error || latestFailedEntry.summary,
      };
    }

    let lastSuccessfulIndex = -1;
    orderedSlots.forEach((slot, index) => {
      if (successfulSlots.has(slot)) lastSuccessfulIndex = index;
    });

    const nextSlot = orderedSlots[lastSuccessfulIndex + 1];
    if (!nextSlot) return null;

    return {
      slot: nextSlot,
      dryRun: false,
      label: 'Continue From Last Good Step',
      note: `Next step: ${slotLabel(nextSlot)}`,
    };
  }, [allowArtifacts, allowSpreadsheet, allowUpload, latestFailedEntry, successfulSlots]);

  const runRecoveryAction = useCallback(async () => {
    if (!recoveryAction) return;
    if (recoveryAction.slot === 'artifacts') return startArtifacts();
    if (recoveryAction.slot === 'spreadsheet') return startSpreadsheet();
    return startUpload(recoveryAction.dryRun);
  }, [recoveryAction, startArtifacts, startSpreadsheet, startUpload]);

  const auditSummary = useMemo(() => ({
    completed: visibleAuditEntries.filter(e => e.status === 'completed').length,
    failed: visibleAuditEntries.filter(e => e.status === 'failed').length,
    running: visibleAuditEntries.filter(e => e.status === 'running' || e.status === 'queued').length,
  }), [visibleAuditEntries]);

  return {
    agentUrl,
    agentStatus,
    agentInfo,
    options,
    setOptions,
    checkAgent,
    busy,
    deployReady,
    titleReady,
    questionsReady,
    startingAction,
    startArtifacts,
    startSpreadsheet,
    startUpload,
    artifactsJob,
    spreadsheetJob,
    uploadJob,
    visibleAuditEntries,
    recoveryAction,
    runRecoveryAction,
    auditSummary,
  };
}
