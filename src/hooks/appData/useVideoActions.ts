import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { videoService } from '../../services/videoService';
import { VideoScript, VideoPipelineStage, DEFAULT_VIDEO_PIPELINE } from '../../types/video';
import { ToastApi } from '../../types';

interface UseVideoActionsParams {
  videoScripts: VideoScript[];
  setVideoScripts: Dispatch<SetStateAction<VideoScript[]>>;
  toast: ToastApi;
}

export function useVideoActions({ videoScripts, setVideoScripts, toast }: UseVideoActionsParams) {
  const itemsRef = useRef(videoScripts);
  itemsRef.current = videoScripts;

  const persistItem = useCallback(async (item: VideoScript, successMessage?: string) => {
    try {
      const updated = await videoService.update(item.id, item);
      setVideoScripts(prev => prev.map(entry => entry.id === item.id ? { ...entry, ...updated } : entry));
      if (successMessage) toast.success(successMessage);
      return updated;
    } catch {
      toast.error('Failed to save video script');
    }
  }, [setVideoScripts, toast]);

  const updateVideoScript = useCallback(async (id: string, updates: Partial<VideoScript>) => {
    const existing = itemsRef.current.find(item => item.id === id);
    if (!existing) return;

    const merged: VideoScript = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await persistItem(merged, 'Video script updated');
  }, [persistItem]);

  const deleteVideoScript = useCallback(async (id: string) => {
    try {
      await videoService.delete(id);
      setVideoScripts(prev => prev.filter(item => item.id !== id));
      toast.success('Video script deleted');
    } catch {
      toast.error('Failed to delete video script');
    }
  }, [setVideoScripts, toast]);

  const toggleVideoPipeline = useCallback(async (id: string, stage: VideoPipelineStage) => {
    const item = itemsRef.current.find(i => i.id === id);
    if (!item) return;
    const updatedPipeline = { ...item.pipeline, [stage]: !item.pipeline[stage] };
    await updateVideoScript(id, { pipeline: updatedPipeline });
  }, [updateVideoScript]);

  const bulkSetVideoPipeline = useCallback(async (id: string, value: boolean) => {
    const pipeline: VideoScript['pipeline'] = {
      stub_created: value,
      script_written: value,
      script_validated: value,
      ai_enhanced: value,
      rendered: value,
      cover_generated: value,
      meta_generated: value,
      uploaded: value,
    };
    await updateVideoScript(id, { pipeline });
  }, [updateVideoScript]);

  return {
    updateVideoScript,
    deleteVideoScript,
    toggleVideoPipeline,
    bulkSetVideoPipeline,
  };
}
