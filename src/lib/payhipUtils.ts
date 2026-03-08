import { PayhipItem, PayhipPipeline, PayhipPipelineStage, PayhipStatus } from '../types';

export const PAYHIP_SELLABLE_STATUSES: PayhipStatus[] = ['presale', 'live', 'free_sample_live'];

export const PAYHIP_STATUS_LABELS: Record<PayhipStatus, string> = {
  planned: 'Planned',
  presale: 'Presale',
  live: 'Live',
  archived: 'Archived',
  free_sample_live: 'Free Sample Live',
};

export type PayhipQueueKey = 'create' | 'backfill' | 'qa' | 'sync';
export type PayhipHealthKey = 'sellable_missing_url' | 'release_overdue' | 'live_without_qa' | 'status_sync_mismatch';

export const PAYHIP_URL_LOCKED_STAGES: PayhipPipelineStage[] = ['payhip_created', 'url_backfilled'];

export const PAYHIP_QUEUE_META: Record<PayhipQueueKey, {
  label: string;
  stage: PayhipPipelineStage;
  buttonLabel: string;
  successLabel: string;
  detail: string;
}> = {
  create: {
    label: 'Ready To Create',
    stage: 'payhip_created',
    buttonLabel: 'Mark Visible As Created',
    successLabel: 'Payhip Created',
    detail: 'Listings with copy and pricing ready, but still missing the actual Payhip product.',
  },
  backfill: {
    label: 'Need URL Backfill',
    stage: 'url_backfilled',
    buttonLabel: 'Mark Visible As URL Synced',
    successLabel: 'URL Synced',
    detail: 'Products already exist in Payhip, but the final product link has not been written back.',
  },
  qa: {
    label: 'Ready For QA',
    stage: 'qa_verified',
    buttonLabel: 'Mark Visible As QA Verified',
    successLabel: 'QA Verified',
    detail: 'Listings have a final URL and are waiting for a storefront and delivery sanity check.',
  },
  sync: {
    label: 'Ready To Sync',
    stage: 'site_synced',
    buttonLabel: 'Mark Visible As Site Synced',
    successLabel: 'Site Synced',
    detail: 'QA is complete and the website catalog still needs the current Payhip status and link synced back.',
  },
};

export const PAYHIP_HEALTH_META: Record<PayhipHealthKey, {
  label: string;
  detail: string;
  buttonLabel?: string;
  successLabel?: string;
}> = {
  sellable_missing_url: {
    label: 'Sellable Status Missing Final URL',
    detail: 'The listing is marked presale/live, but there is no final Payhip product URL on record.',
  },
  release_overdue: {
    label: 'Past Release / Not Synced',
    detail: 'The release date has passed and the dashboard still shows the website sync pipeline as incomplete.',
  },
  live_without_qa: {
    label: 'Live Without QA',
    detail: 'The listing is already live, but the QA verification step is still unchecked.',
    buttonLabel: 'Mark As QA Verified',
    successLabel: 'QA Verified',
  },
  status_sync_mismatch: {
    label: 'Live QA Done / Not Site Synced',
    detail: 'The listing is already live and QA is complete, but the website sync stage is still incomplete.',
    buttonLabel: 'Mark As Site Synced',
    successLabel: 'Site Synced',
  },
};

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayDateKey() {
  return formatDateKey(new Date());
}

export function isFinalPayhipProductUrl(url?: string) {
  return /payhip\.com\/b\//i.test(String(url || ''));
}

export function isSellablePayhipStatus(status?: string): status is PayhipStatus {
  return PAYHIP_SELLABLE_STATUSES.includes(status as PayhipStatus);
}

type PayhipPipelineFacts = Pick<PayhipItem, 'listing_title' | 'deliver_now' | 'deliver_on_release' | 'release_date' | 'payhip_url' | 'status'>;
type PayhipPipelineContext = PayhipPipelineFacts & Pick<PayhipItem, 'pipeline'>;

export function isPayhipPipelineStageLocked(item: Pick<PayhipItem, 'payhip_url'>, stage: PayhipPipelineStage) {
  return isFinalPayhipProductUrl(item.payhip_url) && PAYHIP_URL_LOCKED_STAGES.includes(stage);
}

export function buildDerivedPayhipPipeline(item: PayhipPipelineFacts, current?: Partial<PayhipPipeline>): PayhipPipeline {
  const finalProductUrl = isFinalPayhipProductUrl(item.payhip_url);

  return {
    matrix_ready: current?.matrix_ready ?? true,
    copy_ready: current?.copy_ready ?? Boolean(item.listing_title && item.deliver_now && item.deliver_on_release && item.release_date),
    payhip_created: finalProductUrl ? true : Boolean(current?.payhip_created),
    url_backfilled: finalProductUrl ? true : Boolean(current?.url_backfilled),
    qa_verified: Boolean(current?.qa_verified),
    site_synced: Boolean(current?.site_synced),
  };
}

export function getEffectivePayhipPipeline(item: PayhipPipelineContext): PayhipPipeline {
  return buildDerivedPayhipPipeline(item, item.pipeline);
}

export function mergePayhipPipeline(item: PayhipItem, updates: Partial<PayhipItem>): PayhipPipeline {
  const current = updates.pipeline || item.pipeline;
  const nextStatus = updates.status || item.status;
  const nextUrl = updates.payhip_url ?? item.payhip_url;
  const nextTitle = updates.listing_title || item.listing_title;
  const nextDeliverNow = updates.deliver_now || item.deliver_now;
  const nextDeliverOnRelease = updates.deliver_on_release || item.deliver_on_release;
  const nextReleaseDate = updates.release_date || item.release_date;

  const derived = buildDerivedPayhipPipeline({
    listing_title: nextTitle,
    deliver_now: nextDeliverNow,
    deliver_on_release: nextDeliverOnRelease,
    release_date: nextReleaseDate,
    payhip_url: nextUrl,
    status: nextStatus,
  }, current);

  const merged = {
    ...current,
    ...derived,
    ...(updates.pipeline || {}),
  };

  if (isFinalPayhipProductUrl(nextUrl)) {
    merged.payhip_created = true;
    merged.url_backfilled = true;
  }

  return merged;
}

