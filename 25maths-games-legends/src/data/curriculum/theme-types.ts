/**
 * Unified types for the KP-centric architecture.
 * These bridge KP registry + Story theme + School mapping.
 */

import type { BilingualText, DifficultyMode } from '../../types';

/** A generated mission from KP + Story + School data */
export interface GeneratedMission {
  kpId: string;              // Canonical KP ID, e.g., "kp-2.5-06"
  numericId: number;         // For legacy compat & ordering
  chapterId: string;         // "ch2"
  topicId: string;           // "2.5"
  orderInTopic: number;      // Position within topic (1-based)

  // From KP registry
  title: BilingualText;      // KP title
  scriptType: string;        // T1-T8
  tier: string;              // both/ext/core
  prereqs: string[];         // Prerequisite KP IDs
  videoKpId: string;         // Link to manim video script

  // From Story theme
  storyArc: BilingualText;   // Chapter-level arc name
  narrator: string;          // Character narrator
  eventName: BilingualText;  // Topic-level event
  setting: BilingualText;    // Scene description
  story: BilingualText;      // Generated story text
  description: BilingualText;// Math task description

  // Game mechanics
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: number;
  tutorialSteps: any[];      // Green mode steps

  // School mapping (populated per-student)
  grade?: number;            // Which year this KP is taught
}

/** Compact format for DB storage in gl_missions */
export interface MissionRecord {
  id: number;
  kp_id: string;
  chapter_id: string;
  topic_id: string;
  order_in_topic: number;
  grade: number | null;
  title: BilingualText;
  story: BilingualText;
  description: BilingualText;
  topic_name: BilingualText;
  narrator: string;
  script_type: string;
  tier: string;
  difficulty: string;
  reward: number;
  prereqs: string[];
  video_kp_id: string;
  tutorial_steps: any[];
  data: any;
  secret: any;
  is_active: boolean;
}
