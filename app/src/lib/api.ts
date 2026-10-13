// ── Garcia Construcciones 503 API Client ─────────────────────────────
// Reemplaza a Supabase de forma nativa, rápida y sin desconexiones

const API_BASE = '/api';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'gerencia' | 'supervisor' | 'ejecucion';
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface LeadInteraction {
  id: number;
  lead_id: number;
  type: 'llamada' | 'reunion' | 'correo' | 'visita_obra' | 'cotizacion' | 'nota' | 'contacto_web' | 'cambio_estado' | 'proyecto_creado';
  notes: string;
  user_name: string;
  date: string;
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  status: 'nuevo' | 'contactado' | 'en_negociacion' | 'cotizado' | 'ganado' | 'perdido';
  estimated_value: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  interactions_count?: number;
  interactions?: LeadInteraction[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  start_date: string;
  estimated_end_date: string;
  status: 'planificacion' | 'en_progreso' | 'pausado' | 'completado';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('garcia_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    async login(email: string, password: string) {
      const data = await request<{ token: string; user: UserProfile; profile: UserProfile }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      localStorage.setItem('garcia_auth_token', data.token);
      return data;
    },
    async getMe() {
      return request<{ user: UserProfile; profile: UserProfile }>('/auth/me');
    },
    logout() {
      localStorage.removeItem('garcia_auth_token');
    },
    getToken() {
      return localStorage.getItem('garcia_auth_token');
    },
  },

  // CRM Leads
  leads: {
    async getAll(): Promise<Lead[]> {
      return request<Lead[]>('/leads');
    },
    async getById(id: number | string): Promise<Lead> {
      return request<Lead>(`/leads/${id}`);
    },
    async update(id: number | string, data: Partial<Lead> & { notes?: string }): Promise<Lead> {
      return request<Lead>(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async addInteraction(id: number | string, data: { type: string; notes: string; date?: string }): Promise<LeadInteraction> {
      return request<LeadInteraction>(`/leads/${id}/interactions`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async convertToProject(id: number | string, data: { project_name?: string; location?: string; estimated_end_date?: string }) {
      return request<{ success: boolean; projectId: string; message: string }>(`/leads/${id}/convert-to-project`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async createPublicLead(data: { name: string; email: string; phone?: string; message: string; company?: string }) {
      return request<{ success: boolean; message: string; leadId: number }>('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Projects
  projects: {
    async getAll(): Promise<Project[]> {
      return request<Project[]>('/projects');
    },
    async getById(id: string): Promise<Project & { tasks: Task[]; members: any[] }> {
      return request<Project & { tasks: Task[]; members: any[] }>(`/projects/${id}`);
    },
    async create(data: Partial<Project>): Promise<Project> {
      return request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Partial<Project>): Promise<Project> {
      return request<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Tasks
  tasks: {
    async getAll(projectId?: string): Promise<Task[]> {
      const query = projectId ? `?project_id=${projectId}` : '';
      return request<Task[]>(`/tasks${query}`);
    },
    async create(data: Partial<Task>): Promise<Task> {
      return request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Partial<Task>): Promise<Task> {
      return request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Team
  team: {
    async getAll(): Promise<UserProfile[]> {
      return request<UserProfile[]>('/team');
    },
  },
};
