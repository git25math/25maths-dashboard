/**
 * Hook for MVE Agent connection state, data sync, and job management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoScript } from '../types/video';
import { mveAgent, AgentJob, AgentStatus } from '../services/mveAgentService';
import { ToastApi } from '../types';

const PING_INTERVAL = 5_000;
const SSE_RECONNECT_BASE = 3_000;
const SSE_RECONNECT_MAX = 30_000;
const JOB_REFRESH_DEBOUNCE = 500;

export function useMveAgent(
  videoScripts: VideoScript[],
  setVideoScripts: (updater: (prev: VideoScript[]) => VideoScript[]) => void,
  toast: ToastApi,
) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [jobs, setJobs] = useState<AgentJob[]>([]);
  const [syncing, setSyncing] = useState(false);

  const sseRef = useRef<EventSource | null>(null);
  const sseReconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sseReconnectAttempts = useRef(0);
  const hasAutoSynced = useRef(false);
  const connectedRef = useRef(false);
  const mountedRef = useRef(true);
  const jobRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Ping agent periodically
  useEffect(() => {
    const check = async () => {
      const ok = await mveAgent.ping();
      if (!mountedRef.current) return;
      connectedRef.current = ok;
      setConnected(ok);
      if (ok) {
        try {
          const s = await mveAgent.getStatus();
          if (mountedRef.current) setStatus(s);
        } catch {
          // keep connected true from ping
        }
      } else {
        setStatus(null);
      }
    };

    check();
    const timer = setInterval(check, PING_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // Auto-sync on first connection
  useEffect(() => {
    if (connected && !hasAutoSynced.current) {
      hasAutoSynced.current = true;
      const t = setTimeout(() => {
        if (mountedRef.current && connectedRef.current) {
          syncFromAgentInternal('cie');
        }
      }, 500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // Debounced job refresh
  const refreshJobs = useCallback(() => {
    if (jobRefreshTimer.current) clearTimeout(jobRefreshTimer.current);
    jobRefreshTimer.current = setTimeout(() => {
      mveAgent.getJobs().then(j => {
        if (mountedRef.current) setJobs(j);
      }).catch(() => {});
    }, JOB_REFRESH_DEBOUNCE);
  }, []);

  // SSE connection — only reconnect on connected transitions, not every ping
  useEffect(() => {
    if (!connected) {
      closeSse();
      return;
    }

    connectSSE();

    // Initial jobs fetch
    mveAgent.getJobs().then(j => {
      if (mountedRef.current) setJobs(j);
    }).catch(() => {});

    return () => closeSse();

    function connectSSE() {
      closeSse();
      sseReconnectAttempts.current = 0;

      const es = mveAgent.connectSSE((event) => {
        if (!mountedRef.current) return;
        const ev = event as Record<string, unknown>;
        const jobId = ev.job_id as string | undefined;
        if (!jobId) return;

        if (event.type === 'job_completed' || event.type === 'job_failed' || event.type === 'job_cancelled') {
          refreshJobs();
          if (event.type === 'job_completed') {
            toastRef.current.success('Job completed');
          } else if (event.type === 'job_failed') {
            toastRef.current.error(`Job failed: ${ev.error || 'unknown'}`);
          }
        } else if (event.type === 'job_started' || event.type === 'job_created') {
          refreshJobs();
        }
        // job_log events are intentionally NOT triggering a full refresh
      });

      es.onerror = () => {
        es.close();
        sseRef.current = null;
        // Exponential backoff with jitter
        const attempt = sseReconnectAttempts.current++;
        const delay = Math.min(SSE_RECONNECT_BASE * Math.pow(1.5, attempt), SSE_RECONNECT_MAX);
        const jitter = delay * 0.2 * Math.random();
        sseReconnectTimer.current = setTimeout(() => {
          if (mountedRef.current && connectedRef.current) {
            connectSSE();
          }
        }, delay + jitter);
      };

      // Reset backoff on successful open
      es.onopen = () => {
        sseReconnectAttempts.current = 0;
      };

      sseRef.current = es;
    }

    function closeSse() {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      if (sseReconnectTimer.current) {
        clearTimeout(sseReconnectTimer.current);
        sseReconnectTimer.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // Core sync implementation
  const syncFromAgentInternal = useCallback(async (board: string) => {
    setSyncing(true);
    try {
      const agentScripts = await mveAgent.getScripts(board);

      setVideoScripts((prev) => {
        const existingById = new Map(prev.map(s => [s.id, s]));
        const merged: VideoScript[] = [];

        for (const as of agentScripts) {
          const existing = existingById.get(as.id);
          if (existing) {
            merged.push({
              ...existing,
              ...as,
              pipeline: as.pipeline,
              created_at: existing.created_at,
              updated_at: new Date().toISOString(),
            });
            existingById.delete(as.id);
          } else {
            merged.push(as);
          }
        }

        // Keep scripts from other boards
        for (const remaining of existingById.values()) {
          if (remaining.board !== board) {
            merged.push(remaining);
          }
        }

        return merged;
      });

      toastRef.current.success(`Synced ${agentScripts.length} scripts from agent`);
    } catch (err) {
      toastRef.current.error(`Sync failed: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      if (mountedRef.current) setSyncing(false);
    }
  }, [setVideoScripts]);

  // Public sync (checks connection)
  const syncFromAgent = useCallback(async (board = 'cie') => {
    if (!connectedRef.current) return;
    await syncFromAgentInternal(board);
  }, [syncFromAgentInternal]);

  // Submit jobs — all check connection first
  const submitRender = useCallback(async (scriptId: string, quality = '1080p', lang = 'en', board = 'cie') => {
    if (!connectedRef.current) throw new Error('Agent not connected');
    const { job_id } = await mveAgent.submitJob('render', { script_id: scriptId, quality, lang, board });
    toastRef.current.success(`Render job started: ${job_id}`);
    refreshJobs();
    return job_id;
  }, [refreshJobs]);

  const submitValidate = useCallback(async (path?: string) => {
    if (!connectedRef.current) throw new Error('Agent not connected');
    const { job_id } = await mveAgent.submitJob('validate', { path });
    toastRef.current.success(`Validate job started: ${job_id}`);
    refreshJobs();
    return job_id;
  }, [refreshJobs]);

  const submitCover = useCallback(async (scriptId: string, board = 'cie') => {
    if (!connectedRef.current) throw new Error('Agent not connected');
    const { job_id } = await mveAgent.submitJob('cover', { script_id: scriptId, board });
    toastRef.current.success(`Cover job started: ${job_id}`);
    refreshJobs();
    return job_id;
  }, [refreshJobs]);

  const submitPublishMeta = useCallback(async (scriptId: string, board = 'cie') => {
    if (!connectedRef.current) throw new Error('Agent not connected');
    const { job_id } = await mveAgent.submitJob('publish-meta', { script_id: scriptId, board });
    toastRef.current.success(`Metadata job started: ${job_id}`);
    refreshJobs();
    return job_id;
  }, [refreshJobs]);

  const cancelJob = useCallback(async (jobId: string) => {
    await mveAgent.cancelJob(jobId);
    refreshJobs();
  }, [refreshJobs]);

  return {
    connected,
    status,
    jobs,
    syncing,
    syncFromAgent,
    submitRender,
    submitValidate,
    submitCover,
    submitPublishMeta,
    cancelJob,
  };
}
