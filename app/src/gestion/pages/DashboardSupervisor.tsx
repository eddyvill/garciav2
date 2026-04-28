import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FolderKanban, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useAuth } from '../context/AuthContext';
import { isOverdue, getTaskCounts } from '../utils/calculations';
import { getVisibleProjects } from '../utils/filters';
import type { Task } from '../../lib/database.types';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  bloqueada: 'Bloqueada',
};

const STATUS_DOT_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-400',
  en_progreso: 'bg-blue-400',
  completada: 'bg-emerald-400',
  bloqueada: 'bg-red-400',
};

function DashboardSupervisor() {
  const { profile } = useAuth();
  const { projects, loading: loadingProjects } = useProjects();
  const { tasks, loading: loadingTasks } = useTasks();
  const { members } = useTeamMembers();
  const navigate = useNavigate();

  const myProjects = useMemo(() => {
    if (!profile) return [];
    const allMembers = members.flatMap((m) => m.assignments);
    return getVisibleProjects(profile.role, profile.id, projects, allMembers);
  }, [profile, projects, members]);

  const tasksByProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = map.get(t.project_id) ?? [];
      list.push(t);
      map.set(t.project_id, list);
    }
    return map;
  }, [tasks]);

  const totalOverdue = useMemo(() => {
    const projectIds = new Set(myProjects.map((p) => p.id));
    return tasks.filter((t) => projectIds.has(t.project_id) && isOverdue(t));
  }, [tasks, myProjects]);

  if (loadingProjects || loadingTasks) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando dashboard…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <FolderKanban className="w-5 h-5 text-brand-400" />
          <div>
            <p className="text-xs text-gray-400">Mis Proyectos</p>
            <p className="text-2xl font-bold text-white">{myProjects.length}</p>
          </div>
        </div>
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs text-gray-400">Tareas en Mis Proyectos</p>
            <p className="text-2xl font-bold text-white">
              {myProjects.reduce((acc, p) => acc + (tasksByProject.get(p.id)?.length ?? 0), 0)}
            </p>
          </div>
        </div>
        <div className={`bg-dark-50/60 backdrop-blur-sm border rounded-xl p-4 flex items-center gap-3 ${totalOverdue.length > 0 ? 'border-red-500/30' : 'border-white/10'}`}>
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-xs text-gray-400">Tareas Vencidas</p>
            <p className={`text-2xl font-bold ${totalOverdue.length > 0 ? 'text-red-400' : 'text-white'}`}>
              {totalOverdue.length}
            </p>
          </div>
        </div>
      </div>

      {/* Projects list */}
      <div className="space-y-4">
        {myProjects.length === 0 && (
          <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <p className="text-gray-500">No tienes proyectos asignados.</p>
          </div>
        )}
        {myProjects.map((project) => {
          const pts = tasksByProject.get(project.id) ?? [];
          const counts = getTaskCounts(pts);
          const overdueInProject = pts.filter((t) => isOverdue(t));
          const progress = project.progress_percentage ?? 0;

          return (
            <div
              key={project.id}
              onClick={() => navigate(`/gestion/proyectos/${project.id}`)}
              className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-brand-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{project.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{project.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold text-brand-400">{progress}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Task breakdown */}
              <div className="flex flex-wrap gap-3 text-xs">
                {(['pendiente', 'en_progreso', 'completada', 'bloqueada'] as const).map((status) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
                    <span className="text-gray-400">
                      {STATUS_LABELS[status]}: <span className="text-white font-medium">{counts[status]}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Overdue warning */}
              {overdueInProject.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{overdueInProject.length} tarea{overdueInProject.length > 1 ? 's' : ''} vencida{overdueInProject.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardSupervisor;
