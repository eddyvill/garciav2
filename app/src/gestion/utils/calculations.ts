import type { Task, TaskCounts, TaskStatus } from '../../lib/database.types';

/**
 * Calculates the progress percentage of a set of tasks.
 * Returns the percentage (0–100, 1 decimal) of tasks with status 'completada'.
 * Returns 0 if the task list is empty.
 */
export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completada').length;
  return Math.round((completed / tasks.length) * 1000) / 10;
}

/**
 * Returns a TaskCounts object with the count of tasks per status plus the total.
 */
export function getTaskCounts(tasks: Task[]): TaskCounts {
  const counts: TaskCounts = {
    pendiente: 0,
    en_progreso: 0,
    completada: 0,
    bloqueada: 0,
    total: tasks.length,
  };

  for (const task of tasks) {
    counts[task.status as TaskStatus]++;
  }

  return counts;
}

/**
 * Returns true if the task is overdue: due_date <= currentDate AND status !== 'completada'.
 */
export function isOverdue(task: Task, currentDate: Date = new Date()): boolean {
  if (task.status === 'completada') return false;
  const dueDate = new Date(task.due_date);
  // Compare date-only (strip time) — due_date is a DATE string (YYYY-MM-DD)
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  return due <= current;
}

/**
 * Returns true if the task is due within 24 hours AND status !== 'completada'.
 */
export function isDueSoon(task: Task, currentDate: Date = new Date()): boolean {
  if (task.status === 'completada') return false;
  const dueDate = new Date(task.due_date);
  const diffMs = dueDate.getTime() - currentDate.getTime();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  return diffMs > 0 && diffMs <= twentyFourHoursMs;
}

/**
 * Returns true if more than 20% of tasks are in status 'bloqueada'.
 * Returns false if there are no tasks.
 */
export function hasHighBlockedRate(tasks: Task[]): boolean {
  if (tasks.length === 0) return false;
  const blocked = tasks.filter((t) => t.status === 'bloqueada').length;
  return blocked / tasks.length > 0.2;
}
