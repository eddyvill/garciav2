import { useState, useMemo, useCallback } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import { Calendar, User, AlertCircle, Plus, Filter, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useTaskStore } from '../stores/taskStore';
import { groupByStatus, filterTasks } from '../utils/filters';
import { isValidTransition, validateStatusChange } from '../utils/validation';
import { hasPermission } from '../utils/authorization';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import TaskForm from './TaskForm';
import TaskDetailDialog from './TaskDetailDialog';
import type { Task, TaskStatus, TaskPriority } from '../../lib/database.types';

// ── Column config ────────────────────────────────────────────────────
const COLUMNS: {
  id: TaskStatus;
  label: string;
  dotColor: string;
  borderColor: string;
}[] = [
  {
    id: 'pendiente',
    label: 'Pendiente',
    dotColor: 'bg-gray-400',
    borderColor: 'border-gray-500/30',
  },
  {
    id: 'en_progreso',
    label: 'En Progreso',
    dotColor: 'bg-blue-400',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'completada',
    label: 'Completada',
    dotColor: 'bg-green-400',
    borderColor: 'border-green-500/30',
  },
  {
    id: 'bloqueada',
    label: 'Bloqueada',
    dotColor: 'bg-yellow-400',
    borderColor: 'border-yellow-500/30',
  },
];

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

// ── Props ────────────────────────────────────────────────────────────
interface KanbanBoardProps {
  projectId: string;
}

