import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { User, Mail, Phone, Shield, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { UserProfile } from '../../lib/database.types';

const ROLE_LABELS: Record<string, string> = {
  gerencia: 'Gerencia',
  supervisor: 'Supervisor',
  ejecucion: 'Ejecución',
};

function PerfilUsuario() {
  const { id } = useParams<{ id: string }>();
  const { profile: currentProfile } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [message, setMessage] = useState('');

  const isOwnProfile = currentProfile?.id === id;

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id);

      if (error) throw error;
      const profile = (data && data.length > 0) ? data[0] as UserProfile : null;
      setProfileData(profile);
      if (profile) {
        setFormName(profile.full_name);
        setFormPhone(profile.phone ?? '');
      }
    } catch {
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = useCallback(async () => {
    if (!id || !isOwnProfile) return;
    setSaving(true);
    setMessage('');

    try {
      const { error } = await (supabase
        .from('profiles') as any)
        .update({ full_name: formName.trim(), phone: formPhone.trim() || null })
        .eq('id', id);

      if (error) throw error;
      setMessage('Perfil actualizado correctamente');
      setEditMode(false);
      fetchProfile();
    } catch {
      setMessage('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  }, [id, isOwnProfile, formName, formPhone, fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando perfil…</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Perfil no encontrado.</p>
      </div>
    );
  }

  const initials = profileData.full_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="bg-dark-50/60 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          {profileData.avatar_url ? (
            <img
              src={profileData.avatar_url}
              alt={profileData.full_name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-brand-500/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center text-lg font-bold text-brand-400 ring-2 ring-brand-500/30">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white">{profileData.full_name}</h2>
            <span className="text-sm text-brand-400">{ROLE_LABELS[profileData.role]}</span>
          </div>
        </div>

        {/* Info fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {editMode ? (
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="flex-1 px-3 py-2 bg-dark/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50"
              />
            ) : (
              <span className="text-sm text-gray-300">{profileData.full_name}</span>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-300">{profileData.email}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            {editMode ? (
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="Teléfono"
                className="flex-1 px-3 py-2 bg-dark/60 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500/50"
              />
            ) : (
              <span className="text-sm text-gray-300">
                {profileData.phone ?? 'No registrado'}
              </span>
            )}
          </div>

          {/* Role (read-only) */}
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-300">{ROLE_LABELS[profileData.role]}</span>
          </div>
        </div>

        {/* Actions */}
        {isOwnProfile && (
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving || !formName.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormName(profileData.full_name);
                    setFormPhone(profileData.phone ?? '');
                  }}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                Editar perfil
              </button>
            )}
          </div>
        )}

        {/* Message */}
        {message && (
          <p className={`mt-3 text-sm ${message.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default PerfilUsuario;
