import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificacionesPanel from './NotificacionesPanel';

// ── Role labels ──────────────────────────────────────────────────────
const roleLabels: Record<string, string> = {
  gerencia: 'Gerencia',
  supervisor: 'Supervisor',
  ejecucion: 'Ejecución',
};

// ── Props ────────────────────────────────────────────────────────────
interface GestionHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

// ── Component ────────────────────────────────────────────────────────
function GestionHeader({ title, onMenuToggle }: GestionHeaderProps) {
  const { profile } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  const roleBadge = profile?.role ? roleLabels[profile.role] ?? profile.role : '';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-dark/80 backdrop-blur-xl border-b border-white/5">
      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
      </div>

      {/* Right: notification bell + user info */}
      <div className="flex items-center gap-3">
        {/* Notifications panel */}
        <NotificacionesPanel />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          {/* Avatar / initials */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400 ring-2 ring-brand-500/30">
              {initials}
            </div>
          )}

          {/* Name + role — hidden on very small screens */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-white truncate max-w-[140px]">
              {profile?.full_name ?? 'Usuario'}
            </span>
            {roleBadge && (
              <span className="text-[11px] text-brand-400 font-medium">
                {roleBadge}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default GestionHeader;
