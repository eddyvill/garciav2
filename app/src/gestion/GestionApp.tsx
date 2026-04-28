import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import GestionLayout from './components/GestionLayout';
import ProyectosList from './pages/ProyectosList';
import ProyectoDetalle from './pages/ProyectoDetalle';
import DashboardGerencia from './pages/DashboardGerencia';
import DashboardSupervisor from './pages/DashboardSupervisor';
import DashboardEjecucion from './pages/DashboardEjecucion';
import EquipoList from './pages/EquipoList';
import PerfilUsuario from './pages/PerfilUsuario';
import ReportesView from './pages/ReportesView';
import HistorialActividades from './pages/HistorialActividades';
import { useAuth } from './context/AuthContext';

// ── Dashboard router by role ─────────────────────────────────────────
function DashboardByRole() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-gray-400">Cargando…</div>
      </div>
    );
  }

  switch (profile.role) {
    case 'gerencia':
      return <DashboardGerencia />;
    case 'supervisor':
      return <DashboardSupervisor />;
    case 'ejecucion':
      return <DashboardEjecucion />;
    default:
      return <DashboardEjecucion />;
  }
}

// ── Main module ──────────────────────────────────────────────────────
function GestionApp() {
  return (
    <Routes>
      {/* All /gestion/* routes are protected — requires active session */}
      <Route element={<ProtectedRoute />}>
        <Route element={<GestionLayout />}>
          <Route index element={<DashboardByRole />} />
          <Route path="proyectos" element={<ProyectosList />} />
          <Route path="proyectos/:id" element={<ProyectoDetalle />} />
          <Route path="equipo" element={<EquipoList />} />
          <Route path="perfil/:id" element={<PerfilUsuario />} />
          <Route path="reportes" element={<ReportesView />} />
          <Route path="historial" element={<HistorialActividades />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default GestionApp;
