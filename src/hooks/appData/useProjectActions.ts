import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { projectService } from '../../services/projectService';
import { Project, ToastApi } from '../../types';

interface UseProjectActionsParams {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  toast: ToastApi;
}

export function useProjectActions({ projects, setProjects, toast }: UseProjectActionsParams) {
  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  const addProject = useCallback(async (data: Omit<Project, 'id'>) => {
    try {
      const created = await projectService.create(data);
      setProjects(prev => [...prev, created]);
      toast.success('Project added');
    } catch (error) {
      toast.error('Failed to add project');
    }
  }, [setProjects, toast]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const existing = projectsRef.current.find(p => p.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    try {
      const updated = await projectService.update(id, merged);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      toast.success('Project updated');
    } catch (error) {
      toast.error('Failed to update project');
    }
  }, [setProjects, toast]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  }, [setProjects, toast]);

  return {
    addProject,
    updateProject,
    deleteProject,
  };
}
