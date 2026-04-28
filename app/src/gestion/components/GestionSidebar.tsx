import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  History,
  LogOut,
  UserCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../../lib/database.types';

// ── Navigation items ─────────────────────────────────────────────────
interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If set, only these roles see the link */
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/gestion', icon: LayoutDashboard },
  { label: 'Proyectos', to: '/gestion/proyectos', icon: FolderKanban },
  { label: 'Equipo', to: '/gestion/equipo', icon: Users },
  {
    label: 'Reportes',
    to: '/gestion/reportes',
    icon: BarChart3,
    roles: ['gerencia'],
  },
  {
    label: 'Historial',
    to: '/gestion/historial',
    icon: History,
    roles: ['gerencia'],
  },
];

// ── Props ────────────────────────────────────────────────────────────
interface GestionSidebarProps {
  open: boolean;
  onClose: () => void;
}

// ── Component ────────────────────────────────────────────────────────
function GestionSidebar({ open, onClose }: GestionSidebarProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const visibleItems = navItems.filter(
    (item) => !item.roles || (profile && item.roles.includes(profile.role)),
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          bg-dark-50/80 backdrop-blur-xl border-r border-white/10
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <a href="/gestion" className="flex items-center gap-2">
            <img
              src="/logo-full-gris (1).png"
              alt="García Construcciones 503"
              className="h-8 w-auto object-contain brightness-100"
            />
          </a>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/gestion'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          {/* Mi Perfil link */}
          {profile && (
            <NavLink
              to={`/gestion/perfil/${profile.id}`}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <UserCircle className="w-5 h-5 flex-shrink-0" />
              <span>Mi Perfil</span>
            </NavLink>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default GestionSidebar;
