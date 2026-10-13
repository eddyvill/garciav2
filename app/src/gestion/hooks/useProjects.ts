import { useEffect } from 'react';
import { api } from '../../lib/api';
import type { Project, Task } from '../../lib/database.types';
import { useProjectStore } from '../stores/projectStore';
import { calculateProgress, getTaskCounts } from '../utils/calculations';

/**
 * Fetches all projects, enriches with progress/task counts.
 * Uses local API instead of Supabase.
 */
export function useProjects() {
  const projects = useProjectStore((s) => s.projects);
  const loading = useProjectStore((s) => s.loading);
  const error = useProjectStore((s) => s.error);

  useEffect(() => {
    const store = useProjectStore.getState();
    if (store.projects.length > 0) {
      if (store.loading) store.setLoading(false);
      return;
    }

    let isMounted = true;
    store.setLoading(true);
    store.setError(null);

    const fetchAll = async () => {
      try {
        const [projData, taskData] = await Promise.all([
          api.projects.getAll(),
          api.tasks.getAll(),
        ]);

        if (!isMounted) return;

        const allTasks = (taskData ?? []) as Task[];
        const tasksByProject = new Map<string, Task[]>();
        for (const t of allTasks) {
          const list = tasksByProject.get(t.project_id) ?? [];
          list.push(t);
          tasksByProject.set(t.project_id, list);
        }

        const enriched: Project[] = (projData ?? []).map((row) => {
          const p = row as unknown as Project;
          const pts = tasksByProject.get(p.id) ?? [];
          return { ...p, progress_percentage: calculateProgress(pts), task_counts: getTaskCounts(pts) };
        });

        if (isMounted) {
          store.setProjects(enriched);
          store.setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          store.setError((err as Error).message ?? 'Error al cargar proyectos');
          store.setLoading(false);
        }
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, []);

  return { projects, loading, error };
}
