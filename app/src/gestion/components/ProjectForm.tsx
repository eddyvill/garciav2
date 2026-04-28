import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProjectStore } from '../stores/projectStore';
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
import type { Project } from '../../lib/database.types';

// ── Validation schema ────────────────────────────────────────────────
const projectSchema = z
  .object({
    nombre: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .max(200, 'Máximo 200 caracteres'),
    descripcion: z
      .string()
      .min(1, 'La descripción es obligatoria')
      .max(2000, 'Máximo 2000 caracteres'),
    ubicacion: z
      .string()
      .min(1, 'La ubicación es obligatoria')
      .max(300, 'Máximo 300 caracteres'),
    fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
    fecha_fin_estimada: z
      .string()
      .min(1, 'La fecha estimada de finalización es obligatoria'),
  })
  .refine(
    (data) => {
      if (data.fecha_inicio && data.fecha_fin_estimada) {
        return data.fecha_fin_estimada >= data.fecha_inicio;
      }
      return true;
    },
    {
      message:
        'La fecha de finalización debe ser igual o posterior a la fecha de inicio',
      path: ['fecha_fin_estimada'],
    },
  );

type ProjectFormValues = z.infer<typeof projectSchema>;

// ── Props ────────────────────────────────────────────────────────────
interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a project for edit mode, null for create mode */
  project: Project | null;
}

// ── Component ────────────────────────────────────────────────────────
function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const { profile } = useAuth();
  const upsertProject = useProjectStore((s) => s.upsertProject);
  const isEditMode = project !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      ubicacion: '',
      fecha_inicio: '',
      fecha_fin_estimada: '',
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (open && project) {
      reset({
        nombre: project.name,
        descripcion: project.description,
        ubicacion: project.location,
        fecha_inicio: project.start_date,
        fecha_fin_estimada: project.estimated_end_date,
      });
    } else if (open && !project) {
      reset({
        nombre: '',
        descripcion: '',
        ubicacion: '',
        fecha_inicio: '',
        fecha_fin_estimada: '',
      });
    }
  }, [open, project, reset]);

  const onSubmit = async (data: ProjectFormValues) => {
    if (!profile) return;

    try {
      if (isEditMode) {
        // UPDATE existing project
        const { data: updated, error } = await (supabase
          .from('projects') as any)
          .update({
            name: data.nombre,
            description: data.descripcion,
            location: data.ubicacion,
            start_date: data.fecha_inicio,
            estimated_end_date: data.fecha_fin_estimada,
          })
          .eq('id', project.id)
          .select()
          .single();

        if (error) throw error;
        if (updated) upsertProject(updated as Project);
      } else {
        // INSERT new project
        const { data: created, error } = await supabase
          .from('projects')
          .insert({
            name: data.nombre,
            description: data.descripcion,
            location: data.ubicacion,
            start_date: data.fecha_inicio,
            estimated_end_date: data.fecha_fin_estimada,
            status: 'planificacion',
            created_by: profile.id,
          } as any)
          .select()
          .single();

        if (error) throw error;
        if (created) {
          upsertProject({
            ...(created as Project),
            progress_percentage: 0,
            task_counts: {
              pendiente: 0,
              en_progreso: 0,
              completada: 0,
              bloqueada: 0,
              total: 0,
            },
          });
        }
      }

      onOpenChange(false);
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const inputClasses =
    'h-10 bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-50 border-white/10 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditMode ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditMode
              ? 'Modifica los datos del proyecto.'
              : 'Completa los datos para crear un nuevo proyecto.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-gray-300">
              Nombre del proyecto
            </Label>
            <Input
              id="nombre"
              placeholder="Ej: Subestación Araya"
              className={inputClasses}
              {...register('nombre')}
            />
            {errors.nombre && (
              <p className="text-sm text-red-400">{errors.nombre.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-gray-300">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Describe el proyecto..."
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

          {/* Ubicación */}
          <div className="space-y-1.5">
            <Label htmlFor="ubicacion" className="text-gray-300">
              Ubicación
            </Label>
            <Input
              id="ubicacion"
              placeholder="Ej: Cumaná, Estado Sucre"
              className={inputClasses}
              {...register('ubicacion')}
            />
            {errors.ubicacion && (
              <p className="text-sm text-red-400">
                {errors.ubicacion.message}
              </p>
            )}
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fecha_inicio" className="text-gray-300">
                Fecha de inicio
              </Label>
              <Input
                id="fecha_inicio"
                type="date"
                className={inputClasses}
                {...register('fecha_inicio')}
              />
              {errors.fecha_inicio && (
                <p className="text-sm text-red-400">
                  {errors.fecha_inicio.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fecha_fin_estimada" className="text-gray-300">
                Fecha estimada de fin
              </Label>
              <Input
                id="fecha_fin_estimada"
                type="date"
                className={inputClasses}
                {...register('fecha_fin_estimada')}
              />
              {errors.fecha_fin_estimada && (
                <p className="text-sm text-red-400">
                  {errors.fecha_fin_estimada.message}
                </p>
              )}
            </div>
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
                'Crear proyecto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectForm;
