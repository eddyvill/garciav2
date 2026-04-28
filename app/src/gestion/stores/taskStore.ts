import { create } from 'zustand';
import type { Task, TaskPriority, TaskStatus } from '../../lib/database.types';

// ── Filter shape ─────────────────────────────────────────────────────
export interface TaskFilters {
  status: TaskStatus | null;
  priority: TaskPriority | null;
  assignedTo: string | null;
  dueBefore: string | null; // ISO date string
}

// ── Kanban grouping ──────────────────────────────────────────────────
export interface KanbanColumns {
  pendiente: Task[];
  en_progreso: Task[];
  completada: Task[];
  bloqueada: Task[];
}

// ── Store shape ──────────────────────────────────────────────────────
interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setTasks: (tasks: Task[]) => void;
  upsertTask: (task: Task) => void;
  removeTask: (id: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DEFAULT_FILTERS: TaskFilters = {
  status: null,
  priority: null,
  assignedTo: null,
  dueBefore: null,
};

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  filters: { ...DEFAULT_FILTERS },
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  upsertTask: (task) =>
    set((state) => {
      const idx = state.tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const updated = [...state.tasks];
        updated[idx] = task;
        return { tasks: updated };
      }
      return { tasks: [...state.tasks, task] };
    }),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