export function matchesPayhipQueue(item: PayhipPipelineContext, queue: PayhipQueueKey) {
  const pipeline = getEffectivePayhipPipeline(item);

  switch (queue) {
    case 'create':
      return pipeline.copy_ready && !pipeline.payhip_created;
    case 'backfill':
      return pipeline.payhip_created && !pipeline.url_backfilled;
    case 'qa':
      return pipeline.url_backfilled && !pipeline.qa_verified;
    case 'sync':
      return pipeline.qa_verified && !pipeline.site_synced;
  }
}

export function matchesPayhipHealth(
  item: Pick<PayhipItem, 'pipeline' | 'listing_title' | 'deliver_now' | 'deliver_on_release' | 'status' | 'payhip_url' | 'release_date'>,
  health: PayhipHealthKey,
  todayKey = getTodayDateKey(),
) {
  const pipeline = getEffectivePayhipPipeline(item);
  const sellable = isSellablePayhipStatus(item.status);
  const finalUrl = isFinalPayhipProductUrl(item.payhip_url);

  switch (health) {
    case 'sellable_missing_url':
      return sellable && !finalUrl;
    case 'release_overdue':
      return Boolean(item.release_date) && item.release_date < todayKey && !pipeline.site_synced && item.status !== 'archived';
    case 'live_without_qa':
      return (item.status === 'live' || item.status === 'free_sample_live') && !pipeline.qa_verified;
    case 'status_sync_mismatch':
      return (item.status === 'live' || item.status === 'free_sample_live') && pipeline.qa_verified && !pipeline.site_synced;
  }
}

export interface PayhipNextAction {
  key: PayhipPipelineStage | 'complete';
  label: string;
  detail: string;
}

export interface PayhipHealthAlert {
  key: PayhipHealthKey;
  label: string;
  detail: string;
  buttonLabel?: string;
  successLabel?: string;
}

export function getPayhipHealthAlerts(
  item: Pick<PayhipItem, 'pipeline' | 'listing_title' | 'deliver_now' | 'deliver_on_release' | 'status' | 'payhip_url' | 'release_date'>,
  todayKey = getTodayDateKey(),
): PayhipHealthAlert[] {
  return (Object.keys(PAYHIP_HEALTH_META) as PayhipHealthKey[])
    .filter(key => matchesPayhipHealth(item, key, todayKey))
    .map(key => ({
      key,
      label: PAYHIP_HEALTH_META[key].label,
      detail: PAYHIP_HEALTH_META[key].detail,
      buttonLabel: PAYHIP_HEALTH_META[key].buttonLabel,
      successLabel: PAYHIP_HEALTH_META[key].successLabel,
    }));
}

export function hasPayhipHealthAutoFix(health: PayhipHealthKey) {
  return Boolean(PAYHIP_HEALTH_META[health].buttonLabel && PAYHIP_HEALTH_META[health].successLabel);
}

export function buildPayhipHealthAutoFix(
  item: Pick<PayhipItem, 'pipeline' | 'status'>,
  health: PayhipHealthKey,
): Partial<PayhipItem> | null {
  switch (health) {
    case 'live_without_qa':
      return {
        pipeline: {
          ...item.pipeline,
          qa_verified: true,
        },
      };
    case 'status_sync_mismatch':
      return {
        pipeline: {
          ...item.pipeline,
          site_synced: true,
        },
      };
    default:
      return null;
  }
}

export function getNextPayhipAction(
  item: Pick<PayhipItem, 'pipeline' | 'listing_title' | 'deliver_now' | 'deliver_on_release' | 'release_date' | 'status' | 'payhip_url'>,
): PayhipNextAction {
  const pipeline = getEffectivePayhipPipeline(item);

  if (!pipeline.matrix_ready) {
    return {
      key: 'matrix_ready',
      label: 'Confirm matrix row',
      detail: 'The listing matrix still needs a confirmed row before copy and pricing can move forward.',
    };
  }

  if (!pipeline.copy_ready) {
    return {
      key: 'copy_ready',
      label: 'Finish listing copy',
      detail: 'Complete the title, delivery copy, pricing, and release metadata before creating the product.',
    };
  }

  if (!pipeline.payhip_created) {
    return {
      key: 'payhip_created',
      label: 'Create product in Payhip',
      detail: 'The listing is ready for upload. Create the Payhip product and capture the working link.',
    };
  }

  if (!pipeline.url_backfilled) {
    return {
      key: 'url_backfilled',
      label: 'Backfill final Payhip URL',
      detail: 'Update the dashboard and website source data with the final Payhip product URL.',
    };
  }

  if (!pipeline.qa_verified) {
    return {
      key: 'qa_verified',
      label: 'Run QA verification',
      detail: 'Check pricing, delivery assets, release timing, and storefront copy before marking this listing verified.',
    };
  }

  if (!pipeline.site_synced) {
    return {
      key: 'site_synced',
      label: 'Sync website status',
      detail: 'Push the current Payhip status and final link back to the website so the catalog stays aligned.',
    };
  }

  return {
    key: 'complete',
    label: item.status === 'archived' ? 'Archive fully synced' : 'Listing fully synced',
    detail: 'No upload, QA, or website sync work is currently pending for this listing.',
  };
}
