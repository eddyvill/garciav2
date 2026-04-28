import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Loader2,
  AlertTriangle,
  Pencil,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useProjectStore } from '../stores/projectStore';
import { hasPermission } from '../utils/authorization';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import TeamAssignment from '../components/TeamAssignment';
import ProjectForm from '../components/ProjectForm';
import KanbanBoard from '../components/KanbanBoard';
import type { Project, ProjectStatus } from '../../lib/database.types';

// ── Status config ────────────────────────────────────────────────────
const STATUS_OPTIONS: {
  value: ProjectStatus;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  {
    value: 'planificacion',
    label: 'Planificación',
    color: 'text-gray-300',
    bgColor: 'bg-gray-500/20 border-gray-500/30',
  },
  {
    value: 'en_progreso',
    label: 'En Progreso',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
  },
  {
    value: 'pausado',
    label: 'Pausado',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/20 border-yellow-500/30',
  },
  {
    value: 'completado',
    label: 'Completado',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20 border-green-500/30',
  },
];

function getStatusConfig(status: ProjectStatus) {
  return (
    STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0]
  );
}

// ── Component ────────────────────────────────────────────────────────
function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, loading } = useProjects();
  const upsertProject = useProjectStore((s) => s.upsertProject);

  const [changingStatus, setChangingStatus] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const userRole = profile?.role ?? 'ejecucion';
  const canEditProject = hasPermission(userRole, 'edit_project');
  const canAssignTeam = hasPermission(userRole, 'assign_team');

  const project = useMemo(
    () => projects.find((p) => p.id === id) ?? null,
    [projects, id],
  );

  // ── Status change handler ────────────────────────────────────────
  const handleStatusChange = async (newStatus: string) => {
    if (!project || !canEditProject) return;
    setChangingStatus(true);

    try {
      const { data: updated, error } = await (supabase
        .from('projects') as any)
        .update({ status: newStatus as ProjectStatus })
        .eq('id', project.id)
        .select()
        .single();

      if (error) throw error;
      if (updated) upsertProject(updated as Project);
    } catch (err) {
      console.error('Error changing project status:', err);
    } finally {
      setChangingStatus(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-10 w-10 text-yellow-400 mb-3" />
        <p className="text-gray-400 text-lg">Proyecto no encontrado</p>
        <Button
          variant="ghost"
          onClick={() => navigate('/gestion/proyectos')}
          className="mt-4 text-brand-400 hover:text-brand-300 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a proyectos
        </Button>
      </div>
    );
  }

  const statusCfg = getStatusConfig(project.status);
  const progress = project.progress_percentage ?? 0;
  const counts = project.task_counts;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/gestion/proyectos')}
        className="text-gray-400 hover:text-white cursor-pointer -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a proyectos
      </Button>

      {/* Project header card */}
      <div className="rounded-2xl border border-white/10 bg-dark-50/60 backdrop-blur-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-start gap-3">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {canEditProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                  className="text-gray-400 hover:text-brand-300 cursor-pointer shrink-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {project.start_date} — {project.estimated_end_date}
                </span>
              </div>
            </div>
          </div>

          {/* Status + Progress */}
          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            {/* Status selector (Gerencia only) */}
            {canEditProject ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Estado:</span>
                <Select
                  value={project.status}
                  onValueChange={handleStatusChange}
                  disabled={changingStatus}
                >
                  <SelectTrigger className="w-[180px] h-9 bg-dark-100/50 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-50 border-white/10">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-gray-300 focus:bg-white/10 focus:text-white"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {changingStatus && (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                )}
              </div>
            ) : (
              <Badge
                variant="outline"
                className={`border ${statusCfg.bgColor} ${statusCfg.color}`}
              >
                {statusCfg.label}
              </Badge>
            )}

            {/* Progress */}
            <div className="w-full lg:w-48 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Avance</span>
                <span className="text-white font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/5" />
            </div>
          </div>
        </div>

        {/* Task counts summary */}
        {counts && counts.total > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-500" />
              <span className="text-gray-400">
                Pendientes: <span className="text-white">{counts.pendiente}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-gray-400">
                En progreso:{' '}
                <span className="text-white">{counts.en_progreso}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-gray-400">
                Completadas:{' '}
                <span className="text-white">{counts.completada}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="text-gray-400">
                Bloqueadas:{' '}
                <span className="text-white">{counts.bloqueada}</span>
              </span>
            </div>
            <span className="text-gray-500 ml-auto">
              {counts.total} tareas en total
            </span>
          </div>
        )}
      </div>

      {/* Team Assignment (Gerencia only) */}
      {canAssignTeam && (
        <div className="rounded-2xl border border-white/10 bg-dark-50/60 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Equipo del Proyecto
          </h2>
          <TeamAssignment projectId={project.id} />
        </div>
      )}

      {/* Kanban board */}
      <div className="rounded-2xl border border-white/10 bg-dark-50/60 backdrop-blur-xl p-6">
        <KanbanBoard projectId={project.id} />
      </div>

      {/* Edit project dialog */}
      {canEditProject && (
        <ProjectForm
          open={showEditForm}
          onOpenChange={setShowEditForm}
          project={project}
        />
      )}
    </div>
  );
}

export default ProyectoDetalle;
