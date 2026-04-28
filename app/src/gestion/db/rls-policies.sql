-- ============================================================
-- Row Level Security (RLS) Policies
-- Sistema de Gestión de Proyectos — García Construcciones 503
--
-- Ejecutar este archivo en el SQL Editor de Supabase
-- DESPUÉS de ejecutar schema.sql.
--
-- Incluye:
--   - Habilitación de RLS en todas las tablas
--   - Políticas para: profiles, projects, project_members,
--     tasks, task_evidence, notifications, activity_log
--   - Políticas de Supabase Storage para el bucket "evidence"
-- ============================================================

-- ============================================================
-- 1. HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. POLÍTICAS — PROFILES
-- ============================================================

-- Todos los usuarios autenticados pueden ver perfiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

-- Usuarios pueden editar su propio perfil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Gerencia puede editar cualquier perfil
CREATE POLICY "profiles_update_gerencia" ON profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- ============================================================
-- 3. POLÍTICAS — PROJECTS
-- ============================================================

-- Gerencia ve todos los proyectos
CREATE POLICY "projects_select_gerencia" ON projects
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- Supervisores y ejecución ven solo sus proyectos asignados
CREATE POLICY "projects_select_members" ON projects
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()
  ));

-- Solo gerencia puede crear proyectos
CREATE POLICY "projects_insert_gerencia" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- Solo gerencia puede editar proyectos
CREATE POLICY "projects_update_gerencia" ON projects
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- ============================================================
-- 4. POLÍTICAS — PROJECT_MEMBERS
-- ============================================================

-- Gerencia puede ver todos los miembros de proyecto
CREATE POLICY "project_members_select_gerencia" ON project_members
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- Miembros pueden ver a otros miembros de sus proyectos
CREATE POLICY "project_members_select_members" ON project_members
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_members pm WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
  ));

-- Solo gerencia puede asignar miembros a proyectos
CREATE POLICY "project_members_insert_gerencia" ON project_members
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- Solo gerencia puede eliminar miembros de proyectos
CREATE POLICY "project_members_delete_gerencia" ON project_members
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- ============================================================
-- 5. POLÍTICAS — TASKS
-- ============================================================

-- Usuarios ven tareas de sus proyectos asignados
CREATE POLICY "tasks_select_members" ON tasks
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_members WHERE project_id = tasks.project_id AND user_id = auth.uid()
  ));

-- Gerencia ve todas las tareas
CREATE POLICY "tasks_select_gerencia" ON tasks
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- Gerencia y supervisores del proyecto pueden crear tareas
CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia')
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = tasks.project_id AND user_id = auth.uid() AND role_in_project = 'supervisor'
    )
  );

-- Gerencia y supervisores pueden editar tareas del proyecto
CREATE POLICY "tasks_update_managers" ON tasks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia')
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = tasks.project_id AND user_id = auth.uid() AND role_in_project = 'supervisor'
    )
  );

-- Personal de ejecución puede actualizar estado de sus tareas asignadas
CREATE POLICY "tasks_update_assigned" ON tasks
  FOR UPDATE TO authenticated
  USING (assigned_to = auth.uid());

-- ============================================================
-- 6. POLÍTICAS — TASK_EVIDENCE
-- ============================================================

-- Miembros del proyecto pueden ver evidencias
CREATE POLICY "evidence_select_members" ON task_evidence
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks t
    JOIN project_members pm ON pm.project_id = t.project_id
    WHERE t.id = task_evidence.task_id AND pm.user_id = auth.uid()
  ));

-- Gerencia puede ver todas las evidencias
CREATE POLICY "evidence_select_gerencia" ON task_evidence
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- Personal de ejecución puede subir evidencias de sus tareas
CREATE POLICY "evidence_insert_assigned" ON task_evidence
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks WHERE id = task_evidence.task_id AND assigned_to = auth.uid()
  ));

-- ============================================================
-- 7. POLÍTICAS — NOTIFICATIONS
-- ============================================================

-- Usuarios solo ven sus propias notificaciones
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Usuarios pueden marcar sus notificaciones como leídas
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- 8. POLÍTICAS — ACTIVITY_LOG
-- ============================================================

-- Gerencia ve todo el historial
CREATE POLICY "activity_select_gerencia" ON activity_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'gerencia'));

-- Supervisores ven historial de sus proyectos
CREATE POLICY "activity_select_supervisor" ON activity_log
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.user_id = auth.uid()
    AND pm.role_in_project = 'supervisor'
    AND (
      (activity_log.entity_type = 'project' AND pm.project_id = activity_log.entity_id)
      OR (activity_log.entity_type = 'task' AND pm.project_id IN (
        SELECT project_id FROM tasks WHERE id = activity_log.entity_id
      ))
    )
  ));

-- ============================================================
-- 9. POLÍTICAS — SUPABASE STORAGE (Bucket "evidence")
--
-- Nota: Estas políticas también están en schema.sql junto con
-- la creación del bucket. Se documentan aquí para referencia
-- y claridad sobre el modelo de seguridad completo.
-- ============================================================

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
