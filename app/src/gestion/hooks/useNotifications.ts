import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Notification } from '../../lib/database.types';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuth } from '../context/AuthContext';

/**
 * Fetches notifications for the current user and subscribes to new ones
 * via Supabase Realtime (INSERT events filtered by user_id).
 *
 * Updates the Zustand notificationStore.
 */
export function useNotifications() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    setNotifications,
    addNotification,
    setLoading,
    setError,
  } = useNotificationStore();

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;
        if (isMounted) setNotifications((data ?? []) as Notification[]);
      } catch (err) {
        if (isMounted) setError((err as Error).message ?? 'Error al cargar notificaciones');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();

    // ── Realtime subscription — new notifications for this user ───
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          addNotification(payload.new as Notification);
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { notifications, unreadCount, loading, error };
}
