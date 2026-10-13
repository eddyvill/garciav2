import { useEffect } from 'react';
import { api } from '../../lib/api';
import type { Task } from '../../lib/database.types';
import { useTaskStore } from '../stores/taskStore';

/**
 * Fetches tasks for a given project using the local API.
 */
export function useTasks(projectId?: string) {
  const tasks = useTaskStore((s) => s.tasks);
  const loading = useTaskStore((s) => s.loading);
  const error = useTaskStore((s) => s.error);

  useEffect(() => {
    let isMounted = true;
    const store = useTaskStore.getState();

    const fetchTasks = async () => {
      store.setLoading(true);
      store.setError(null);

      try {
        const data = await api.tasks.getAll(projectId);
        if (isMounted) store.setTasks((data ?? []) as unknown as Task[]);
      } catch (err) {
        if (isMounted) store.setError((err as Error).message ?? 'Error al cargar tareas');
      } finally {
        if (isMounted) store.setLoading(false);
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  return { tasks, loading, error };
}
