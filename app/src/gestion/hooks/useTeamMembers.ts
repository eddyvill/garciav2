import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { UserProfile, ProjectMember } from '../../lib/database.types';

export interface TeamMember extends UserProfile {
  assignments: ProjectMember[];
}

/**
 * Fetches all user profiles and their project_members assignments.
 */
export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profilesRes, assignmentsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('full_name'),
        supabase.from('project_members').select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      const profiles = (profilesRes.data ?? []) as UserProfile[];
      const assignments = (assignmentsRes.data ?? []) as ProjectMember[];

      const assignmentsByUser = new Map<string, ProjectMember[]>();
      for (const a of assignments) {
        const list = assignmentsByUser.get(a.user_id) ?? [];
        list.push(a);
        assignmentsByUser.set(a.user_id, list);
      }

      setMembers(profiles.map((p) => ({
        ...p,
        assignments: assignmentsByUser.get(p.id) ?? [],
      })));
    } catch (err) {
      setError((err as Error).message ?? 'Error al cargar equipo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return { members, loading, error, refetch: fetchTeamMembers };
}
