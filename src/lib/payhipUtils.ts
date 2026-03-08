import { PayhipItem, PayhipPipeline, PayhipStatus } from '../types';

export const PAYHIP_SELLABLE_STATUSES: PayhipStatus[] = ['presale', 'live', 'free_sample_live'];

export const PAYHIP_STATUS_LABELS: Record<PayhipStatus, string> = {
  planned: 'Planned',
  presale: 'Presale',
  live: 'Live',
  archived: 'Archived',
  free_sample_live: 'Free Sample Live',
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
