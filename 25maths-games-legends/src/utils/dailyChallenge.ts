// Daily Challenge — deterministic daily mission selection via date hash
// Same mission for all players on the same day, 3x reward multiplier

import type { Mission, CompletedMissions } from '../types';

export const DAILY_MULTIPLIER = 3;

/**
 * Find a coprime of n near n*0.618 (golden ratio) for good distribution.
 */
function findCoprime(n: number): number {
  const gcd = (a: number, b: number): number => { while (b) { [a, b] = [b, a % b]; } return a; };
  let candidate = Math.max(1, Math.floor(n * 0.618));
  // Search upward for a coprime
  while (candidate < n && gcd(candidate, n) !== 1) candidate++;
  return candidate < n ? candidate : 1;
}

/**
 * Deterministic daily index selection.
 * Uses day-of-year + year as seed, then applies a coprime step
 * to permute through the pool without repeats until full cycle.
 * Guarantees no repeat within poolSize days.
 */
function dailyIndex(dateStr: string, poolSize: number): number {
  if (poolSize <= 1) return 0;
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(4, 6)) - 1;
  const d = parseInt(dateStr.slice(6, 8));
  const dayOfYear = Math.floor((Date.UTC(y, m, d) - Date.UTC(y, 0, 0)) / 86400000);
  const yearOffset = ((y * 7) + 13) % poolSize;
  const step = findCoprime(poolSize);
  return (dayOfYear * step + yearOffset) % poolSize;
}

/** Get today's date string in YYYYMMDD format (local time) */
export function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Select today's daily mission from the pool */
export function getDailyMission(missions: Mission[], grade: number | null): Mission | null {
  // Filter to missions matching grade, with generators (so they produce varied questions)
  const pool = missions.filter(m =>
    m.grade === grade && m.data?.generatorType
  );
  if (pool.length === 0) return null;

  const idx = dailyIndex(getTodayKey(), pool.length);
  return pool[idx];
}

/** Check if today's daily challenge has been completed */
export function isDailyCompleted(completedMissions: CompletedMissions): boolean {
  const key = `daily_${getTodayKey()}`;
  return !!(completedMissions as Record<string, unknown>)[key];
}

/** Get the daily challenge key for marking completion */
export function getDailyKey(): string {
  return `daily_${getTodayKey()}`;
}

/** Get seconds remaining until midnight (local time) */
export function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

/** Format seconds as HH:MM:SS */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
