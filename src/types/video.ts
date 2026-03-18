export type VideoBoard = 'cie' | 'edx' | 'ial' | 'amc' | 'ukmt' | 'bmmt' | 'kangaroo' | 'asdan';
export type VideoTier = 'both' | 'core_only' | 'extended_only';
export type VideoLang = 'en' | 'zh' | 'enzh';

export interface VideoPipeline {
  stub_created: boolean;
  script_written: boolean;
  script_validated: boolean;
  ai_enhanced: boolean;
  rendered: boolean;
  cover_generated: boolean;
  meta_generated: boolean;
  uploaded: boolean;
}

export type VideoPipelineStage = keyof VideoPipeline;

export const VIDEO_PIPELINE_STAGES: { key: VideoPipelineStage; label: string; cmd?: string }[] = [
  { key: 'stub_created', label: 'Stub', cmd: 'mve stubs' },
  { key: 'script_written', label: 'Written' },
  { key: 'script_validated', label: 'Validated', cmd: 'mve validate' },
  { key: 'ai_enhanced', label: 'Enhanced', cmd: 'mve enhance' },
  { key: 'rendered', label: 'Rendered', cmd: 'mve render' },
  { key: 'cover_generated', label: 'Cover', cmd: 'mve cover' },
  { key: 'meta_generated', label: 'Metadata', cmd: 'mve publish-meta' },
  { key: 'uploaded', label: 'Uploaded', cmd: 'mve upload' },
];

export type VideoActType =
  | 'title' | 'hook' | 'prerequisite' | 'vocabulary'
  | 'concept' | 'formula' | 'method' | 'misconception'
  | 'practice' | 'summary';

export interface VideoAct {
  type: VideoActType;
  scene: string;
  data: Record<string, any>;
}

export interface VideoScript {
  id: string;
  board: VideoBoard;
  section: string;
  chapter: string;
  topic: string;
  title: string;
  title_zh: string;
  tier: VideoTier;
  lang: VideoLang[];
  target_duration: number;
  acts: VideoAct[];
  script_yaml?: string;

  pipeline: VideoPipeline;

  output_path?: string;
  video_duration?: number;
  bilibili_url?: string;
  cover_url?: string;

  created_at: string;
  updated_at: string;
  rendered_at?: string;
  uploaded_at?: string;
}

export const DEFAULT_VIDEO_PIPELINE: VideoPipeline = {
  stub_created: false,
  script_written: false,
  script_validated: false,
  ai_enhanced: false,
  rendered: false,
  cover_generated: false,
  meta_generated: false,
  uploaded: false,
};
