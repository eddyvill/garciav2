import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useTaskStore } from '../stores/taskStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type { Task, TaskPriority } from '../../lib/database.types';

// ── Validation schema ────────────────────────────────────────────────
const taskSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(200, 'Máximo 200 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es obligatoria')
    .max(2000, 'Máximo 2000 caracteres'),
  fecha_limite: z.string().min(1, 'La fecha límite es obligatoria'),
  prioridad: z.enum(['alta', 'media', 'baja'], {
    message: 'La prioridad es obligatoria',
  }),
  asignado_a: z.string().min(1, 'El personal asignado es obligatorio'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

// ── Props ────────────────────────────────────────────────────────────
interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  /** Pass a task for edit mode, null for create mode */
  task: Task | null;
}

// ── Component ────────────────────────────────────────────────────────
function TaskForm({ open, onOpenChange, projectId, task }: TaskFormProps) {
  const { profile } = useAuth();
  const { members } = useTeamMembers();
  const upsertTask = useTaskStore((s) => s.upsertTask);
  const isEditMode = task !== null;

  // Get team members assigned to this project with 'ejecucion' role
  const projectEjecucion = useMemo(() => {
    return members.filter((m) =>
      m.assignments.some(
        (a) => a.project_id === projectId && a.role_in_project === 'ejecucion',
      ),
    );
  }, [members, projectId]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      fecha_limite: '',
      prioridad: 'media',
      asignado_a: '',
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (open && task) {
      reset({
        titulo: task.title,
        descripcion: task.description,
        fecha_limite: task.due_date,
        prioridad: task.priority,
        asignado_a: task.assigned_to,
      });
    } else if (open && !task) {
      reset({
        titulo: '',
        descripcion: '',
        fecha_limite: '',
        prioridad: 'media',
        asignado_a: '',
      });
    }
  }, [open, task, reset]);

  const onSubmit = async (data: TaskFormValues) => {
    if (!profile) return;

    try {
      if (isEditMode) {
        // UPDATE existing task
        const { data: updated, error } = await (supabase
          .from('tasks') as any)
          .update({
            title: data.titulo,
            description: data.descripcion,
            due_date: data.fecha_limite,
            priority: data.prioridad as TaskPriority,
            assigned_to: data.asignado_a,
          })
          .eq('id', task.id)
          .select();

        if (error) throw error;
        if (updated && updated.length > 0) {
          upsertTask(updated[0] as Task);
        }
      } else {
        // INSERT new task
        const { data: created, error } = await supabase
          .from('tasks')
          .insert({
            project_id: projectId,
            title: data.titulo,
            description: data.descripcion,
            due_date: data.fecha_limite,
            priority: data.prioridad as TaskPriority,
            status: 'pendiente',
            assigned_to: data.asignado_a,
            created_by: profile.id,
          } as any)
          .select();

        if (error) throw error;
        if (created && created.length > 0) {
          const newTask = created[0] as Task;
          upsertTask(newTask);

          // Generate notification for assigned user
          const assignedMember = members.find(
            (m) => m.id === data.asignado_a,
          );
          await supabase.from('notifications').insert({
            user_id: data.asignado_a,
            type: 'task_assigned' as const,
            title: 'Nueva tarea asignada',
            message: `Se te ha asignado la tarea "${data.titulo}"${
              assignedMember ? ` en el proyecto` : ''
            }. Fecha límite: ${data.fecha_limite}`,
            reference_id: newTask.id,
            reference_type: 'task' as const,
          } as any);
        }
      }

      onOpenChange(false);
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const inputClasses =
    'h-10 bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-50 border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditMode
              ? 'Modifica los datos de la tarea.'
              : 'Completa los datos para crear una nueva tarea.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="titulo" className="text-gray-300">
              Título
            </Label>
            <Input
              id="titulo"
              placeholder="Ej: Instalar cableado eléctrico"
              className={inputClasses}
              {...register('titulo')}
            />
            {errors.titulo && (
              <p className="text-sm text-red-400">{errors.titulo.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-gray-300">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Describe la tarea..."
              rows={3}
              className="bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30"
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-400">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          {/* Fecha límite + Prioridad row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fecha_limite" className="text-gray-300">
                Fecha límite
              </Label>
              <Input
                id="fecha_limite"
                type="date"
                className={inputClasses}
                {...register('fecha_limite')}
              />
              {errors.fecha_limite && (
                <p className="text-sm text-red-400">
                  {errors.fecha_limite.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-300">Prioridad</Label>
              <Controller
                name="prioridad"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-10 bg-dark-100/50 border-white/10 text-white w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-50 border-white/10">
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
                )}
              />
              {errors.prioridad && (
                <p className="text-sm text-red-400">
                  {errors.prioridad.message}
                </p>
              )}
            </div>
          </div>

          {/* Personal asignado */}
          <div className="space-y-1.5">
            <Label className="text-gray-300">Personal de Ejecución asignado</Label>
            <Controller
              name="asignado_a"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-10 bg-dark-100/50 border-white/10 text-white w-full">
                    <SelectValue placeholder="Seleccionar personal" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-50 border-white/10">
                    {projectEjecucion.length === 0 ? (
                      <SelectItem
                        value="__none__"
                        disabled
                        className="text-gray-500"
                      >
                        No hay personal asignado al proyecto
                      </SelectItem>
                    ) : (
                      projectEjecucion.map((m) => (
                        <SelectItem
                          key={m.id}
                          value={m.id}
                          className="text-gray-300 focus:bg-white/10 focus:text-white"
                        >
                          {m.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.asignado_a && (
              <p className="text-sm text-red-400">
                {errors.asignado_a.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-400 text-white cursor-pointer transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : isEditMode ? (
                'Guardar cambios'
              ) : (
                'Crear tarea'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskForm;
