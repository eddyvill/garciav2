import { create } from 'zustand';
import type { Project, ProjectStatus } from '../../lib/database.types';

// ── Filter shape ─────────────────────────────────────────────────────
export interface ProjectFilters {
  status: ProjectStatus | null;
  search: string;
}

// ── Store shape ──────────────────────────────────────────────────────
interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  filters: ProjectFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  removeProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DEFAULT_FILTERS: ProjectFilters = {
  status: null,
  search: '',
};

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProjectId: null,
  filters: { ...DEFAULT_FILTERS },
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects }),

  upsertProject: (project) =>
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        const updated = [...state.projects];
        updated[idx] = project;
        return { projects: updated };
      }
      return { projects: [...state.projects, project] };
    }),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProjectId:
        state.selectedProjectId === id ? null : state.selectedProjectId,
    })),

  selectProject: (id) => set({ selectedProjectId: id }),

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
