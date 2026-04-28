import type { UserRole } from '../../lib/database.types';

/**
 * Permission matrix.
 *
 * Gerencia has all permissions.
 * Supervisor has: create_task, edit_task.
 * Ejecucion has none of these explicit permissions
 * (they can only update their own task status, handled separately).
 */
const PERMISSIONS: Record<string, ReadonlySet<UserRole>> = {
  create_project: new Set(['gerencia']),
  edit_project: new Set(['gerencia']),
  delete_project: new Set(['gerencia']),
  assign_team: new Set(['gerencia']),
  create_task: new Set(['gerencia', 'supervisor']),
  edit_task: new Set(['gerencia', 'supervisor']),
  view_all_projects: new Set(['gerencia']),
  view_reports: new Set(['gerencia']),
  view_history: new Set(['gerencia']),
};

/**
 * Returns true if the given role has permission for the specified action.
 */
export function hasPermission(role: UserRole, action: string): boolean {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.has(role);
}
