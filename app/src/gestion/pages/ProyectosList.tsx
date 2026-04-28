import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { getVisibleProjects } from '../utils/filters';
import { hasPermission } from '../utils/authorization';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import type { ProjectStatus } from '../../lib/database.types';
import ProjectForm from '../components/ProjectForm';

// ── Status config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bgColor: string }
> = {
  planificacion: {
    label: 'Planificación',
    color: 'text-gray-300',
    bgColor: 'bg-gray-500/20 border-gray-500/30',
  },
  en_progreso: {
    label: 'En Progreso',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20 border-blue-500/30',
  },
  pausado: {
    label: 'Pausado',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/20 border-yellow-500/30',
  },
  completado: {
    label: 'Completado',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20 border-green-500/30',
  },
};

// ── Component ────────────────────────────────────────────────────────
function ProyectosList() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, loading, error } = useProjects();
  const { members } = useTeamMembers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const userRole = profile?.role ?? 'ejecucion';
  const userId = profile?.id ?? '';
  const canCreateProject = hasPermission(userRole, 'create_project');

  // Filter projects by role visibility
  const visibleProjects = useMemo(() => {
    const memberAssignments = members.flatMap((m) => m.assignments);
    return getVisibleProjects(userRole, userId, projects, memberAssignments);
  }, [userRole, userId, projects, members]);

  // Apply search and status filters
  const filteredProjects = useMemo(() => {
    return visibleProjects.filter((project) => {
      // Search filter
      if (
        searchQuery &&
        !project.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [visibleProjects, searchQuery, statusFilter]);

  // ── Loading state ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Proyectos</h1>
          <p className="text-gray-400 text-sm mt-1">
            {filteredProjects.length} proyecto
            {filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        {canCreateProject && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-brand-500 hover:bg-brand-400 text-white cursor-pointer transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar proyecto por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-dark-100/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:border-brand-400 focus-visible:ring-brand-400/30"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-10 bg-dark-100/50 border-white/10 text-white">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-dark-50 border-white/10">
            <SelectItem value="all" className="text-gray-300 focus:bg-white/10 focus:text-white">
              Todos los estados
            </SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem
                key={key}
                value={key}
                className="text-gray-300 focus:bg-white/10 focus:text-white"
              >
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project cards grid */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <FolderOpen className="h-12 w-12 text-gray-600 mb-3" />
          <p className="text-gray-400 text-lg">No se encontraron proyectos</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchQuery || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Crea un nuevo proyecto para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const statusCfg = STATUS_CONFIG[project.status];
            const progress = project.progress_percentage ?? 0;
            const counts = project.task_counts;

            return (
              <div
                key={project.id}
                onClick={() => navigate(`/gestion/proyectos/${project.id}`)}
                className="group rounded-2xl border border-white/10 bg-dark-50/60 backdrop-blur-xl p-5 cursor-pointer transition-all duration-200 hover:border-brand-400/40 hover:shadow-glow/20"
              >
                {/* Name + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-white group-hover:text-brand-300 transition-colors duration-200 line-clamp-2">
                    {project.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`shrink-0 border ${statusCfg.bgColor} ${statusCfg.color} text-xs`}
                  >
                    {statusCfg.label}
                  </Badge>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{project.location}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avance</span>
                    <span className="text-white font-medium">{progress}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-white/5"
                  />
                </div>

                {/* Task counts */}
                {counts && counts.total > 0 && (
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1" title="Completadas">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                      <span>{counts.completada}</span>
                    </div>
                    <div className="flex items-center gap-1" title="En progreso">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      <span>{counts.en_progreso}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Pendientes">
                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                      <span>{counts.pendiente}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Bloqueadas">
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                      <span>{counts.bloqueada}</span>
                    </div>
                    <span className="ml-auto text-gray-500">
                      {counts.total} total
                    </span>
                  </div>
                )}

                {counts && counts.total === 0 && (
                  <p className="text-xs text-gray-500">Sin tareas asignadas</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create project dialog */}
      {canCreateProject && (
        <ProjectForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          project={null}
        />
      )}
    </div>
  );
}

export default ProyectosList;