// ── Component ────────────────────────────────────────────────────────
function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { profile } = useAuth();
  const { tasks, loading } = useTasks(projectId);
  const { members } = useTeamMembers();
  const upsertTask = useTaskStore((s) => s.upsertTask);
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);
  const resetFilters = useTaskStore((s) => s.resetFilters);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);
  const [blockedComment, setBlockedComment] = useState('');
  const [pendingDrop, setPendingDrop] = useState<{
    task: Task;
    newStatus: TaskStatus;
  } | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const userRole = profile?.role ?? 'ejecucion';
  const canCreateTask = hasPermission(userRole, 'create_task');

  // Build a map of user IDs to names
  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      map.set(m.id, m.full_name);
    }
    return map;
  }, [members]);

  // Keep detail task in sync with store
  const detailTask = useMemo(
    () => (detailTaskId ? tasks.find((t) => t.id === detailTaskId) ?? null : null),
    [detailTaskId, tasks],
  );

  // Filter and group tasks
  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const columns = useMemo(() => groupByStatus(filteredTasks), [filteredTasks]);

  const hasActiveFilters =
    filters.priority !== null ||
    filters.assignedTo !== null ||
    filters.dueBefore !== null;

  // ── Status change logic ──────────────────────────────────────────
  const applyStatusChange = useCallback(
    async (task: Task, newStatus: TaskStatus, comment?: string) => {
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

          // Generate notification for status change
          if (profile) {
            await supabase.from('notifications').insert({
              user_id: task.assigned_to,
              type: 'task_status_changed' as const,
              title: 'Estado de tarea actualizado',
              message: `La tarea "${task.title}" cambió a ${newStatus}`,
              reference_id: task.id,
              reference_type: 'task' as const,
            } as any);
          }
        }
      } catch (err) {
        console.error('Error updating task status:', err);
        setStatusError('Error al actualizar el estado de la tarea');
      }
    },
    [profile, upsertTask],
  );

  // ── Drag handler ─────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const newStatus = destination.droppableId as TaskStatus;
      const oldStatus = source.droppableId as TaskStatus;

      if (newStatus === oldStatus) return;

      // Validate transition for role
      if (!isValidTransition(userRole, oldStatus, newStatus)) {
        setStatusError(
          'No tienes permiso para realizar este cambio de estado',
        );
        return;
      }

      const task = tasks.find((t) => t.id === draggableId);
      if (!task) return;

      // If moving to bloqueada, require comment
      if (newStatus === 'bloqueada') {
        setPendingDrop({ task, newStatus });
        setBlockedComment('');
        setShowBlockedDialog(true);
        return;
      }

      // If moving to completada, check evidence
      if (newStatus === 'completada') {
        setPendingDrop({ task, newStatus });
        applyStatusChange(task, newStatus);
        setPendingDrop(null);
        return;
      }

      applyStatusChange(task, newStatus);
    },
    [userRole, tasks, applyStatusChange],
  );

  // ── Blocked dialog confirm ───────────────────────────────────────
  const handleBlockedConfirm = () => {
    if (!pendingDrop) return;
    applyStatusChange(pendingDrop.task, pendingDrop.newStatus, blockedComment);
    setShowBlockedDialog(false);
    setPendingDrop(null);
    setBlockedComment('');
  };

  // ── Project team members for filter dropdown ─────────────────────
  const projectMembers = useMemo(() => {
    return members.filter((m) =>
      m.assignments.some((a) => a.project_id === projectId),
    );
  }, [members, projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and new task button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">
            Tablero de Tareas
          </h2>
          <Badge
            variant="outline"
            className="border-white/10 text-gray-400 text-xs"
          >
            {tasks.length} tareas
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-white/10 text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer ${
              hasActiveFilters ? 'border-brand-400 text-brand-300' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-brand-400" />
            )}
          </Button>

          {canCreateTask && (
            <Button
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setShowTaskForm(true);
              }}
              className="bg-brand-500 hover:bg-brand-400 text-white cursor-pointer transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="rounded-xl border border-white/10 bg-dark-100/50 p-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Priority filter */}
            <div className="space-y-1.5 min-w-[140px]">
              <Label className="text-gray-400 text-xs">Prioridad</Label>
              <Select
                value={filters.priority ?? 'all'}
                onValueChange={(v) =>
                  setFilters({
                    priority: v === 'all' ? null : (v as TaskPriority),
                  })
                }
              >
                <SelectTrigger className="h-8 bg-dark-100/50 border-white/10 text-white text-sm w-full">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-dark-50 border-white/10">
                  <SelectItem
                    value="all"
                    className="text-gray-300 focus:bg-white/10 focus:text-white"
                  >
                    Todas
                  </SelectItem>
                  <SelectItem
                    value="alta"
                    className="text-gray-300 focus:bg-white/10 focus:text-white"
                  >
                    Alta
                  </SelectItem>
                  <SelectItem
                    value="media"
                    className="text-gray-300 focus:bg-white/10 focus:text-white"
                  >
                    Media
                  </SelectItem>
                  <SelectItem
                    value="baja"
                    className="text-gray-300 focus:bg-white/10 focus:text-white"
                  >
                    Baja
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assigned user filter */}
            <div className="space-y-1.5 min-w-[180px]">
              <Label className="text-gray-400 text-xs">Asignado a</Label>
              <Select
                value={filters.assignedTo ?? 'all'}
                onValueChange={(v) =>
                  setFilters({ assignedTo: v === 'all' ? null : v })
                }
              >
                <SelectTrigger className="h-8 bg-dark-100/50 border-white/10 text-white text-sm w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-dark-50 border-white/10">
                  <SelectItem
                    value="all"
                    className="text-gray-300 focus:bg-white/10 focus:text-white"
                  >
                    Todos
                  </SelectItem>
                  {projectMembers.map((m) => (
                    <SelectItem
                      key={m.id}
                      value={m.id}
                      className="text-gray-300 focus:bg-white/10 focus:text-white"
                    >
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due date filter */}
            <div className="space-y-1.5 min-w-[160px]">
              <Label className="text-gray-400 text-xs">Fecha límite antes de</Label>
              <Input
                type="date"
                value={filters.dueBefore ?? ''}
                onChange={(e) =>
                  setFilters({
                    dueBefore: e.target.value || null,
                  })
                }
                className="h-8 bg-dark-100/50 border-white/10 text-white text-sm"
              />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-400 hover:text-white cursor-pointer h-8"
              >
                <X className="h-3.5 w-3.5" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-xl border bg-dark-100/30 min-h-[300px] flex flex-col transition-colors duration-200 ${
                    snapshot.isDraggingOver
                      ? `${col.borderColor} bg-dark-100/60`
                      : 'border-white/5'
                  }`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`}
                      />
                      <span className="text-sm font-medium text-gray-200">
                        {col.label}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-white/10 text-gray-500 text-xs h-5 min-w-[24px] justify-center"
                    >
                      {columns[col.id].length}
                    </Badge>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 p-2 space-y-2">
                    {columns[col.id].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={dragProvided.draggableProps.style as React.CSSProperties}
                            onClick={() => {
                              setDetailTaskId(task.id);
                              setShowDetailDialog(true);
                            }}
                            className={`rounded-lg border border-white/5 bg-dark-50/80 p-3 space-y-2 transition-shadow duration-200 ${
                              dragSnapshot.isDragging
                                ? 'shadow-lg shadow-brand-500/10 border-brand-500/30'
                                : 'hover:border-white/10'
                            } cursor-pointer`}
                          >
                            {/* Title */}
                            <p className="text-sm font-medium text-white leading-snug line-clamp-2">
                              {task.title}
                            </p>

                            {/* Priority badge */}
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 h-4 border ${
                                PRIORITY_CONFIG[task.priority].className
                              }`}
                            >
                              {PRIORITY_CONFIG[task.priority].label}
                            </Badge>

                            {/* Meta info */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1 truncate max-w-[60%]">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {memberNameMap.get(task.assigned_to) ??
                                    'Sin asignar'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 shrink-0" />
                                <span>{task.due_date}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Error toast */}
      {statusError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-red-500/30 bg-dark-50 px-4 py-3 text-sm text-red-300 shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{statusError}</span>
          <button
            onClick={() => setStatusError(null)}
            className="ml-2 text-gray-500 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Blocked reason dialog */}
      <Dialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog}>
        <DialogContent className="bg-dark-50 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Motivo del bloqueo</DialogTitle>
            <DialogDescription className="text-gray-400">
              Describe el motivo por el cual esta tarea está bloqueada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="blocked-comment" className="text-gray-300">
              Comentario
            </Label>
            <Textarea
              id="blocked-comment"
              value={blockedComment}
              onChange={(e) => setBlockedComment(e.target.value)}
              placeholder="Describe el motivo del bloqueo..."
              rows={3}
              className="bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBlockedDialog(false);
                setPendingDrop(null);
              }}
              className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBlockedConfirm}
              disabled={!blockedComment.trim()}
              className="bg-yellow-600 hover:bg-yellow-500 text-white cursor-pointer transition-colors duration-200"
            >
              Confirmar bloqueo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task form dialog */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        projectId={projectId}
        task={editingTask}
      />

      {/* Task detail dialog */}
      <TaskDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        task={detailTask}
      />
    </div>
  );
}

export default KanbanBoard;
