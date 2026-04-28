import { toast } from 'sonner';

// ── PostgreSQL / PostgREST error code mapping ────────────────────────
interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  '42501': 'No tienes permisos para realizar esta acción.',
  '23505': 'Ya existe un registro con esos datos.',
  '23503': 'No se puede eliminar porque hay datos relacionados.',
  PGRST116: 'El recurso solicitado no fue encontrado.',
};

/**
 * Maps a Supabase/PostgreSQL error to a user-friendly Spanish message.
 * Optionally shows a toast notification.
 */
export function handleSupabaseError(
  error: SupabaseError | null | undefined,
  showToast = true,
): string {
  if (!error) return '';

  const code = error.code ?? '';
  const message = ERROR_MESSAGES[code] ?? 'Ocurrió un error inesperado.';

  if (showToast) {
    toast.error(message);
  }

  return message;
}
