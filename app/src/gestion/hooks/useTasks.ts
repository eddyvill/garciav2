import { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { Task } from '../../lib/database.types';
import { useTaskStore } from '../stores/taskStore';

/**
 * Fetches tasks for a given project and subscribes to realtime changes.
 */
export function useTasks(projectId?: string) {
  const tasks = useTaskStore((s) => s.tasks);
  const loading = useTaskStore((s) => s.loading);
  const error = useTaskStore((s) => s.error);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const store = useTaskStore.getState();

    const fetchTasks = async () => {
      store.setLoading(true);
      store.setError(null);

      try {
        let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (projectId) query = query.eq('project_id', projectId);

        const { data, error: fetchErr } = await query;
        if (fetchErr) throw fetchErr;
        if (isMounted) store.setTasks((data ?? []) as Task[]);
      } catch (err) {
        if (isMounted) store.setError((err as Error).message ?? 'Error al cargar tareas');
      } finally {
        if (isMounted) store.setLoading(false);
      }
    };

    fetchTasks();

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channelName = `tasks-rt-${projectId ?? 'all'}-${Date.now()}`;
    const filter = projectId ? `project_id=eq.${projectId}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tasks',
        ...(filter ? { filter } : {}),
      }, (payload) => {
        const s = useTaskStore.getState();
        if (payload.eventType === 'DELETE') {
          s.removeTask((payload.old as { id: string }).id);
        } else {
          s.upsertTask(payload.new as Task);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [projectId]);

  return { tasks, loading, error };
}
