import { useCallback, useMemo, useState } from 'react';
import { useHubNavigation } from '../../hooks/useHubNavigation';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { buildPayhipHealthAutoFix, hasPayhipHealthAutoFix, isPayhipPipelineStageLocked, PAYHIP_HEALTH_META, PAYHIP_QUEUE_META, PAYHIP_STATUS_LABELS, PayhipHealthKey, PayhipQueueKey } from '../../lib/payhipUtils';
import { cn } from '../../lib/utils';
import { PAYHIP_PIPELINE_STAGES, PayhipItem, PayhipPipelineStage, PayhipStatus, ToastApi } from '../../types';
import { PayhipLibrary } from './PayhipLibrary';
import { PayhipDetailPanel, PayhipDetailSheet } from './PayhipDetailSheet';

interface PayhipUpdateOptions {
  silent?: boolean;
  successMessage?: string;
}

interface PayhipHubProps {
  payhipItems: PayhipItem[];
  onUpdatePayhip: (id: string, updates: Partial<PayhipItem>, options?: PayhipUpdateOptions) => Promise<void>;
  onTogglePipeline: (id: string, stage: PayhipPipelineStage) => Promise<void>;
  onBulkPipeline: (id: string, value: boolean) => Promise<void>;
  toast: ToastApi;
}

