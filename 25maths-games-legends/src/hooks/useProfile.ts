import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import type { UserProfile, CompletedMissions, DifficultyMode, BattleResult } from '../types';
import type { User } from '@supabase/supabase-js';
import { handleSupabaseError } from '../utils/errors';

const DEFAULT_STATS = { Algebra: 0, Geometry: 0, Functions: 0, Calculus: 0, Statistics: 0 };
const GUEST_STORAGE_KEY = 'gl_guest_profile';

function loadGuestProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {
    user_id: 'guest',
    display_name: 'Guest',
    total_score: 0,
    grade: null,
    selected_char_id: '',
    completed_missions: {},
    stats: DEFAULT_STATS,
  };
}

function saveGuestProfile(profile: UserProfile) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

export function useProfile(user: User | null, isGuest: boolean = false) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Load profile
  useEffect(() => {
    if (isGuest) {
      setProfile(loadGuestProfile());
      return;
    }
    if (!user) { setProfile(null); return; }

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('gl_user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const newProfile: UserProfile = {
          user_id: user.id,
          display_name: user.user_metadata?.nickname || user.email?.split('@')[0] || 'Hero',
          total_score: 0,
          grade: null,
          selected_char_id: '',
          completed_missions: {},
          stats: DEFAULT_STATS,
        };
        const { error: insertErr } = await supabase.from('gl_user_progress').insert(newProfile);
        if (insertErr) handleSupabaseError(insertErr, 'create', 'gl_user_progress');
        setProfile(newProfile);
      } else if (error) {
        handleSupabaseError(error, 'get', 'gl_user_progress');
      } else {
        setProfile({
          ...data,
          completed_missions: data.completed_missions || {},
          stats: data.stats || DEFAULT_STATS,
        });
      }
    };

    loadProfile();
  }, [user?.id, isGuest]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (isGuest) {
      setProfile(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        saveGuestProfile(updated);
        return updated;
      });
      return;
    }
    if (!user) return;
    const { error } = await supabase
      .from('gl_user_progress')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (error) {
      handleSupabaseError(error, 'update', 'gl_user_progress');
    } else {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const recordBattleComplete = async (
    missionId: number,
    difficultyMode: DifficultyMode,
    success: boolean,
    score: number,
    durationSecs: number,
    hpRemaining: number,
    topic: string,
    kpId?: string,
  ) => {
    if (!profile) return;

    // Record battle result (skip for guest)
    if (user && !isGuest) {
      const battleResult: BattleResult = {
        user_id: user.id,
        mission_id: missionId,
        kp_id: kpId,
        difficulty_mode: difficultyMode,
        success,
        score,
        duration_secs: durationSecs,
        hp_remaining: hpRemaining,
      };
      const { error: battleErr } = await supabase.from('gl_battle_results').insert(battleResult);
      if (battleErr) handleSupabaseError(battleErr, 'create', 'gl_battle_results');
    }

    if (success) {
      const newCompleted: CompletedMissions = { ...profile.completed_missions };
      if (!newCompleted[String(missionId)]) {
        newCompleted[String(missionId)] = { green: false, amber: false, red: false };
      }
      newCompleted[String(missionId)][difficultyMode] = true;

      const newStats = { ...profile.stats };
      const key = topic as keyof typeof newStats;
      if (key in newStats) newStats[key] += 1;

      await updateProfile({
        total_score: profile.total_score + score,
        completed_missions: newCompleted,
        stats: newStats,
      });
    }
  };

  return { profile, updateProfile, recordBattleComplete };
}
