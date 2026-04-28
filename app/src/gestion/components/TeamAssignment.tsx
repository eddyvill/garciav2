import { useState, useMemo } from 'react';
import { Loader2, Users, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import type { ProjectRole } from '../../lib/database.types';

// ── Props ────────────────────────────────────────────────────────────
interface TeamAssignmentProps {
  projectId: string;
}

// ── Component ────────────────────────────────────────────────────────
function TeamAssignment({ projectId }: TeamAssignmentProps) {
  const { profile } = useAuth();
  const { members, loading, error } = useTeamMembers();
  const [saving, setSaving] = useState<string | null>(null);

  // Separate members by role
  const supervisors = useMemo(
    () => members.filter((m) => m.role === 'supervisor'),
    [members],
  );

  const executionPersonnel = useMemo(
    () => members.filter((m) => m.role === 'ejecucion'),
    [members],
  );

  // Check if a user is assigned to this project
  const isAssigned = (userId: string): boolean => {
    const member = members.find((m) => m.id === userId);
    if (!member) return false;
    return member.assignments.some((a) => a.project_id === projectId);
  };

  // Get the role_in_project for a user
  const getRoleInProject = (userRole: string): ProjectRole => {
    return userRole === 'supervisor' ? 'supervisor' : 'ejecucion';
  };

  // Toggle assignment
  const toggleAssignment = async (userId: string, userRole: string) => {
    if (!profile) return;
    setSaving(userId);

    try {
      if (isAssigned(userId)) {
        // Remove assignment
        const { error } = await supabase
          .from('project_members')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Add assignment
        const { error } = await supabase.from('project_members').insert({
          project_id: projectId,
          user_id: userId,
          role_in_project: getRoleInProject(userRole),
          assigned_by: profile.id,
        } as any);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error toggling assignment:', err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Supervisors section */}
      <MemberSection
        title="Supervisores"
        icon={<Users className="h-4 w-4 text-brand-400" />}
        members={supervisors}
        isAssigned={isAssigned}
        saving={saving}
        onToggle={toggleAssignment}
      />

      {/* Execution Personnel section */}
      <MemberSection
        title="Personal de Ejecución"
        icon={<Users className="h-4 w-4 text-blue-400" />}
        members={executionPersonnel}
        isAssigned={isAssigned}
        saving={saving}
        onToggle={toggleAssignment}
      />
    </div>
  );
}

// ── Member section sub-component ─────────────────────────────────────
interface MemberSectionProps {
  title: string;
  icon: React.ReactNode;
  members: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url: string | null;
  }>;
  isAssigned: (userId: string) => boolean;
  saving: string | null;
  onToggle: (userId: string, userRole: string) => void;
}

function MemberSection({
  title,
  icon,
  members,
  isAssigned,
  saving,
  onToggle,
}: MemberSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-gray-500">({members.length})</span>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-500 pl-6">
          No hay {title.toLowerCase()} registrados
        </p>
      ) : (
        <div className="space-y-1">
          {members.map((member) => {
            const assigned = isAssigned(member.id);
            const isSaving = saving === member.id;

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-white/5"
              >
                <Checkbox
                  checked={assigned}
                  disabled={isSaving}
                  onCheckedChange={() => onToggle(member.id, member.role)}
                  className="border-white/20 data-[state=checked]:bg-brand-500 data-[state=checked]:border-brand-500"
                />

                {/* Avatar */}
                <div className="h-8 w-8 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-brand-300">
                      {member.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {member.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.email}
                  </p>
                </div>

                {isSaving && (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400 shrink-0" />
                )}

                {!isSaving && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggle(member.id, member.role)}
                    className={`shrink-0 cursor-pointer ${
                      assigned
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                        : 'text-brand-400 hover:text-brand-300 hover:bg-brand-500/10'
                    }`}
                  >
                    {assigned ? (
                      <UserMinus className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TeamAssignment;