export function PayhipHub({ payhipItems, onUpdatePayhip, onTogglePipeline, onBulkPipeline, toast }: PayhipHubProps) {
  const [advancingQueue, setAdvancingQueue] = useState<PayhipQueueKey | null>(null);
  const [resolvingHealth, setResolvingHealth] = useState<PayhipHealthKey | null>(null);
  const [batchingVisible, setBatchingVisible] = useState(false);

  const {
    selectedId, setSelectedId, selectedItem, navigationIds, setVisibleIds,
    handleCopy, handleNavigate, handleSelect, canNavigatePrev, canNavigateNext,
  } = useHubNavigation({ items: payhipItems, toast });

  const visibleItems = useMemo(
    () => navigationIds.map(id => payhipItems.find(item => item.id === id)).filter(Boolean) as PayhipItem[],
    [navigationIds, payhipItems],
  );

  const handleOpenFirstVisible = useCallback(() => {
    if (visibleItems.length === 0) {
      toast.error('No visible Payhip listings to open');
      return;
    }
    setSelectedId(visibleItems[0].id);
  }, [toast, visibleItems, setSelectedId]);

  const handleAdvanceQueue = useCallback(async (queue: PayhipQueueKey, ids: string[]) => {
    const targets = ids
      .map(id => payhipItems.find(item => item.id === id))
      .filter(Boolean) as PayhipItem[];

    if (targets.length === 0) {
      toast.error('No visible Payhip listings to update');
      return;
    }

    const meta = PAYHIP_QUEUE_META[queue];
    setAdvancingQueue(queue);

    try {
      for (const item of targets) {
        await onUpdatePayhip(item.id, {
          pipeline: {
            ...item.pipeline,
            [meta.stage]: true,
          },
        }, { silent: true });
      }
      toast.success(`Marked ${targets.length} listing${targets.length === 1 ? '' : 's'} as ${meta.successLabel}`);
    } catch {
      toast.error(`Failed to advance ${meta.label.toLowerCase()}`);
    } finally {
      setAdvancingQueue(null);
    }
  }, [onUpdatePayhip, payhipItems, toast]);

  const handleResolveHealth = useCallback(async (health: PayhipHealthKey, ids: string[]) => {
    if (!hasPayhipHealthAutoFix(health)) {
      toast.error('This health alert requires manual review');
      return;
    }

    const meta = PAYHIP_HEALTH_META[health];
    const targets = ids
      .map(id => payhipItems.find(item => item.id === id))
      .filter(Boolean) as PayhipItem[];

    if (targets.length === 0) {
      toast.error('No visible Payhip listings to update');
      return;
    }

    setResolvingHealth(health);

    try {
      for (const item of targets) {
        const updates = buildPayhipHealthAutoFix(item, health);
        if (!updates) continue;
        await onUpdatePayhip(item.id, updates, { silent: true });
      }
      toast.success(`Applied ${meta.successLabel} to ${targets.length} listing${targets.length === 1 ? '' : 's'}`);
    } catch {
      toast.error(`Failed to resolve ${meta.label.toLowerCase()}`);
    } finally {
      setResolvingHealth(null);
    }
  }, [onUpdatePayhip, payhipItems, toast]);

  const handleBatchStatus = useCallback(async (status: PayhipStatus, ids: string[]) => {
    const targets = ids
      .map(id => payhipItems.find(item => item.id === id))
      .filter(Boolean) as PayhipItem[];

    if (targets.length === 0) {
      toast.error('No visible Payhip listings to update');
      return;
    }

    setBatchingVisible(true);

    try {
      await Promise.all(targets.map(item => onUpdatePayhip(item.id, { status }, { silent: true })));
      toast.success(`Set ${targets.length} listing${targets.length === 1 ? '' : 's'} to ${PAYHIP_STATUS_LABELS[status]}`);
    } catch {
      toast.error('Failed to batch update Payhip status');
    } finally {
      setBatchingVisible(false);
    }
  }, [onUpdatePayhip, payhipItems, toast]);

  const handleBatchPipelineStage = useCallback(async (stage: PayhipPipelineStage, value: boolean, ids: string[]) => {
    const targets = ids
      .map(id => payhipItems.find(item => item.id === id))
      .filter(Boolean) as PayhipItem[];

    if (targets.length === 0) {
      toast.error('No visible Payhip listings to update');
      return;
    }

    const stageLabel = PAYHIP_PIPELINE_STAGES.find(entry => entry.key === stage)?.label || stage;
    const lockedTargets = !value ? targets.filter(item => isPayhipPipelineStageLocked(item, stage)) : [];
    const eligibleTargets = !value ? targets.filter(item => !isPayhipPipelineStageLocked(item, stage)) : targets;

    if (eligibleTargets.length === 0) {
      toast.error(`${stageLabel} is locked once a final Payhip URL exists`);
      return;
    }

    setBatchingVisible(true);

    try {
      await Promise.all(eligibleTargets.map(item => onUpdatePayhip(item.id, {
        pipeline: {
          ...item.pipeline,
          [stage]: value,
        },
      }, { silent: true })));

      const skippedMessage = lockedTargets.length > 0
        ? ` (${lockedTargets.length} locked by final URL skipped)`
        : '';

      toast.success(`${value ? 'Marked' : 'Reset'} ${stageLabel} for ${eligibleTargets.length} listing${eligibleTargets.length === 1 ? '' : 's'}${skippedMessage}`);
    } catch {
      toast.error(`Failed to update ${stageLabel.toLowerCase()}`);
    } finally {
      setBatchingVisible(false);
    }
  }, [onUpdatePayhip, payhipItems, toast]);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const showDesktopSplit = isDesktop && !!selectedItem;

  const detailProps = {
    item: selectedItem,
    onClose: () => setSelectedId(null),
    onCopy: handleCopy,
    onSave: onUpdatePayhip,
    onTogglePipeline,
    onBulkPipeline,
    onNavigate: handleNavigate,
    canNavigatePrev,
    canNavigateNext,
    onResolveHealth: (id: string, health: PayhipHealthKey) => handleResolveHealth(health, [id]),
  };

  const libraryNode = (
    <PayhipLibrary
      items={payhipItems}
      selectedId={selectedId}
      onSelect={handleSelect}
      onVisibleIdsChange={setVisibleIds}
      onOpenFirstVisible={handleOpenFirstVisible}
      onAdvanceQueue={handleAdvanceQueue}
      advancingQueue={advancingQueue}
      onResolveHealth={handleResolveHealth}
      resolvingHealth={resolvingHealth}
      onBatchStatus={handleBatchStatus}
      onBatchPipeline={handleBatchPipelineStage}
      batchingVisible={batchingVisible}
    />
  );

  const headerBar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Publishing</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Payhip Hub</h2>
        <p className="max-w-2xl text-sm text-slate-500">
          Track Kahoot Payhip listings across L1-L4, manage upload progress, and keep website catalog status aligned with Payhip.
        </p>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        showDesktopSplit ? 'flex flex-col gap-6' : 'space-y-6',
      )}
      style={showDesktopSplit ? { height: 'calc(100vh - 4rem)' } : undefined}
    >
      {headerBar}

      {showDesktopSplit ? (
        <div className="flex gap-6 flex-1 min-h-0">
          <div className="flex-1 min-w-0 overflow-y-auto pr-1">
            {libraryNode}
          </div>
          <PayhipDetailPanel {...detailProps} />
        </div>
      ) : (
        <>
          {libraryNode}
          <PayhipDetailSheet {...detailProps} />
        </>
      )}
    </div>
  );
}
