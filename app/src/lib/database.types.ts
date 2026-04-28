// ============================================================
// Database Types — Sistema de Gestión de Proyectos
// García Construcciones 503
// ============================================================

// === Enum Types ===

export type UserRole = 'gerencia' | 'supervisor' | 'ejecucion';

export type ProjectStatus = 'planificacion' | 'en_progreso' | 'pausado' | 'completado';

export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';

export type TaskPriority = 'alta' | 'media' | 'baja';

export type NotificationType =
  | 'task_assigned'
  | 'task_status_changed'
  | 'task_due_soon'
  | 'project_created'
  | 'project_status_changed';

export type EntityType = 'project' | 'task';

export type ReferenceType = 'project' | 'task';

export type ProjectRole = 'supervisor' | 'ejecucion';

// === Entity Interfaces ===

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  estimated_end_date: string;
  status: ProjectStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  /** Computed field — not stored in DB */
  progress_percentage?: number;
  /** Computed field — not stored in DB */
  task_counts?: TaskCounts;
}

export interface TaskCounts {
  pendiente: number;
  en_progreso: number;
  completada: number;
  bloqueada: number;
  total: number;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskEvidence {
  id: string;
  task_id: string;
  uploaded_by: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: 'image/jpeg' | 'image/png';
  uploaded_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id: string;
  reference_type: ReferenceType;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  performed_by: string;
  performed_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role_in_project: ProjectRole;
  assigned_at: string;
  assigned_by: string;
}

// === Supabase Database Schema Type ===

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfile, 'id'>>;
      };
      projects: {
        Row: Omit<Project, 'progress_percentage' | 'task_counts'>;
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress_percentage' | 'task_counts'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Project, 'id' | 'created_at' | 'progress_percentage' | 'task_counts'>>;
      };
      project_members: {
        Row: ProjectMember;
        Insert: Omit<ProjectMember, 'id' | 'assigned_at'> & {
          id?: string;
          assigned_at?: string;
        };
        Update: Partial<Omit<ProjectMember, 'id'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Task, 'id' | 'created_at'>>;
      };
      task_evidence: {
        Row: TaskEvidence;
        Insert: Omit<TaskEvidence, 'id' | 'uploaded_at'> & {
          id?: string;
          uploaded_at?: string;
        };
        Update: Partial<Omit<TaskEvidence, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at' | 'is_read'> & {
          id?: string;
          created_at?: string;
          is_read?: boolean;
        };
        Update: Partial<Omit<Notification, 'id'>>;
      };
      activity_log: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'performed_at'> & {
          id?: string;
          performed_at?: string;
        };
        Update: Partial<Omit<ActivityLog, 'id'>>;
      };
    };
    Functions: {
      calculate_project_progress: {
        Args: { p_project_id: string };
        Returns: number;
      };
      get_task_counts: {
        Args: { p_project_id: string };
        Returns: TaskCounts;
      };
    };
    Enums: {
      user_role: UserRole;
      project_status: ProjectStatus;
      task_status: TaskStatus;
      task_priority: TaskPriority;
      notification_type: NotificationType;
      entity_type: EntityType;
      reference_type: ReferenceType;
      project_role: ProjectRole;
    };
  };
}
