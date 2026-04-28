import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, Users, FolderKanban } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { getTaskCounts, isOverdue, hasHighBlockedRate } from '../utils/calculations';
import type { Task } from '../../lib/database.types';

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

function ReportesView() {
  const { projects, loading: loadingProjects } = useProjects();
  const { tasks, loading: loadingTasks } = useTasks();
  const { members } = useTeamMembers();

  // ── Project progress report data ──────────────────────────────────
  const projectReportData = useMemo(() => {
    const tasksByProject = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = tasksByProject.get(t.project_id) ?? [];
      list.push(t);
      tasksByProject.set(t.project_id, list);
    }

    return projects.map((p) => {
      const pts = tasksByProject.get(p.id) ?? [];
      const counts = getTaskCounts(pts);
      const overdueCount = pts.filter((t) => isOverdue(t)).length;
      const highBlocked = hasHighBlockedRate(pts);
      return {
        name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
        progress: p.progress_percentage ?? 0,
        ...counts,
        overdue: overdueCount,
        highBlocked,
      };
    });
  }, [projects, tasks]);

  // ── Personnel performance report data ─────────────────────────────
  const personnelReportData = useMemo(() => {
    const ejecucionMembers = members.filter((m) => m.role === 'ejecucion');

    return ejecucionMembers.map((member) => {
      const memberTasks = tasks.filter((t) => t.assigned_to === member.id);
      const completed = memberTasks.filter((t) => t.status === 'completada').length;
      const overdue = memberTasks.filter((t) => isOverdue(t)).length;
      const total = memberTasks.length;

      // Average execution time (days from created_at to updated_at for completed tasks)
      const completedTasks = memberTasks.filter((t) => t.status === 'completada');
      let avgDays = 0;
      if (completedTasks.length > 0) {
        const totalDays = completedTasks.reduce((acc, t) => {
          const created = new Date(t.created_at).getTime();
          const updated = new Date(t.updated_at).getTime();
          return acc + (updated - created) / (1000 * 60 * 60 * 24);
        }, 0);
        avgDays = Math.round((totalDays / completedTasks.length) * 10) / 10;
      }

      return {
        name: member.full_name.split(' ').slice(0, 2).join(' '),
        completadas: completed,
        vencidas: overdue,
        total,
        promedioDias: avgDays,
      };
    });
  }, [members, tasks]);

  // ── Global pie data ───────────────────────────────────────────────
  const globalPieData = useMemo(() => {
    const counts = getTaskCounts(tasks);
    return (['pendiente', 'en_progreso', 'completada', 'bloqueada'] as const).map((status) => ({
      name: STATUS_LABELS[status],
      value: counts[status],
      color: STATUS_COLORS[status],
    }));
  }, [tasks]);

  if (loadingProjects || loadingTasks) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando reportes…</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Reportes</h2>
      </div>

      {/* ── Section: Project Progress Report ─────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Avance por Proyecto</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress bar chart */}
          <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <h4 className="text-xs text-gray-400 mb-3">Porcentaje de Avance</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectReportData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#d1d5db' }}
                />
                <Bar dataKey="progress" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Avance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Global task distribution pie */}
          <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <h4 className="text-xs text-gray-400 mb-3">Distribución Global de Tareas</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={globalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {globalPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#d1d5db' }}
                />
                <Legend wrapperStyle={{ color: '#d1d5db', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project details table */}
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Proyecto</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Avance</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Pend.</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Prog.</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Comp.</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Bloq.</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Vencidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projectReportData.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        {row.name}
                        {row.highBlocked && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-red-500/20 text-red-400">⚠</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-brand-400 font-medium">{row.progress}%</td>
                    <td className="px-4 py-3 text-center text-amber-400">{row.pendiente}</td>
                    <td className="px-4 py-3 text-center text-blue-400">{row.en_progreso}</td>
                    <td className="px-4 py-3 text-center text-emerald-400">{row.completada}</td>
                    <td className="px-4 py-3 text-center text-red-400">{row.bloqueada}</td>
                    <td className="px-4 py-3 text-center text-amber-400">{row.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Section: Personnel Performance Report ────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Rendimiento del Personal</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks completed bar chart */}
          <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <h4 className="text-xs text-gray-400 mb-3">Tareas Completadas vs Vencidas</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={personnelReportData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#d1d5db' }}
                />
                <Bar dataKey="completadas" fill="#10b981" name="Completadas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vencidas" fill="#ef4444" name="Vencidas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average execution time line chart */}
          <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <h4 className="text-xs text-gray-400 mb-3">Tiempo Promedio de Ejecución (días)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={personnelReportData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#d1d5db' }}
                />
                <Line
                  type="monotone"
                  dataKey="promedioDias"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  name="Promedio (días)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personnel table */}
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Personal</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Completadas</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Vencidas</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase">Prom. Días</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {personnelReportData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No hay datos de personal.
                    </td>
                  </tr>
                ) : (
                  personnelReportData.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white">{row.name}</td>
                      <td className="px-4 py-3 text-center text-gray-300">{row.total}</td>
                      <td className="px-4 py-3 text-center text-emerald-400">{row.completadas}</td>
                      <td className="px-4 py-3 text-center text-red-400">{row.vencidas}</td>
                      <td className="px-4 py-3 text-center text-purple-400">{row.promedioDias}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ReportesView;
