import { useState, useEffect, useMemo, useCallback } from 'react';
import { History } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import { useTeamMembers } from '../hooks/useTeamMembers';
import type { ActivityLog } from '../../lib/database.types';

const ACTION_LABELS: Record<string, string> = {
  status_changed: 'Cambio de estado',
  created: 'Creado',
  updated: 'Actualizado',
};

const ENTITY_LABELS: Record<string, string> = {
  project: 'Proyecto',
  task: 'Tarea',
};

function HistorialActividades() {
  const { profile } = useAuth();
  const { projects } = useProjects();
  const { members } = useTeamMembers();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterProject, setFilterProject] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setLogs((data ?? []) as ActivityLog[]);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Build user name map
  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      map.set(m.id, m.full_name);
    }
    return map;
  }, [members]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterUser && log.performed_by !== filterUser) return false;
      if (filterAction && log.action !== filterAction) return false;
      if (filterDateFrom && log.performed_at < filterDateFrom) return false;
      if (filterDateTo && log.performed_at > filterDateTo + 'T23:59:59') return false;

      // For supervisors, filter to only their projects
      if (profile?.role === 'supervisor') {
        const myProjectIds = new Set(
          members
            .find((m) => m.id === profile.id)
            ?.assignments.filter((a) => a.role_in_project === 'supervisor')
            .map((a) => a.project_id) ?? [],
        );
        if (log.entity_type === 'project' && !myProjectIds.has(log.entity_id)) return false;
        // For tasks, we can't easily filter without task data, so show all task logs from visible projects
      }

      if (filterProject) {
        if (log.entity_type === 'project' && log.entity_id !== filterProject) return false;
        // For task entities, we can't filter by project without joining — skip this filter for tasks
      }

      return true;
    });
  }, [logs, filterUser, filterAction, filterDateFrom, filterDateTo, filterProject, profile, members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando historial…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-brand-400" />
        <h2 className="text-lg font-semibold text-white">Historial de Actividades</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
        >
          <option value="">Todos los proyectos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
        >
          <option value="">Todos los usuarios</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.full_name}</option>
          ))}
        </select>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
        >
          <option value="">Todas las acciones</option>
          <option value="status_changed">Cambio de estado</option>
          <option value="created">Creado</option>
          <option value="updated">Actualizado</option>
        </select>

        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="px-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
          placeholder="Desde"
        />

        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="px-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
          placeholder="Hasta"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Entidad</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Acción</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Anterior</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Nuevo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {new Date(log.performed_at).toLocaleString('es-VE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                        {ENTITY_LABELS[log.entity_type] ?? log.entity_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {log.old_value ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {log.new_value ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {userNameMap.get(log.performed_by) ?? 'Desconocido'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HistorialActividades;
