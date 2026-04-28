import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserPlus } from 'lucide-react';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { getTaskCounts } from '../utils/calculations';
import CreateUserForm from '../components/CreateUserForm';
import type { UserRole, Task } from '../../lib/database.types';

const ROLE_LABELS: Record<string, string> = {
  gerencia: 'Gerencia',
  supervisor: 'Supervisor',
  ejecucion: 'Ejecución',
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  gerencia: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  supervisor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  ejecucion: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
};

function EquipoList() {
  const { profile } = useAuth();
  const { members, loading, refetch } = useTeamMembers();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [projectFilter, setProjectFilter] = useState('');
  const [createUserOpen, setCreateUserOpen] = useState(false);

  const isGerencia = profile?.role === 'gerencia';

  // Determine visible members based on role
  const visibleMembers = useMemo(() => {
    if (!profile) return [];

    if (profile.role === 'gerencia') return members;

    // Supervisor sees only team members from their projects
    const myProjectIds = new Set(
      members
        .find((m) => m.id === profile.id)
        ?.assignments.map((a) => a.project_id) ?? [],
    );

    return members.filter((m) => {
      if (m.id === profile.id) return true;
      return m.assignments.some((a) => myProjectIds.has(a.project_id));
    });
  }, [members, profile]);

  // Apply filters
  const filteredMembers = useMemo(() => {
    return visibleMembers.filter((m) => {
      if (search && !m.full_name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (roleFilter && m.role !== roleFilter) return false;
      if (projectFilter && !m.assignments.some((a) => a.project_id === projectFilter)) return false;
      return true;
    });
  }, [visibleMembers, search, roleFilter, projectFilter]);

  // Task counts per member
  const taskCountsByMember = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const list = map.get(t.assigned_to) ?? [];
      list.push(t);
      map.set(t.assigned_to, list);
    }
    return map;
  }, [tasks]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando equipo…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-semibold text-white">Equipo</h2>
          <span className="text-sm text-gray-500">({filteredMembers.length})</span>
        </div>
        {isGerencia && (
          <button
            onClick={() => setCreateUserOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        )}
      </div>

      {/* Create User Dialog */}
      {isGerencia && (
        <CreateUserForm
          open={createUserOpen}
          onOpenChange={setCreateUserOpen}
          onUserCreated={refetch}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
          className="px-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
        >
          <option value="">Todos los roles</option>
          <option value="gerencia">Gerencia</option>
          <option value="supervisor">Supervisor</option>
          <option value="ejecucion">Ejecución</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 bg-dark-50/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 cursor-pointer"
        >
          <option value="">Todos los proyectos</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Members grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
          <p className="text-gray-500">No se encontraron miembros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const memberTasks = taskCountsByMember.get(member.id) ?? [];
            const counts = getTaskCounts(memberTasks);
            const initials = member.full_name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={member.id}
                onClick={() => navigate(`/gestion/perfil/${member.id}`)}
                className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-brand-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400 ring-2 ring-brand-500/20">
                      {initials}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">{member.full_name}</h3>
                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-medium mt-0.5 ${ROLE_BADGE_STYLES[member.role]}`}>
                      {ROLE_LABELS[member.role]}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 truncate">{member.email}</p>
                    {member.phone && (
                      <p className="text-xs text-gray-500 truncate">{member.phone}</p>
                    )}
                  </div>
                </div>

                {/* Task counts */}
                {counts.total > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                      {counts.pendiente} pend.
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {counts.en_progreso} prog.
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      {counts.completada} comp.
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      {counts.bloqueada} bloq.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EquipoList;
