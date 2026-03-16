import { useCallback, useState } from 'react';
import { cn } from '../../lib/utils';
import { VideoScript, VideoPipelineStage } from '../../types/video';
import { ToastApi } from '../../types';
import { useHubNavigation } from '../../hooks/useHubNavigation';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useMveAgent } from '../../hooks/useMveAgent';
import { VideoLibrary } from './VideoLibrary';
import { VideoDetailPanel, VideoDetailSheet } from './VideoDetailSheet';
import { VideoAgentBar } from './VideoAgentBar';
import { VideoRenderPanel } from './VideoRenderPanel';

interface VideoHubProps {
  videoScripts: VideoScript[];
  setVideoScripts: (updater: (prev: VideoScript[]) => VideoScript[]) => void;
  onUpdateVideoScript: (id: string, updates: Partial<VideoScript>) => Promise<void>;
  onDeleteVideoScript: (id: string) => Promise<void> | void;
  onTogglePipeline: (id: string, stage: VideoPipelineStage) => Promise<void>;
  onBulkPipeline: (id: string, value: boolean) => Promise<void>;
  toast: ToastApi;
}

export function VideoHub({
  videoScripts, setVideoScripts, onUpdateVideoScript, onDeleteVideoScript,
  onTogglePipeline, onBulkPipeline, toast,
}: VideoHubProps) {
  const {
    selectedId, setSelectedId, selectedItem, setVisibleIds,
    handleCopy, handleNavigate, handleSelect, canNavigatePrev, canNavigateNext,
  } = useHubNavigation({ items: videoScripts, toast });

  const agent = useMveAgent(videoScripts, setVideoScripts, toast);
  const [showJobs, setShowJobs] = useState(false);

  const handleDelete = useCallback(async (id: string) => {
    await onDeleteVideoScript(id);
    if (selectedId === id) setSelectedId(null);
  }, [onDeleteVideoScript, selectedId, setSelectedId]);

  const detailProps = {
    item: selectedItem,
    onClose: () => setSelectedId(null),
    onDelete: handleDelete,
    onCopy: handleCopy,
    onTogglePipeline,
    onBulkPipeline,
    onNavigate: handleNavigate,
    canNavigatePrev,
    canNavigateNext,
    agent,
  };

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const showDesktopSplit = isDesktop && !!selectedItem;

  return (
    <div
      className={cn(
        showDesktopSplit ? 'flex flex-col gap-6' : 'space-y-6',
      )}
      style={showDesktopSplit ? { height: 'calc(100vh - 4rem)' } : undefined}
    >
      {/* Header */}
      <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', showDesktopSplit && 'lg:shrink-0')}>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Projects</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Video Hub</h2>
          <p className="text-sm text-slate-500 max-w-lg">
            Browse and manage math video scripts across all exam boards.
          </p>
        </div>
      </div>

      {/* Agent status bar */}
      <VideoAgentBar
        connected={agent.connected}
        status={agent.status}
        jobs={agent.jobs}
        syncing={agent.syncing}
        onSync={() => agent.syncFromAgent()}
        onToggleJobs={() => setShowJobs(v => !v)}
      />

      {/* Jobs panel (toggle) */}
      {showJobs && agent.jobs.length > 0 && (
        <VideoRenderPanel
          jobs={agent.jobs}
          onCancel={agent.cancelJob}
          onClose={() => setShowJobs(false)}
        />
      )}

      {showDesktopSplit ? (
        <div className="flex gap-6 flex-1 min-h-0">
          <div className="flex-1 min-w-0 min-h-0 pr-1">
            <VideoLibrary
              items={videoScripts}
              selectedId={selectedId}
              onSelect={handleSelect}
              onVisibleIdsChange={setVisibleIds}
            />
          </div>
          <VideoDetailPanel {...detailProps} />
        </div>
      ) : (
        <VideoLibrary
          items={videoScripts}
          selectedId={selectedId}
          onSelect={handleSelect}
          onVisibleIdsChange={setVisibleIds}
        />
      )}

      {!showDesktopSplit && <VideoDetailSheet {...detailProps} />}
    </div>
  );
}
