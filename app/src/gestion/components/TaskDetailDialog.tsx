import { useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  User,
  Flag,
  Clock,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useTaskStore } from '../stores/taskStore';
import {
  isValidTransition,
  validateStatusChange,
} from '../utils/validation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import EvidenciaUploader from './EvidenciaUploader';
import EvidenciaGallery from './EvidenciaGallery';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskEvidence,
} from '../../lib/database.types';

// ── Config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; dotColor: string; badgeClass: string }
> = {
  pendiente: {
    label: 'Pendiente',
    dotColor: 'bg-gray-400',
    badgeClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  },
  en_progreso: {
    label: 'En Progreso',
    dotColor: 'bg-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  completada: {
    label: 'Completada',
    dotColor: 'bg-green-400',
    badgeClass: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
  bloqueada: {
    label: 'Bloqueada',
    dotColor: 'bg-yellow-400',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  },
};

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  alta: {
    label: 'Alta',
    className: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  media: {
    label: 'Media',
    className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  },
  baja: {
    label: 'Baja',
    className: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
};

const STATUS_ORDER: TaskStatus[] = [
  'pendiente',
  'en_progreso',
  'completada',
  'bloqueada',
];

// ── Props ────────────────────────────────────────────────────────────
interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

// ── Component ────────────────────────────────────────────────────────
function TaskDetailDialog({
  open,
  onOpenChange,
  task,
}: TaskDetailDialogProps) {
  const { profile } = useAuth();
  const { members } = useTeamMembers();
  const upsertTask = useTaskStore((s) => s.upsertTask);

  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [showBlockedInput, setShowBlockedInput] = useState(false);
  const [blockedComment, setBlockedComment] = useState('');
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);

  const userRole = profile?.role ?? 'ejecucion';

  const assignedName = useMemo(() => {
    if (!task) return 'Sin asignar';
    const member = members.find((m) => m.id === task.assigned_to);
    return member?.full_name ?? 'Sin asignar';
  }, [task, members]);

  const createdByName = useMemo(() => {
    if (!task) return '';
    const member = members.find((m) => m.id === task.created_by);
    return member?.full_name ?? '';
  }, [task, members]);

  // Determine which status transitions are available
  const availableTransitions = useMemo(() => {
    if (!task) return [];
    return STATUS_ORDER.filter(
      (s) =>
        s !== task.status && isValidTransition(userRole, task.status, s),
    );
  }, [task, userRole]);

  // Can the current user upload evidence?
  const canUpload = useMemo(() => {
    if (!task || !profile) return false;
    // Assigned user can upload, plus supervisors and gerencia
    return (
      task.assigned_to === profile.id ||
      userRole === 'supervisor' ||
      userRole === 'gerencia'
    );
  }, [task, profile, userRole]);

  const handleStatusChange = useCallback(
    async (newStatus: TaskStatus, comment?: string) => {
      if (!task || !profile) return;

      setChangingStatus(true);
      setStatusError(null);

      try {
        // Check evidence count for completada
        let evidenceCount = 0;
        if (newStatus === 'completada') {
          const { data: evidences } = await supabase
            .from('task_evidence')
            .select('id')
            .eq('task_id', task.id);
          evidenceCount = evidences?.length ?? 0;
        }

        const validation = validateStatusChange(
          task,
          newStatus,
          evidenceCount,
          comment,
        );

        if (!validation.valid) {
          setStatusError(validation.error ?? 'Cambio de estado no válido');
          setChangingStatus(false);
          return;
        }

        const { data: updated, error } = await (supabase
          .from('tasks') as any)
          .update({ status: newStatus })
          .eq('id', task.id)
          .select();

        if (error) throw error;

        if (updated && updated.length > 0) {
          upsertTask(updated[0] as Task);

          // Generate notification
          await supabase.from('notifications').insert({
            user_id: task.assigned_to,
            type: 'task_status_changed' as const,
            title: 'Estado de tarea actualizado',
            message: `La tarea "${task.title}" cambió a ${newStatus}`,
            reference_id: task.id,
            reference_type: 'task' as const,
          } as any);
        }

        setShowBlockedInput(false);
        setBlockedComment('');
      } catch (err) {
        setStatusError(
          (err as Error).message || 'Error al cambiar el estado',
        );
      } finally {
        setChangingStatus(false);
      }
    },
    [task, profile, upsertTask],
  );

  const handleEvidenceUploaded = useCallback((_evidence: TaskEvidence) => {
    setGalleryRefreshKey((k) => k + 1);
  }, []);

  if (!task) return null;

  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const isOverdue =
    task.status !== 'completada' && task.due_date <= new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-50 border-white/10 text-white sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl pr-6">
            {task.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalles de la tarea
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Status and priority badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={`border ${statusCfg.badgeClass}`}
            >
              <div className={`h-2 w-2 rounded-full ${statusCfg.dotColor} mr-1.5`} />
              {statusCfg.label}
            </Badge>
            <Badge
              variant="outline"
              className={`border ${priorityCfg.className}`}
            >
              <Flag className="h-3 w-3 mr-1" />
              {priorityCfg.label}
            </Badge>
            {isOverdue && (
              <Badge
                variant="outline"
                className="border border-red-500/30 bg-red-500/20 text-red-300"
              >
                <Clock className="h-3 w-3 mr-1" />
                Vencida
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-gray-400 text-xs uppercase tracking-wider">
              Descripción
            </Label>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Meta info grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs uppercase tracking-wider">
                Asignado a
              </Label>
              <div className="flex items-center gap-1.5 text-sm text-white">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {assignedName}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs uppercase tracking-wider">
                Fecha límite
              </Label>
              <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {task.due_date}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs uppercase tracking-wider">
                Creado por
              </Label>
              <p className="text-sm text-gray-300">{createdByName || '—'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-400 text-xs uppercase tracking-wider">
                Creado el
              </Label>
              <p className="text-sm text-gray-300">
                {new Date(task.created_at).toLocaleDateString('es-VE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Status change buttons */}
          {availableTransitions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <Label className="text-gray-400 text-xs uppercase tracking-wider">
                Cambiar estado
              </Label>

              {statusError && (
                <p className="text-sm text-red-400">{statusError}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {availableTransitions.map((newStatus) => {
                  const cfg = STATUS_CONFIG[newStatus];
                  return (
                    <Button
                      key={newStatus}
                      variant="outline"
                      size="sm"
                      disabled={changingStatus}
                      onClick={() => {
                        if (newStatus === 'bloqueada') {
                          setShowBlockedInput(true);
                          setBlockedComment('');
                          return;
                        }
                        handleStatusChange(newStatus);
                      }}
                      className={`border ${cfg.badgeClass} hover:opacity-80 cursor-pointer transition-opacity duration-200`}
                    >
                      {changingStatus ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <div className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
                      )}
                      {cfg.label}
                    </Button>
                  );
                })}
              </div>

              {/* Blocked comment input */}
              {showBlockedInput && (
                <div className="space-y-2 mt-2">
                  <Textarea
                    value={blockedComment}
                    onChange={(e) => setBlockedComment(e.target.value)}
                    placeholder="Describe el motivo del bloqueo..."
                    rows={2}
                    className="bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={!blockedComment.trim() || changingStatus}
                      onClick={() =>
                        handleStatusChange('bloqueada', blockedComment)
                      }
                      className="bg-yellow-600 hover:bg-yellow-500 text-white cursor-pointer transition-colors duration-200"
                    >
                      Confirmar bloqueo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowBlockedInput(false);
                        setBlockedComment('');
                      }}
                      className="text-gray-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence section */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            {/* Gallery - visible to all */}
            <EvidenciaGallery
              taskId={task.id}
              refreshKey={galleryRefreshKey}
            />

            {/* Uploader - visible to assigned user, supervisors, gerencia */}
            {canUpload && (
              <div className="pt-2 border-t border-white/5">
                <EvidenciaUploader
                  taskId={task.id}
                  onUploaded={handleEvidenceUploaded}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TaskDetailDialog;
