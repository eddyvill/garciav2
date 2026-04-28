import { create } from 'zustand';
import type { Notification } from '../../lib/database.types';

// ── Store shape ──────────────────────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  // Derived — kept in sync by actions
  unreadCount: number;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (ids: string[]) => void;
  markAllAsRead: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

function countUnread(notifications: Notification[]): number {
  return notifications.filter((n) => !n.is_read).length;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({ notifications, unreadCount: countUnread(notifications) }),

  addNotification: (notification) =>
    set((state) => {
      const updated = [notification, ...state.notifications];
      return { notifications: updated, unreadCount: countUnread(updated) };
    }),

  markAsRead: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      const updated = state.notifications.map((n) =>
        idSet.has(n.id) ? { ...n, is_read: true } : n,
      );
      return { notifications: updated, unreadCount: countUnread(updated) };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
