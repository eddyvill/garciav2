import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GestionSidebar from './GestionSidebar';
import GestionHeader from './GestionHeader';
import ConnectionStatus from './ConnectionStatus';

// ── Page title mapping ───────────────────────────────────────────────
const pageTitles: Record<string, string> = {
  '/gestion': 'Dashboard',
  '/gestion/proyectos': 'Proyectos',
  '/gestion/equipo': 'Equipo',
  '/gestion/perfil': 'Perfil',
  '/gestion/reportes': 'Reportes',
  '/gestion/historial': 'Historial',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Prefix match for nested routes (e.g. /gestion/proyectos/:id)
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path + '/')) return title;
  }

  return 'Gestión';
}

// ── Component ────────────────────────────────────────────────────────
function GestionLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const title = getPageTitle(location.pathname);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-dark text-white overflow-hidden">
      {/* Connection status banner */}
      <ConnectionStatus />

      {/* Sidebar */}
      <GestionSidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <GestionHeader title={title} onMenuToggle={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default GestionLayout;
