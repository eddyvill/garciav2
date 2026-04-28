import { supabase } from '../../lib/supabase';
import type {
  Task,
  Project,
  ProjectMember,
  UserProfile,
  NotificationType,
  TaskStatus,
} from '../../lib/database.types';

// ── Notification creation helpers ────────────────────────────────────

/**
 * Notify the assigned user that a task has been assigned to them.
 */
export async function notifyTaskAssigned(task: Task): Promise<void> {
  await insertNotification({
    user_id: task.assigned_to,
    type: 'task_assigned',
    title: 'Nueva tarea asignada',
    message: `Se te ha asignado la tarea "${task.title}"`,
    reference_id: task.id,
    reference_type: 'task',
  });
}

/**
 * Notify supervisors and gerencia when a task status changes.
 */
export async function notifyTaskStatusChanged(
  task: Task,
  oldStatus: TaskStatus,
  newStatus: TaskStatus,
  members: ProjectMember[],
  users: UserProfile[],
): Promise<void> {
  const recipients = getNotificationRecipients('task_status_changed', members, users, task.project_id);

  const statusLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_progreso: 'En Progreso',
    completada: 'Completada',
    bloqueada: 'Bloqueada',
  };

  const promises = recipients.map((userId) =>
    insertNotification({
      user_id: userId,
      type: 'task_status_changed',
      title: 'Cambio de estado de tarea',
      message: `"${task.title}" cambió de ${statusLabels[oldStatus]} a ${statusLabels[newStatus]}`,
      reference_id: task.id,
      reference_type: 'task',
    }),
  );

  await Promise.all(promises);
}

/**
 * Notify assigned supervisors when a project is created.
 */
export async function notifyProjectCreated(
  project: Project,
  supervisors: string[],
): Promise<void> {
  const promises = supervisors.map((userId) =>
    insertNotification({
      user_id: userId,
      type: 'project_created',
      title: 'Nuevo proyecto creado',
      message: `Se ha creado el proyecto "${project.name}" y has sido asignado como supervisor`,
      reference_id: project.id,
      reference_type: 'project',
    }),
  );

  await Promise.all(promises);
}

/**
 * Determine notification recipients based on event type.
 *
 * - task_status_changed: supervisors of the project + all gerencia users
 * - task_assigned: the assigned user (handled directly)
 * - project_created: assigned supervisors (handled directly)
 */
export function getNotificationRecipients(
  event: NotificationType,
  members: ProjectMember[],
  users: UserProfile[],
  projectId?: string,
): string[] {
  const recipients = new Set<string>();

  if (event === 'task_status_changed') {
    // Supervisors of the project
    if (projectId) {
      for (const m of members) {
        if (m.project_id === projectId && m.role_in_project === 'supervisor') {
          recipients.add(m.user_id);
        }
      }
    }
    // All gerencia users
    for (const u of users) {
      if (u.role === 'gerencia') {
        recipients.add(u.id);
      }
    }
  }

  if (event === 'project_status_changed') {
    // All gerencia users
    for (const u of users) {
      if (u.role === 'gerencia') {
        recipients.add(u.id);
      }
    }
    // Supervisors of the project
    if (projectId) {
      for (const m of members) {
        if (m.project_id === projectId && m.role_in_project === 'supervisor') {
          recipients.add(m.user_id);
        }
      }
    }
  }

  return Array.from(recipients);
}

// ── Internal helper ──────────────────────────────────────────────────

interface NotificationInsert {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id: string;
  reference_type: 'project' | 'task';
}

async function insertNotification(data: NotificationInsert): Promise<void> {
  const { error } = await supabase.from('notifications').insert(data as any);
  if (error) {
    console.error('[notificationService] Error inserting notification:', error.message);
  }
}
