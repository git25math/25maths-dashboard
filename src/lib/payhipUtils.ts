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
    detail: 'QA is complete and the website catalog still needs its final sync step.',
  },
};

export function isFinalPayhipProductUrl(url?: string) {
  return /payhip\.com\/b\//i.test(String(url || ''));
}

export function isSellablePayhipStatus(status?: string): status is PayhipStatus {
  return PAYHIP_SELLABLE_STATUSES.includes(status as PayhipStatus);
}

export function buildDerivedPayhipPipeline(item: Pick<PayhipItem, 'listing_title' | 'deliver_now' | 'deliver_on_release' | 'release_date' | 'payhip_url' | 'status'>, current?: PayhipPipeline): PayhipPipeline {
  const finalProductUrl = isFinalPayhipProductUrl(item.payhip_url);
  const sellable = isSellablePayhipStatus(item.status);

  return {
    matrix_ready: current?.matrix_ready ?? true,
    copy_ready: current?.copy_ready ?? Boolean(item.listing_title && item.deliver_now && item.deliver_on_release && item.release_date),
    payhip_created: Boolean(current?.payhip_created || finalProductUrl),
    url_backfilled: Boolean(current?.url_backfilled || finalProductUrl),
    qa_verified: Boolean(current?.qa_verified || (finalProductUrl && sellable)),
    site_synced: Boolean(current?.site_synced || sellable),
  };
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

  return {
    ...current,
    ...derived,
    ...(updates.pipeline || {}),
  };
}

export function matchesPayhipQueue(item: Pick<PayhipItem, 'pipeline'>, queue: PayhipQueueKey) {
  switch (queue) {
    case 'create':
      return item.pipeline.copy_ready && !item.pipeline.payhip_created;
    case 'backfill':
      return item.pipeline.payhip_created && !item.pipeline.url_backfilled;
    case 'qa':
      return item.pipeline.url_backfilled && !item.pipeline.qa_verified;
    case 'sync':
      return item.pipeline.qa_verified && !item.pipeline.site_synced;
  }
}

export interface PayhipNextAction {
  key: PayhipPipelineStage | 'complete';
  label: string;
  detail: string;
}

export function getNextPayhipAction(item: Pick<PayhipItem, 'pipeline' | 'status' | 'payhip_url'>): PayhipNextAction {
  if (!item.pipeline.matrix_ready) {
    return {
      key: 'matrix_ready',
      label: 'Confirm matrix row',
      detail: 'The listing matrix still needs a confirmed row before copy and pricing can move forward.',
    };
  }

  if (!item.pipeline.copy_ready) {
    return {
      key: 'copy_ready',
      label: 'Finish listing copy',
      detail: 'Complete the title, delivery copy, pricing, and release metadata before creating the product.',
    };
  }

  if (!item.pipeline.payhip_created) {
    return {
      key: 'payhip_created',
      label: 'Create product in Payhip',
      detail: 'The listing is ready for upload. Create the Payhip product and capture the working link.',
    };
  }

  if (!item.pipeline.url_backfilled) {
    return {
      key: 'url_backfilled',
      label: 'Backfill final Payhip URL',
      detail: 'Update the dashboard and website source data with the final Payhip product URL.',
    };
  }

  if (!item.pipeline.qa_verified) {
    return {
      key: 'qa_verified',
      label: 'Run QA verification',
      detail: 'Check pricing, delivery assets, release timing, and storefront copy before marking this listing verified.',
    };
  }

  if (!item.pipeline.site_synced) {
    return {
      key: 'site_synced',
      label: 'Sync website status',
      detail: 'Push the final Payhip status and link back to the website so the catalog matches the live product.',
    };
  }

  return {
    key: 'complete',
    label: item.status === 'archived' ? 'Archive fully synced' : 'Listing fully synced',
    detail: 'No upload or website sync work is currently pending for this listing.',
  };
}
