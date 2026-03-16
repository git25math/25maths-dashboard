/**
 * Hook for MVE Agent connection state, data sync, and job management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoScript } from '../types/video';
import { mveAgent, AgentJob, AgentStatus } from '../services/mveAgentService';
import { ToastApi } from '../types';

const PING_INTERVAL = 5_000;
const SSE_RECONNECT_DELAY = 3_000;

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
  const hasAutoSynced = useRef(false);
  const prevConnected = useRef(false);

  // Ping agent periodically
  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const ok = await mveAgent.ping();
      if (mounted) {
        setConnected(ok);
        if (ok) {
          try {
            const s = await mveAgent.getStatus();
            setStatus(s);
          } catch {
            // status fetch failed, keep connected true from ping
          }
        } else {
          setStatus(null);
        }
      }
    };

    check();
    const timer = setInterval(check, PING_INTERVAL);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  // Auto-sync on first connection
  useEffect(() => {
    if (connected && !prevConnected.current && !hasAutoSynced.current) {
      hasAutoSynced.current = true;
      // Delay slightly to let UI render the connected state first
      setTimeout(() => syncFromAgentInternal('cie'), 500);
    }
    prevConnected.current = connected;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // SSE connection with auto-reconnect
  useEffect(() => {
    if (!connected) {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      if (sseReconnectTimer.current) {
        clearTimeout(sseReconnectTimer.current);
        sseReconnectTimer.current = null;
      }
      return;
    }

    const connectSSE = () => {
      const es = mveAgent.connectSSE((event) => {
        const jobId = (event as Record<string, unknown>).job_id as string | undefined;
        if (!jobId) return;

        if (event.type === 'job_completed' || event.type === 'job_failed' || event.type === 'job_cancelled') {
          mveAgent.getJobs().then(setJobs).catch(() => {});
          if (event.type === 'job_completed') {
            toast.success('Job completed');
          } else if (event.type === 'job_failed') {
            toast.error(`Job failed: ${(event as Record<string, unknown>).error || 'unknown'}`);
          }
        } else if (event.type === 'job_started' || event.type === 'job_created') {
          mveAgent.getJobs().then(setJobs).catch(() => {});
        }
      });

      // Auto-reconnect on error
      es.onerror = () => {
        es.close();
        sseRef.current = null;
        sseReconnectTimer.current = setTimeout(() => {
          if (connected) connectSSE();
        }, SSE_RECONNECT_DELAY);
      };

      sseRef.current = es;
    };

    connectSSE();

    // Initial jobs fetch
    mveAgent.getJobs().then(setJobs).catch(() => {});

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      if (sseReconnectTimer.current) {
        clearTimeout(sseReconnectTimer.current);
        sseReconnectTimer.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, toast]);

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

      toast.success(`Synced ${agentScripts.length} scripts from agent`);
    } catch (err) {
      toast.error(`Sync failed: ${err instanceof Error ? err.message : 'unknown'}`);
    } finally {
      setSyncing(false);
    }
  }, [setVideoScripts, toast]);

  // Public sync (checks connection)
  const syncFromAgent = useCallback(async (board = 'cie') => {
    if (!connected) return;
    await syncFromAgentInternal(board);
  }, [connected, syncFromAgentInternal]);

  // Submit jobs
  const submitRender = useCallback(async (scriptId: string, quality = '1080p', lang = 'en', board = 'cie') => {
    const { job_id } = await mveAgent.submitJob('render', { script_id: scriptId, quality, lang, board });
    toast.success(`Render job started: ${job_id}`);
    mveAgent.getJobs().then(setJobs).catch(() => {});
    return job_id;
  }, [toast]);

  const submitValidate = useCallback(async (path?: string) => {
    const { job_id } = await mveAgent.submitJob('validate', { path });
    toast.success(`Validate job started: ${job_id}`);
    mveAgent.getJobs().then(setJobs).catch(() => {});
    return job_id;
  }, [toast]);

  const submitCover = useCallback(async (scriptId: string, board = 'cie') => {
    const { job_id } = await mveAgent.submitJob('cover', { script_id: scriptId, board });
    toast.success(`Cover job started: ${job_id}`);
    mveAgent.getJobs().then(setJobs).catch(() => {});
    return job_id;
  }, [toast]);

  const submitPublishMeta = useCallback(async (scriptId: string, board = 'cie') => {
    const { job_id } = await mveAgent.submitJob('publish-meta', { script_id: scriptId, board });
    toast.success(`Metadata job started: ${job_id}`);
    mveAgent.getJobs().then(setJobs).catch(() => {});
    return job_id;
  }, [toast]);

  const cancelJob = useCallback(async (jobId: string) => {
    await mveAgent.cancelJob(jobId);
    mveAgent.getJobs().then(setJobs).catch(() => {});
  }, []);

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
