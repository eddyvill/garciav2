import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationStore } from '../stores/notificationStore';
import type { Notification } from '../../lib/database.types';

function NotificacionesPanel() {
  const { notifications, unreadCount } = useNotifications();
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Mark as read when panel opens
  const handleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next && unreadCount > 0) {
        const unreadIds = notifications
          .filter((n) => !n.is_read)
          .map((n) => n.id);

        // Optimistic update
        markAsRead(unreadIds);

        // Persist to DB
        (supabase
          .from('notifications') as any)
          .update({ is_read: true })
          .in('id', unreadIds)
          .then(() => {});
      }
      return next;
    });
  }, [notifications, unreadCount, markAsRead]);

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-dark-50/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.slice(0, 20).map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const timeAgo = getTimeAgo(notification.created_at);

  return (
    <div
      className={`px-4 py-3 hover:bg-white/[0.03] transition-colors ${
        !notification.is_read ? 'bg-brand-500/5' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {!notification.is_read && (
          <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{notification.title}</p>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-[10px] text-gray-600 mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' });
}

export default NotificacionesPanel;
