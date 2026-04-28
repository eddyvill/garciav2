import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project, Task } from '../../lib/database.types';
import { useProjectStore } from '../stores/projectStore';
import { calculateProgress, getTaskCounts } from '../utils/calculations';

/**
 * Fetches all projects, enriches with progress/task counts.
 * Only fetches if the store is empty (no projects loaded yet).
 */
export function useProjects() {
  const projects = useProjectStore((s) => s.projects);
  const loading = useProjectStore((s) => s.loading);
  const error = useProjectStore((s) => s.error);

  useEffect(() => {
    const store = useProjectStore.getState();
    // Skip if already loaded
    if (store.projects.length > 0) {
      if (store.loading) store.setLoading(false);
      return;
    }

    let isMounted = true;
    store.setLoading(true);
    store.setError(null);

    const fetchAll = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
          supabase.from('tasks').select('*'),
        ]);

        if (projRes.error) throw projRes.error;
        if (taskRes.error) throw taskRes.error;
        if (!isMounted) return;

        const allTasks = (taskRes.data ?? []) as Task[];
        const tasksByProject = new Map<string, Task[]>();
        for (const t of allTasks) {
          const list = tasksByProject.get(t.project_id) ?? [];
          list.push(t);
          tasksByProject.set(t.project_id, list);
        }

        const enriched: Project[] = (projRes.data ?? []).map((row) => {
          const p = row as Project;
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
