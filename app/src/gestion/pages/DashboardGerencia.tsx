import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertTriangle, Clock, FolderKanban, CheckCircle2 } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { isOverdue, hasHighBlockedRate, getTaskCounts } from '../utils/calculations';
import type { Task, Project } from '../../lib/database.types';

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#f59e0b',
  en_progreso: '#3b82f6',
  completada: '#10b981',
  bloqueada: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  bloqueada: 'Bloqueada',
};

function DashboardGerencia() {
  const { projects, loading: loadingProjects } = useProjects();
  const { tasks, loading: loadingTasks } = useTasks();
  const navigate = useNavigate();

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status !== 'completado'),
    [projects],
  );

  const tasksByProject = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = map.get(t.project_id) ?? [];
      list.push(t);
      map.set(t.project_id, list);
    }
    return map;
  }, [tasks]);

  const overdueTasks = useMemo(
    () => tasks.filter((t) => isOverdue(t)),
    [tasks],
  );

  const globalCounts = useMemo(() => getTaskCounts(tasks), [tasks]);

  const pieData = useMemo(
    () =>
      (['pendiente', 'en_progreso', 'completada', 'bloqueada'] as const).map((status) => ({
        name: STATUS_LABELS[status],
        value: globalCounts[status],
        color: STATUS_COLORS[status],
      })),
    [globalCounts],
  );

  const barData = useMemo(
    () =>
      activeProjects.map((p) => {
        const pts = tasksByProject.get(p.id) ?? [];
        const counts = getTaskCounts(pts);
        return {
          name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
          Pendiente: counts.pendiente,
          'En Progreso': counts.en_progreso,
          Completada: counts.completada,
          Bloqueada: counts.bloqueada,
        };
      }),
    [activeProjects, tasksByProject],
  );

  if (loadingProjects || loadingTasks) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando dashboard…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<FolderKanban className="w-5 h-5 text-brand-400" />}
          label="Proyectos Activos"
          value={activeProjects.length}
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          label="Tareas Completadas"
          value={globalCounts.completada}
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          label="Tareas Vencidas"
          value={overdueTasks.length}
          alert={overdueTasks.length > 0}
        />
        <SummaryCard
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          label="Tareas Bloqueadas"
          value={globalCounts.bloqueada}
          alert={globalCounts.bloqueada > 0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart - task distribution */}
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Distribución de Tareas</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Legend
                wrapperStyle={{ color: '#d1d5db', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - tasks per project */}
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Tareas por Proyecto</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Bar dataKey="Pendiente" stackId="a" fill={STATUS_COLORS.pendiente} />
              <Bar dataKey="En Progreso" stackId="a" fill={STATUS_COLORS.en_progreso} />
              <Bar dataKey="Completada" stackId="a" fill={STATUS_COLORS.completada} />
              <Bar dataKey="Bloqueada" stackId="a" fill={STATUS_COLORS.bloqueada} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active projects list */}
      <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Proyectos Activos</h3>
        <div className="space-y-3">
          {activeProjects.length === 0 && (
            <p className="text-gray-500 text-sm">No hay proyectos activos.</p>
          )}
          {activeProjects.map((project) => {
            const pts = tasksByProject.get(project.id) ?? [];
            const highBlocked = hasHighBlockedRate(pts);
            const projectOverdue = pts.filter((t) => isOverdue(t));
            return (
              <ProjectRow
                key={project.id}
                project={project}
                taskCount={pts.length}
                highBlocked={highBlocked}
                overdueCount={projectOverdue.length}
                onClick={() => navigate(`/gestion/proyectos/${project.id}`)}
              />
            );
          })}
        </div>
      </div>

      {/* Overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className="bg-dark-50/60 backdrop-blur-sm border border-red-500/20 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Tareas Vencidas ({overdueTasks.length})
          </h3>
          <div className="space-y-2">
            {overdueTasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10"
              >
                <span className="text-sm text-gray-300 truncate">{task.title}</span>
                <span className="text-xs text-red-400 whitespace-nowrap ml-2">
                  Vence: {task.due_date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function SummaryCard({
  icon,
  label,
  value,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div
      className={`bg-dark-50/60 backdrop-blur-sm border rounded-xl p-4 ${
        alert ? 'border-red-500/30' : 'border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className={`text-2xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  taskCount,
  highBlocked,
  overdueCount,
  onClick,
}: {
  project: Project;
  taskCount: number;
  highBlocked: boolean;
  overdueCount: number;
  onClick: () => void;
}) {
  const progress = project.progress_percentage ?? 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-brand-500/30 hover:bg-white/[0.04] transition-all cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{project.name}</span>
          {highBlocked && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium whitespace-nowrap">
              Alto bloqueo
            </span>
          )}
          {overdueCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium whitespace-nowrap">
              {overdueCount} vencida{overdueCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{taskCount} tareas · {project.location}</p>
      </div>

      {/* Progress bar */}
      <div className="w-24 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardGerencia;
