import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { isOverdue } from '../utils/calculations';
import type { Task } from '../../lib/database.types';

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  bloqueada: 'Bloqueada',
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  pendiente: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  en_progreso: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  completada: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  bloqueada: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const PRIORITY_LABELS: Record<string, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

const PRIORITY_STYLES: Record<string, string> = {
  alta: 'text-red-400',
  media: 'text-amber-400',
  baja: 'text-emerald-400',
};

function DashboardEjecucion() {
  const { profile } = useAuth();
  const { projects } = useProjects();
  const { tasks, loading } = useTasks();
  const navigate = useNavigate();

  const myTasks = useMemo(
    () => (profile ? tasks.filter((t) => t.assigned_to === profile.id) : []),
    [tasks, profile],
  );

  const overdueTasks = useMemo(() => myTasks.filter((t) => isOverdue(t)), [myTasks]);

  // Group tasks by project, then by status
  const tasksByProject = useMemo(() => {
    const projectMap = new Map<string, string>();
    for (const p of projects) {
      projectMap.set(p.id, p.name);
    }

    const grouped = new Map<string, { name: string; tasks: Task[] }>();
    for (const t of myTasks) {
      const existing = grouped.get(t.project_id);
      if (existing) {
        existing.tasks.push(t);
      } else {
        grouped.set(t.project_id, {
          name: projectMap.get(t.project_id) ?? 'Proyecto',
          tasks: [t],
        });
      }
    }
    return grouped;
  }, [myTasks, projects]);

  if (loading) {
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
          <CheckCircle2 className="w-5 h-5 text-brand-400" />
          <div>
            <p className="text-xs text-gray-400">Mis Tareas</p>
            <p className="text-2xl font-bold text-white">{myTasks.length}</p>
          </div>
        </div>
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-3">
          <ArrowUpRight className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400">En Progreso</p>
            <p className="text-2xl font-bold text-white">
              {myTasks.filter((t) => t.status === 'en_progreso').length}
            </p>
          </div>
        </div>
        <div className={`bg-dark-50/60 backdrop-blur-sm border rounded-xl p-4 flex items-center gap-3 ${overdueTasks.length > 0 ? 'border-red-500/30' : 'border-white/10'}`}>
          <Clock className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-xs text-gray-400">Vencidas</p>
            <p className={`text-2xl font-bold ${overdueTasks.length > 0 ? 'text-red-400' : 'text-white'}`}>
              {overdueTasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks grouped by project */}
      {tasksByProject.size === 0 && (
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
          <p className="text-gray-500">No tienes tareas asignadas.</p>
        </div>
      )}

      {Array.from(tasksByProject.entries()).map(([projectId, { name, tasks: projectTasks }]) => (
        <div
          key={projectId}
          className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5"
        >
          <h3 className="text-sm font-semibold text-white mb-3">{name}</h3>
          <div className="space-y-2">
            {projectTasks.map((task) => {
              const overdue = isOverdue(task);
              return (
                <div
                  key={task.id}
                  onClick={() => navigate(`/gestion/proyectos/${task.project_id}`)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                    overdue
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                      : 'bg-white/[0.02] border-white/5 hover:border-brand-500/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white truncate">{task.title}</span>
                      {overdue && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={PRIORITY_STYLES[task.priority]}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <span className="text-gray-500">Vence: {task.due_date}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_BADGE_STYLES[task.status]}`}
                  >
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardEjecucion;
