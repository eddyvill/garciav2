import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'garcia.db');
export const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Users / Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ejecucion',
      phone TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Projects
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      estimated_end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planificacion',
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    );
  `);

  // 3. Project Members
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_members (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role_in_project TEXT NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      assigned_by TEXT NOT NULL,
      UNIQUE(project_id, user_id),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Tasks
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      due_date TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'media',
      status TEXT NOT NULL DEFAULT 'pendiente',
      assigned_to TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY(assigned_to) REFERENCES users(id),
      FOREIGN KEY(created_by) REFERENCES users(id)
    );
  `);

  // 5. CRM Leads
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      message TEXT NOT NULL,
      source TEXT DEFAULT 'Web Form',
      status TEXT DEFAULT 'nuevo',
      estimated_value REAL DEFAULT 0,
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. CRM Interactions / Follow-up history
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      notes TEXT NOT NULL,
      user_name TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );
  `);

  // 7. Activity Log
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      performed_by TEXT NOT NULL,
      performed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reference_id TEXT,
      reference_type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  console.log('[Database] Seeding initial users, projects, and CRM data...');

  const passwordHash = bcrypt.hashSync('admin123', 10);

  // Initial users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('u1', 'admin@garciaconstrucciones503.com', passwordHash, 'Ing. Carlos García', 'gerencia', '+58 414 802 0966');
  insertUser.run('u2', 'supervisor@garciaconstrucciones503.com', passwordHash, 'Ing. Miguel Rodríguez', 'supervisor', '+58 412 123 4567');
  insertUser.run('u3', 'ejecucion@garciaconstrucciones503.com', passwordHash, 'Téc. Pedro Martínez', 'ejecucion', '+58 424 765 4321');

  // Initial projects
  const insertProject = db.prepare(`
    INSERT INTO projects (id, name, description, location, start_date, estimated_end_date, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertProject.run(
    'p1',
    'Adecuación Subestación Manzanares 115kV',
    'Mantenimiento mayor y adecuación de transformadores de potencia y patio de distribución.',
    'Cumaná, Estado Sucre',
    '2026-01-15',
    '2026-08-30',
    'en_progreso',
    'u1'
  );

  insertProject.run(
    'p2',
    'Remodelación y Ampliación Sala 1x10 CORPOELEC',
    'Obras civiles, climatización y adecuación tecnológica de sala de monitoreo.',
    'Carúpano, Estado Sucre',
    '2026-02-01',
    '2026-05-15',
    'en_progreso',
    'u1'
  );

  insertProject.run(
    'p3',
    'Taller y Comedor Industrial Planta Apure',
    'Construcción de estructura metálica, comedor para 120 trabajadores y cerca perimetral.',
    'San Fernando, Estado Apure',
    '2026-03-10',
    '2026-11-20',
    'planificacion',
    'u1'
  );

  // Initial Tasks
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, due_date, priority, status, assigned_to, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTask.run('t1', 'p1', 'Inspección de Transformador T-01', 'Verificación de niveles de aceite dieléctrico y pruebas de aislamiento.', '2026-04-20', 'alta', 'completada', 'u2', 'u1');
  insertTask.run('t2', 'p1', 'Instalación de Sistema Puesta a Tierra', 'Tendido de malla y varillas copperweld en patio 115kV.', '2026-05-10', 'alta', 'en_progreso', 'u3', 'u1');
  insertTask.run('t3', 'p2', 'Vaciado de Losa de Concreto', 'Preparación de encofrado y vaciado de concreto 250 kg/cm2.', '2026-04-25', 'media', 'pendiente', 'u3', 'u2');

  // Initial CRM Leads
  const insertLead = db.prepare(`
    INSERT INTO leads (name, email, phone, company, message, source, status, estimated_value, assigned_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const l1 = insertLead.run(
    'Ing. Rafael Morales',
    'rmorales@corpoelec.gob.ve',
    '+58 414 789 1234',
    'CORPOELEC Región Oriente',
    'Solicitamos cotización para obras civiles y drenajes en Subestación El Vigía.',
    'Web Form',
    'en_negociacion',
    45000,
    'Ing. Carlos García'
  );

  const l2 = insertLead.run(
    'Dra. Carmen Fernández',
    'cfernandez@clinicavzla.com',
    '+58 424 555 9876',
    'Clínica San Juan',
    'Requerimos adecuación de áreas de hospitalización y sistema eléctrico de emergencia.',
    'Web Form',
    'contactado',
    28000,
    'Ing. Miguel Rodríguez'
  );

  const l3 = insertLead.run(
    'Lic. Alejandro Castillo',
    'acastillo@inversionesoriente.com',
    '+58 412 333 4455',
    'Inversiones Oriente C.A.',
    'Presupuesto para cerca perimetral y galpón industrial en Guanta.',
    'Web Form',
    'nuevo',
    15000,
    'Ing. Carlos García'
  );

  // Initial CRM Interactions
  const insertInteraction = db.prepare(`
    INSERT INTO lead_interactions (lead_id, type, notes, user_name, date)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertInteraction.run(
    l1.lastInsertRowid,
    'llamada',
    'Conversación telefónica con el Ing. Morales. Se acordó visita técnica a la subestación para el próximo martes.',
    'Ing. Carlos García',
    '2026-04-10 10:30:00'
  );

  insertInteraction.run(
    l1.lastInsertRowid,
    'visita_obra',
    'Visita técnica realizada en sitio. Se tomaron mediciones de topografía y replanteo.',
    'Ing. Miguel Rodríguez',
    '2026-04-12 14:00:00'
  );

  insertInteraction.run(
    l2.lastInsertRowid,
    'correo',
    'Se envió brochure institucional y credenciales técnicas de obras hospitalarias.',
    'Ing. Carlos García',
    '2026-04-11 16:45:00'
  );

  console.log('[Database] Seed completed successfully!');
}
