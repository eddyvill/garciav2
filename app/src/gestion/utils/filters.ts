import type {
  Task,
  TaskStatus,
  TaskPriority,
  UserRole,
  Project,
  ProjectMember,
} from '../../lib/database.types';
import type { KanbanColumns, TaskFilters } from '../stores/taskStore';
import type { TeamMember } from '../hooks/useTeamMembers';

// ── Kanban grouping ──────────────────────────────────────────────────

/**
 * Groups a list of tasks into 4 Kanban columns by status.
 * Every task appears in exactly one column matching its status.
 */
export function groupByStatus(tasks: Task[]): KanbanColumns {
  const columns: KanbanColumns = {
    pendiente: [],
    en_progreso: [],
    completada: [],
    bloqueada: [],
  };

  for (const task of tasks) {
    columns[task.status].push(task);
  }

  return columns;
}

// ── Task filters ─────────────────────────────────────────────────────

/**
 * Applies all active filters to a list of tasks.
 * A filter criterion is "active" when its value is non-null / non-empty.
 */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    if (filters.status !== null && task.status !== filters.status) return false;
    if (filters.priority !== null && task.priority !== filters.priority) return false;
    if (filters.assignedTo !== null && task.assigned_to !== filters.assignedTo) return false;
    if (filters.dueBefore !== null && task.due_date > filters.dueBefore) return false;
    return true;
  });
}

/**
 * Convenience: filter tasks by a single status.
 */
export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

/**
 * Convenience: filter tasks by a single priority.
 */
export function filterByPriority(tasks: Task[], priority: TaskPriority): Task[] {
  return tasks.filter((t) => t.priority === priority);
}

/**
 * Convenience: filter tasks assigned to a specific user.
 */
export function filterByAssignedTo(tasks: Task[], userId: string): Task[] {
  return tasks.filter((t) => t.assigned_to === userId);
}

/**
 * Convenience: filter tasks due on or before a given date.
 */
export function filterByDueDate(tasks: Task[], dueBefore: string): Task[] {
  return tasks.filter((t) => t.due_date <= dueBefore);
}

// ── Team member filters ──────────────────────────────────────────────

export interface TeamMemberFilters {
  role: UserRole | null;
  projectId: string | null;
  /** "available" = has fewer than `maxTasks` active (non-completed) tasks */
  availableOnly: boolean;
  maxTasks?: number;
}

/**
 * Filters team members by role, project assignment, and availability.
 */
export function filterTeamMembers(
  members: TeamMember[],
  filters: TeamMemberFilters,
  tasks: Task[] = [],
): TeamMember[] {
  return members.filter((member) => {
    // Filter by role
    if (filters.role !== null && member.role !== filters.role) return false;

    // Filter by project assignment
    if (filters.projectId !== null) {
      const isAssigned = member.assignments.some(
        (a) => a.project_id === filters.projectId,
      );
      if (!isAssigned) return false;
    }

    // Filter by availability (fewer than maxTasks active tasks)
    if (filters.availableOnly) {
      const max = filters.maxTasks ?? 5;
      const activeTasks = tasks.filter(
        (t) => t.assigned_to === member.id && t.status !== 'completada',
      ).length;
      if (activeTasks >= max) return false;
    }

    return true;
  });
}

// ── Project visibility ───────────────────────────────────────────────

/**
 * Returns the projects visible to a user based on their role and assignments.
 *
 * - Gerencia: sees all projects.
 * - Supervisor / Ejecucion: sees only projects where they are a member.
 */
export function getVisibleProjects(
  userRole: UserRole,
  userId: string,
  projects: Project[],
  members: ProjectMember[],
): Project[] {
  if (userRole === 'gerencia') return projects;

  const memberProjectIds = new Set(
    members.filter((m) => m.user_id === userId).map((m) => m.project_id),
  );

  return projects.filter((p) => memberProjectIds.has(p.id));
}
