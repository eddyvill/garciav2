import type {
  Project,
  Task,
  TaskStatus,
  UserRole,
} from '../../lib/database.types';

// ── Project validation ───────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates required fields for a project.
 * Required: name, description, location, start_date, estimated_end_date.
 */
export function validateProject(data: Partial<Project>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'El nombre es obligatorio';
  }
  if (!data.description || data.description.trim() === '') {
    errors.description = 'La descripción es obligatoria';
  }
  if (!data.location || data.location.trim() === '') {
    errors.location = 'La ubicación es obligatoria';
  }
  if (!data.start_date || data.start_date.trim() === '') {
    errors.start_date = 'La fecha de inicio es obligatoria';
  }
  if (!data.estimated_end_date || data.estimated_end_date.trim() === '') {
    errors.estimated_end_date = 'La fecha estimada de finalización es obligatoria';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Task validation ──────────────────────────────────────────────────

/**
 * Validates required fields for a task.
 * Required: title, description, due_date, priority, assigned_to.
 */
export function validateTask(data: Partial<Task>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'El título es obligatorio';
  }
  if (!data.description || data.description.trim() === '') {
    errors.description = 'La descripción es obligatoria';
  }
  if (!data.due_date || data.due_date.trim() === '') {
    errors.due_date = 'La fecha límite es obligatoria';
  }
  if (!data.priority) {
    errors.priority = 'La prioridad es obligatoria';
  }
  if (!data.assigned_to || data.assigned_to.trim() === '') {
    errors.assigned_to = 'El personal asignado es obligatorio';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Evidence validation ──────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;
const MAX_FILE_SIZE = 10_485_760; // 10 MB

/**
 * Returns true only if mime_type is 'image/jpeg' or 'image/png'
 * AND file_size <= 10 MB (10,485,760 bytes).
 */
export function validateEvidence(file: {
  mime_type: string;
  file_size: number;
}): boolean {
  return (
    (ALLOWED_MIME_TYPES as readonly string[]).includes(file.mime_type) &&
    file.file_size > 0 &&
    file.file_size <= MAX_FILE_SIZE
  );
}

// ── Status change validation ─────────────────────────────────────────

interface StatusChangeResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a task status change.
 * - Rejects changing to 'completada' without at least one evidence.
 * - Rejects changing to 'bloqueada' without a non-empty comment.
 */
export function validateStatusChange(
  _task: Task,
  newStatus: TaskStatus,
  evidenceCount: number,
  comment?: string,
): StatusChangeResult {
  if (newStatus === 'completada' && evidenceCount < 1) {
    return {
      valid: false,
      error: 'Debes subir al menos una evidencia fotográfica',
    };
  }

  if (
    newStatus === 'bloqueada' &&
    (!comment || comment.trim().length === 0)
  ) {
    return {
      valid: false,
      error: 'Debes describir el motivo del bloqueo',
    };
  }

  return { valid: true };
}

// ── Transition validation ────────────────────────────────────────────

/**
 * Valid transitions for the 'ejecucion' role.
 */
const EJECUCION_TRANSITIONS: ReadonlyArray<[TaskStatus, TaskStatus]> = [
  ['pendiente', 'en_progreso'],
  ['en_progreso', 'completada'],
  ['en_progreso', 'bloqueada'],
];

/**
 * Returns true if the transition from `fromStatus` to `toStatus` is allowed
 * for the given role.
 *
 * - 'gerencia' and 'supervisor': all transitions allowed.
 * - 'ejecucion': only pendiente→en_progreso, en_progreso→completada,
 *   en_progreso→bloqueada.
 */
export function isValidTransition(
  role: UserRole,
  fromStatus: TaskStatus,
  toStatus: TaskStatus,
): boolean {
  if (role === 'gerencia' || role === 'supervisor') return true;

  return EJECUCION_TRANSITIONS.some(
    ([from, to]) => from === fromStatus && to === toStatus,
  );
}
