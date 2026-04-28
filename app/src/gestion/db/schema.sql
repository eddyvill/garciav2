-- ============================================================
-- Schema SQL — Sistema de Gestión de Proyectos
-- García Construcciones 503
--
-- Ejecutar este archivo en el SQL Editor de Supabase
-- para crear toda la estructura de base de datos.
-- ============================================================

-- ============================================================
-- 1. TIPOS ENUMERADOS
-- ============================================================

CREATE TYPE user_role AS ENUM ('gerencia', 'supervisor', 'ejecucion');
CREATE TYPE project_status AS ENUM ('planificacion', 'en_progreso', 'pausado', 'completado');
CREATE TYPE task_status AS ENUM ('pendiente', 'en_progreso', 'completada', 'bloqueada');
CREATE TYPE task_priority AS ENUM ('alta', 'media', 'baja');
CREATE TYPE notification_type AS ENUM (
  'task_assigned', 'task_status_changed', 'task_due_soon',
  'project_created', 'project_status_changed'
);
CREATE TYPE entity_type AS ENUM ('project', 'task');
CREATE TYPE reference_type AS ENUM ('project', 'task');
CREATE TYPE project_role AS ENUM ('supervisor', 'ejecucion');

-- ============================================================
-- 2. TABLAS
-- ============================================================

-- Perfiles de usuario (vinculado a auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'ejecucion',
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  estimated_end_date DATE NOT NULL,
  status project_status NOT NULL DEFAULT 'planificacion',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Miembros de proyecto (tabla de unión)
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_project project_role NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  UNIQUE(project_id, user_id)
);

-- Tareas
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority task_priority NOT NULL DEFAULT 'media',
  status task_status NOT NULL DEFAULT 'pendiente',
  assigned_to UUID NOT NULL REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Evidencias fotográficas
CREATE TABLE task_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID NOT NULL,
  reference_type reference_type NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historial de actividades
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type entity_type NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. ÍNDICES
-- ============================================================

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_evidence_task ON task_evidence(task_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_performed_by ON activity_log(performed_by);
CREATE INDEX idx_activity_log_performed_at ON activity_log(performed_at);

-- ============================================================
-- 4. FUNCIONES DE BASE DE DATOS
-- ============================================================

-- Función para calcular porcentaje de avance de un proyecto
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS NUMERIC AS $$
  SELECT CASE
    WHEN COUNT(*) = 0 THEN 0
    ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completada')::NUMERIC / COUNT(*)) * 100, 1)
  END
  FROM tasks WHERE project_id = p_project_id;
$$ LANGUAGE sql STABLE;

-- Función para obtener conteo de tareas por estado
CREATE OR REPLACE FUNCTION get_task_counts(p_project_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'pendiente', COUNT(*) FILTER (WHERE status = 'pendiente'),
    'en_progreso', COUNT(*) FILTER (WHERE status = 'en_progreso'),
    'completada', COUNT(*) FILTER (WHERE status = 'completada'),
    'bloqueada', COUNT(*) FILTER (WHERE status = 'bloqueada'),
    'total', COUNT(*)
  )
  FROM tasks WHERE project_id = p_project_id;
$$ LANGUAGE sql STABLE;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para registrar cambios de estado en activity_log
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO activity_log (entity_type, entity_id, action, old_value, new_value, performed_by)
    VALUES (
      TG_ARGV[0]::entity_type,
      NEW.id,
      'status_changed',
      OLD.status::TEXT,
      NEW.status::TEXT,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER projects_status_log AFTER UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_status_change('project');
CREATE TRIGGER tasks_status_log AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_status_change('task');

-- ============================================================
-- 5. SUPABASE STORAGE — Bucket para evidencias fotográficas
-- ============================================================

-- Crear bucket privado para evidencias
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false);

-- Política: Personal de ejecución puede subir a sus tareas
CREATE POLICY "evidence_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT FROM tasks t WHERE t.assigned_to = auth.uid()
    )
  );

-- Política: Miembros del proyecto pueden descargar evidencias
CREATE POLICY "evidence_download" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'evidence'
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::TEXT FROM tasks t
      JOIN project_members pm ON pm.project_id = t.project_id
      WHERE pm.user_id = auth.uid()
    )
  );
