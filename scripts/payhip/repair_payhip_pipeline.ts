import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { MOCK_PAYHIP_ITEMS } from '../../src/constants-payhip';
import { getEffectivePayhipPipeline, getPayhipHealthAlerts, isFinalPayhipProductUrl, isSellablePayhipStatus, matchesPayhipQueue } from '../../src/lib/payhipUtils';
import { PayhipItem } from '../../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const ENV_PATH = resolve(ROOT, '.env.local');
const OUTPUT_PATH = resolve(ROOT, 'scripts/output/payhip-pipeline-repair-report.json');
const TABLE = 'payhip_items';
const WRITE = process.argv.includes('--write');
const SOURCE = (process.argv.find(arg => arg.startsWith('--source='))?.split('=')[1] || 'auto') as 'auto' | 'seed' | 'supabase';
const PAYHIP_PIPELINE_KEYS = ['matrix_ready', 'copy_ready', 'payhip_created', 'url_backfilled', 'qa_verified', 'site_synced'] as const;

dotenv.config({ path: ENV_PATH });

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

if ((!supabaseUrl || !supabaseAnonKey) && (WRITE || SOURCE === 'supabase')) {
  console.error(`Missing Supabase config in ${ENV_PATH}`);
  process.exit(1);
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
const seedById = new Map<string, PayhipItem>(MOCK_PAYHIP_ITEMS.map(item => [item.id, item]));

const isPristineSeedItem = (item: PayhipItem) => {
  return item.created_at === item.updated_at && String(item.sync_source || '').startsWith('website:');
};

const hasSamePipeline = (left?: PayhipItem['pipeline'], right?: PayhipItem['pipeline']) => {
  if (!left || !right) return false;
  return PAYHIP_PIPELINE_KEYS.every(key => Boolean(left[key]) === Boolean(right[key]));
};

const buildSafePipelinePatch = (item: PayhipItem) => {
  const patch: Partial<PayhipItem['pipeline']> = {};
  const reasons: string[] = [];
  const effectivePipeline = getEffectivePayhipPipeline(item);

  if (item.pipeline.payhip_created !== effectivePipeline.payhip_created) {
    patch.payhip_created = effectivePipeline.payhip_created;
    reasons.push('normalize_payhip_created');
  }

  if (item.pipeline.url_backfilled !== effectivePipeline.url_backfilled) {
    patch.url_backfilled = effectivePipeline.url_backfilled;
    reasons.push('normalize_url_backfilled');
  }

  const seed = seedById.get(item.id);
  if (seed?.pipeline && isPristineSeedItem(item) && !hasSamePipeline(item.pipeline, seed.pipeline)) {
    for (const key of PAYHIP_PIPELINE_KEYS) {
      if (item.pipeline[key] !== seed.pipeline[key]) {
        patch[key] = seed.pipeline[key];
      }
    }
    reasons.push('reset_pristine_seed_pipeline');
  }

  if (Object.keys(patch).length === 0) return null;

  return {
    patch,
    reasons,
    nextPipeline: {
      ...item.pipeline,
      ...patch,
    },
  };
};

const buildReviewFlags = (item: PayhipItem) => {
  const flags: string[] = [];

  if (item.pipeline.qa_verified && !isFinalPayhipProductUrl(item.payhip_url)) {
    flags.push('qa_verified_without_final_url');
  }

  if (item.pipeline.site_synced && !item.pipeline.qa_verified) {
    flags.push('site_synced_without_qa');
  }

  if (!isSellablePayhipStatus(item.status) && item.pipeline.site_synced) {
    flags.push('non_sellable_site_synced');
  }

  return flags;
};

let items: PayhipItem[] = [];
let sourceUsed: 'seed' | 'supabase' = 'seed';

if (SOURCE !== 'seed') {
  if (!supabase) {
    console.warn(`Missing Supabase config in ${ENV_PATH}`);
    console.warn('Falling back to local Payhip seed for report-only mode.');
  } else {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('level', { ascending: true })
      .order('sku', { ascending: true });

    if (!error) {
      items = (data || []) as PayhipItem[];
      sourceUsed = 'supabase';
    } else if (WRITE || SOURCE === 'supabase') {
      console.error(`Failed to fetch ${TABLE}: ${error.message}`);
      process.exit(1);
    } else {
      console.warn(`Failed to fetch ${TABLE}: ${error.message}`);
      console.warn('Falling back to local Payhip seed for report-only mode.');
    }
  }
}

if (items.length === 0 && sourceUsed === 'seed') {
  items = MOCK_PAYHIP_ITEMS;
}
const patches: Array<{
  id: string;
  sku: string;
  reasons: string[];
  before: PayhipItem['pipeline'];
  after: PayhipItem['pipeline'];
}> = [];
const reviewRows: Array<{
  id: string;
  sku: string;
  status: string;
  pristine_seed_item: boolean;
  final_url: boolean;
  review_flags: string[];
  health_alerts: string[];
}> = [];
const normalizedItems: PayhipItem[] = [];

for (const item of items) {
  const safePatch = buildSafePipelinePatch(item);
  const candidate = safePatch
    ? { ...item, pipeline: safePatch.nextPipeline }
    : item;
  normalizedItems.push(candidate);

  if (safePatch) {
    patches.push({
      id: item.id,
      sku: item.sku,
      reasons: safePatch.reasons,
      before: item.pipeline,
      after: safePatch.nextPipeline,
    });
  }

  const reviewFlags = buildReviewFlags(candidate);
  const healthAlerts = getPayhipHealthAlerts(candidate).map(alert => alert.key);

  if (reviewFlags.length > 0 || healthAlerts.length > 0) {
    reviewRows.push({
      id: item.id,
      sku: item.sku,
      status: item.status,
      pristine_seed_item: isPristineSeedItem(item),
      final_url: isFinalPayhipProductUrl(item.payhip_url),
      review_flags: reviewFlags,
      health_alerts: healthAlerts,
    });
  }
}

if (WRITE) {
  if (sourceUsed !== 'supabase') {
    console.error('Cannot use --write without a reachable payhip_items table.');
    process.exit(1);
  }

  for (const row of patches) {
    const { error: updateError } = await supabase!
      .from(TABLE)
      .update({
        pipeline: row.after,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    if (updateError) {
      console.error(`Failed to update ${row.id}: ${updateError.message}`);
      process.exit(1);
    }
  }
}

const summary = {
  source: sourceUsed,
  table: TABLE,
  dry_run: !WRITE,
  item_total: items.length,
  pristine_seed_rows: items.filter(isPristineSeedItem).length,
  safe_patch_rows: patches.length,
  safe_patch_reason_counts: {
    normalize_payhip_created: patches.filter(row => row.reasons.includes('normalize_payhip_created')).length,
    normalize_url_backfilled: patches.filter(row => row.reasons.includes('normalize_url_backfilled')).length,
    reset_pristine_seed_pipeline: patches.filter(row => row.reasons.includes('reset_pristine_seed_pipeline')).length,
  },
  review_only_rows: reviewRows.length,
  review_flag_counts: {
    qa_verified_without_final_url: reviewRows.filter(row => row.review_flags.includes('qa_verified_without_final_url')).length,
    site_synced_without_qa: reviewRows.filter(row => row.review_flags.includes('site_synced_without_qa')).length,
    non_sellable_site_synced: reviewRows.filter(row => row.review_flags.includes('non_sellable_site_synced')).length,
  },
  health_alert_counts: {
    sellable_missing_url: reviewRows.filter(row => row.health_alerts.includes('sellable_missing_url')).length,
    release_overdue: reviewRows.filter(row => row.health_alerts.includes('release_overdue')).length,
    live_without_qa: reviewRows.filter(row => row.health_alerts.includes('live_without_qa')).length,
    status_sync_mismatch: reviewRows.filter(row => row.health_alerts.includes('status_sync_mismatch')).length,
  },
  queue_counts: {
    create: normalizedItems.filter(item => matchesPayhipQueue(item, 'create')).length,
    backfill: normalizedItems.filter(item => matchesPayhipQueue(item, 'backfill')).length,
    qa: normalizedItems.filter(item => matchesPayhipQueue(item, 'qa')).length,
    sync: normalizedItems.filter(item => matchesPayhipQueue(item, 'sync')).length,
  },
};

const report = {
  generatedAt: new Date().toISOString(),
  summary,
  safe_patches: patches,
  review_rows: reviewRows,
};

mkdirSync(resolve(ROOT, 'scripts/output'), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(summary, null, 2));
console.log(`Report written to ${OUTPUT_PATH}`);
