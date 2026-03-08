import { CheckCircle2, Copy, ExternalLink, FileDown, FileText, History, LoaderCircle, RefreshCcw, Rocket, RotateCcw, Terminal, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDeployState, asRecord, asString, isRunningJob, DeployAuditEntry, DeployJobSlot, formatTimestamp, slotLabel, statusClasses } from '../../hooks/useDeployState';
import { KahootDeployOptions, LocalAgentJob, localAgentService } from '../../services/localAgentService';
import { KahootItem } from '../../types';

// --- Sub-components ---

interface LocalFileLinks {
  openHref?: string;
  downloadHref?: string;
}

function getLocalFileLinks(agentUrl: string, filePath?: string): LocalFileLinks {
  if (!filePath) return {};
  return {
    openHref: localAgentService.getFileUrl(agentUrl, filePath, false),
    downloadHref: localAgentService.getFileUrl(agentUrl, filePath, true),
  };
}

function ValueRow({
  label,
  value,
  onCopy,
  external = false,
  openHref,
  downloadHref,
}: {
  label: string;
  value?: string;
  onCopy: (value: string, label: string) => void;
  external?: boolean;
  openHref?: string;
  downloadHref?: string;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-1 break-all font-mono text-xs text-slate-600">{value}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {openHref && (
          <a href={openHref} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600" title={external ? `Open ${label}` : `Open ${label} from local agent`}>
            <ExternalLink size={14} />
          </a>
        )}
        {downloadHref && (
          <a href={downloadHref} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title={`Download ${label}`}>
            <FileDown size={14} />
          </a>
        )}
        <button type="button" onClick={() => onCopy(value, label)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" title={`Copy ${label}`}>
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function JobCard({ title, job, onCopy, agentUrl }: { title: string; job: LocalAgentJob; onCopy: (value: string, label: string) => void; agentUrl: string }) {
  const result = asRecord(job.result);
  const artifacts = asRecord(result.artifacts);
  const sync = asRecord(result.sync);
  const upload = asRecord(result.upload);
  const uploaded = upload.uploaded === true || result.dry_run === true || job.status === 'completed';
  const running = isRunningJob(job);

  const listingCopyPath = asString(result.listing_copy_path) || asString(artifacts.listing_copy_path);
  const questionSetPath = asString(result.question_set_path) || asString(artifacts.question_set_path);
  const coverSvgPath = asString(result.cover_svg_path) || asString(artifacts.cover_svg_path);
  const metadataPromptPath = asString(result.metadata_prompt_path);
  const uploadManifestPath = asString(result.upload_manifest_path);
  const buildManifestPath = asString(result.build_manifest_path) || asString(result.builder_manifest_path);
  const xlsxPath = asString(result.xlsx_path);
  const challengeUrl = asString(result.challenge_url);
  const creatorUrl = asString(result.creator_url);
  const openCreatorUrl = asString(result.open_creator_url);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          {job.status === 'completed' && <CheckCircle2 size={16} className="text-emerald-500" />}
          {job.status === 'failed' && <XCircle size={16} className="text-rose-500" />}
          {running && <LoaderCircle size={16} className="animate-spin text-indigo-500" />}
          <p className="text-sm font-bold text-slate-900">{title}</p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {job.meta?.dry_run ? 'Dry Run' : job.status}
        </span>
      </div>

      <div className="space-y-1 px-4 py-3">
        {job.error && <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{job.error}</div>}
        <ValueRow label="Artifact Dir" value={asString(result.artifact_dir)} onCopy={onCopy} />
        <ValueRow label="Listing Copy" value={listingCopyPath} onCopy={onCopy} {...getLocalFileLinks(agentUrl, listingCopyPath)} />
        <ValueRow label="Question Set" value={questionSetPath} onCopy={onCopy} {...getLocalFileLinks(agentUrl, questionSetPath)} />
        <ValueRow label="Cover SVG" value={coverSvgPath} onCopy={onCopy} {...getLocalFileLinks(agentUrl, coverSvgPath)} />
        <ValueRow label="Metadata Prompt" value={metadataPromptPath} onCopy={onCopy} {...getLocalFileLinks(agentUrl, metadataPromptPath)} />
        <ValueRow label="Upload Manifest" value={uploadManifestPath} onCopy={onCopy} {...getLocalFileLinks(agentUrl, uploadManifestPath)} />
        <ValueRow label="Build Manifest" value={buildManifestPath} onCopy={onCopy} {...getLocalFileLinks(agentUrl, buildManifestPath)} />
        <ValueRow label="XLSX" value={xlsxPath} onCopy={onCopy} {...getLocalFileLinks(agentUrl, xlsxPath)} />
        <ValueRow label="Play Link" value={challengeUrl} onCopy={onCopy} openHref={challengeUrl || undefined} external />
        <ValueRow label="Creator Link" value={creatorUrl} onCopy={onCopy} openHref={creatorUrl || undefined} external />
        <ValueRow label="Open Creator" value={openCreatorUrl} onCopy={onCopy} openHref={openCreatorUrl || undefined} external />
        {sync.synced === true && <p className="pt-1 text-xs font-semibold text-emerald-600">Website sync completed</p>}
        {uploaded && job.type === 'kahoot-upload' && sync.synced !== true && <p className="pt-1 text-xs font-semibold text-slate-500">Upload finished</p>}
      </div>

      <div className="max-h-56 overflow-y-auto border-t border-slate-100 bg-slate-950 px-4 py-3">
        {(job.logs || []).map((line, index) => (
          <div key={`${line.at}-${index}`} className="font-mono text-[11px] leading-5 text-slate-200">
            <span className={line.stream === 'stderr' ? 'text-rose-300' : 'text-emerald-300'}>[{line.stream}]</span> {line.message}
          </div>
        ))}
        {(!job.logs || job.logs.length === 0) && <p className="font-mono text-[11px] text-slate-500">Waiting for output...</p>}
      </div>
    </div>
  );
}

function AuditEntryRow({ entry, agentUrl, onCopy }: { entry: DeployAuditEntry; agentUrl: string; onCopy: (value: string, label: string) => void }) {
  const primaryFilePath = entry.xlsxPath || entry.listingCopyPath || entry.questionSetPath || entry.uploadManifestPath || entry.buildManifestPath || entry.metadataPromptPath || entry.coverSvgPath;
  const primaryFileLabel = entry.xlsxPath ? 'XLSX' : entry.listingCopyPath ? 'Listing Copy' : entry.questionSetPath ? 'Question Set' : entry.uploadManifestPath ? 'Upload Manifest' : entry.buildManifestPath ? 'Build Manifest' : entry.metadataPromptPath ? 'Metadata Prompt' : entry.coverSvgPath ? 'Cover SVG' : '';
  const primaryUrl = entry.challengeUrl || entry.creatorUrl || entry.openCreatorUrl;
  const primaryUrlLabel = entry.challengeUrl ? 'Play Link' : entry.creatorUrl ? 'Creator Link' : entry.openCreatorUrl ? 'Open Creator' : '';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-slate-900">{slotLabel(entry.slot)}</p>
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', statusClasses(entry.status))}>
              {entry.dryRun && entry.status === 'completed' ? 'dry run' : entry.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{entry.summary}</p>
          <p className="mt-1 text-[11px] text-slate-400">{formatTimestamp(entry.finishedAt || entry.startedAt || entry.createdAt)}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {primaryFilePath && (
            <>
              <a href={localAgentService.getFileUrl(agentUrl, primaryFilePath, false)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                <ExternalLink size={12} /> Open {primaryFileLabel}
              </a>
              <a href={localAgentService.getFileUrl(agentUrl, primaryFilePath, true)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                <FileDown size={12} /> Download
              </a>
            </>
          )}
          {primaryUrl && (
            <>
              <a href={primaryUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                <ExternalLink size={12} /> Open {primaryUrlLabel}
              </a>
              <button type="button" onClick={() => onCopy(primaryUrl, primaryUrlLabel)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                <Copy size={12} /> Copy
              </button>
            </>
          )}
        </div>
      </div>
      {entry.error && <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{entry.error}</div>}
    </div>
  );
}

// --- Main component ---

interface KahootDeploySectionProps {
  item: KahootItem;
  onCopy: (value: string, label: string) => void;
  onPersistItem?: (id: string, updates: Partial<KahootItem>) => Promise<void> | void;
  allowArtifacts?: boolean;
  allowSpreadsheet?: boolean;
  allowUpload?: boolean;
  title?: string;
  description?: string;
}

export function KahootDeploySection({
  item,
  onCopy,
  onPersistItem,
  allowArtifacts = true,
  allowSpreadsheet = true,
  allowUpload = true,
  title = 'Deploy Pipeline',
  description = 'Run each step from the dashboard: export Markdown, build the import Excel, then upload via the local agent.',
}: KahootDeploySectionProps) {
  const deploy = useDeployState({ item, onPersistItem, allowArtifacts, allowSpreadsheet, allowUpload });

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      {/* Agent status */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={cn(
              'h-2.5 w-2.5 rounded-full',
              deploy.agentStatus === 'online' ? 'bg-emerald-500' : deploy.agentStatus === 'offline' ? 'bg-rose-500' : deploy.agentStatus === 'checking' ? 'animate-pulse bg-amber-500' : 'bg-slate-300',
            )} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Local Agent</p>
              <p className="truncate text-xs text-slate-400">{deploy.agentInfo || deploy.agentUrl}</p>
            </div>
          </div>
          <button type="button" onClick={() => void deploy.checkAgent()} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-slate-300 hover:text-slate-700">
            <RefreshCcw size={14} />
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ['use_ai_fill', 'AI-fill missing metadata'],
            ['sync_website', 'Sync website after upload'],
            ['update_listing', 'Update website listing files'],
            ['manual_fallback', 'Allow manual browser fallback'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(deploy.options[key as keyof KahootDeployOptions])}
                onChange={event => deploy.setOptions(prev => ({ ...prev, [key]: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Make sure <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">npm run agent:local</code> is running on this machine.
        </p>
      </div>

      {/* Readiness check */}
      {!deploy.deployReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {!deploy.titleReady && !deploy.questionsReady
            ? 'Add a Kahoot title and at least one question before running export, spreadsheet, or upload jobs.'
            : !deploy.titleReady
              ? 'Add a Kahoot title before running export, spreadsheet, or upload jobs.'
              : 'Add at least one question before running export, spreadsheet, or upload jobs.'}
        </div>
      )}

      {/* Recovery action */}
      {deploy.recoveryAction && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Quick Recovery</p>
              <p className="text-sm font-bold text-slate-900">{deploy.recoveryAction.label}</p>
              <p className="text-sm text-slate-500">{deploy.recoveryAction.note}</p>
            </div>
            <button
              type="button"
              onClick={() => void deploy.runRecoveryAction()}
              disabled={!deploy.deployReady || deploy.busy || deploy.agentStatus !== 'online'}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={15} />
              {deploy.recoveryAction.label}
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        {allowArtifacts && (
          <button type="button" onClick={() => void deploy.startArtifacts()} disabled={!deploy.deployReady || deploy.busy || deploy.agentStatus !== 'online'} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
            {deploy.startingAction === 'artifacts' ? <LoaderCircle size={15} className="animate-spin" /> : <FileText size={15} />}
            Export MD
          </button>
        )}
        {allowSpreadsheet && (
          <button type="button" onClick={() => void deploy.startSpreadsheet()} disabled={!deploy.deployReady || deploy.busy || deploy.agentStatus !== 'online'} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
            {deploy.startingAction === 'spreadsheet' ? <LoaderCircle size={15} className="animate-spin" /> : <FileDown size={15} />}
            Build Excel
          </button>
        )}
        {allowUpload && (
          <button type="button" onClick={() => void deploy.startUpload(true)} disabled={!deploy.deployReady || deploy.busy || deploy.agentStatus !== 'online'} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40">
            {deploy.startingAction === 'dry-run-upload' ? <LoaderCircle size={15} className="animate-spin" /> : <Terminal size={15} />}
            Dry Run Upload
          </button>
        )}
        {allowUpload && (
          <button type="button" onClick={() => void deploy.startUpload(false)} disabled={!deploy.deployReady || deploy.busy || deploy.agentStatus !== 'online'} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">
            {deploy.startingAction === 'upload' ? <LoaderCircle size={15} className="animate-spin" /> : <Rocket size={15} />}
            Upload
          </button>
        )}
      </div>

      {/* Active job cards */}
      <div className="space-y-3">
        {allowArtifacts && deploy.artifactsJob && <JobCard title="Export MD" job={deploy.artifactsJob} onCopy={onCopy} agentUrl={deploy.agentUrl} />}
        {allowSpreadsheet && deploy.spreadsheetJob && <JobCard title="Build Excel" job={deploy.spreadsheetJob} onCopy={onCopy} agentUrl={deploy.agentUrl} />}
        {allowUpload && deploy.uploadJob && <JobCard title="Upload" job={deploy.uploadJob} onCopy={onCopy} agentUrl={deploy.agentUrl} />}
      </div>

      {/* Audit log */}
      {deploy.visibleAuditEntries.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-400" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Audit Log</p>
                <p className="text-sm text-slate-500">{deploy.auditSummary.completed} completed, {deploy.auditSummary.failed} failed, {deploy.auditSummary.running} active</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {deploy.visibleAuditEntries.map(entry => (
              <AuditEntryRow key={entry.jobId} entry={entry} agentUrl={deploy.agentUrl} onCopy={onCopy} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
