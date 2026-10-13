import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, initDatabase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'garcia_construcciones_503_secret_key_2026';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Initialize database
initDatabase();

// ── Auth Middleware ──────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
}

// ── Health Check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Garcia Construcciones API', timestamp: new Date() });
});

// ── Auth Endpoints ───────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '30d' });

  // Remove password_hash from response
  const { password_hash, ...profile } = user;

  res.json({
    token,
    user: profile,
    profile,
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, full_name, role, phone, avatar_url, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.json({ user, profile: user });
});

// ── CRM Leads Endpoints ──────────────────────────────────────────────
// 1. PUBLIC: Crear lead desde el formulario web
app.post('/api/leads', (req, res) => {
  try {
    const { name, email, phone, company, message, from_name, from_email } = req.body;

    const leadName = name || from_name;
    const leadEmail = email || from_email;

    if (!leadName || !leadEmail) {
      return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
    }

    const stmt = db.prepare(`
      INSERT INTO leads (name, email, phone, company, message, source, status)
      VALUES (?, ?, ?, ?, ?, 'Web Form', 'nuevo')
    `);

    const result = stmt.run(
      leadName,
      leadEmail,
      phone || '',
      company || '',
      message || 'Contacto web general'
    );

    // Initial interaction log
    db.prepare(`
      INSERT INTO lead_interactions (lead_id, type, notes, user_name)
      VALUES (?, 'contacto_web', 'Mensaje recibido a través del formulario de la página web.', 'Sistema Web')
    `).run(result.lastInsertRowid);

    // Activity log
    db.prepare(`
      INSERT INTO activity_log (entity_type, entity_id, action, performed_by)
      VALUES ('lead', ?, 'Nuevo contacto recibido desde la web', 'Sistema Web')
    `).run(result.lastInsertRowid.toString());

    res.status(201).json({
      success: true,
      message: '¡Mensaje recibido correctamente! Nos pondremos en contacto a la brevedad.',
      leadId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error('Error creating lead:', err);
    res.status(500).json({ error: 'Error al registrar el contacto' });
  }
});

// 2. PROTECTED: Listar todos los leads
app.get('/api/leads', authenticateToken, (req, res) => {
  const leads = db.prepare(`
    SELECT l.*, 
      (SELECT COUNT(*) FROM lead_interactions li WHERE li.lead_id = l.id) as interactions_count
    FROM leads l
    ORDER BY l.created_at DESC
  `).all();

  res.json(leads);
});

// 3. PROTECTED: Obtener detalle de lead con historial
app.get('/api/leads/:id', authenticateToken, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

  const interactions = db.prepare(`
    SELECT * FROM lead_interactions 
    WHERE lead_id = ? 
    ORDER BY created_at DESC
  `).all(req.params.id);

  res.json({ ...lead, interactions });
});

// 4. PROTECTED: Actualizar lead (estado, monto, asignado)
app.put('/api/leads/:id', authenticateToken, (req, res) => {
  const { status, estimated_value, assigned_to, notes, company, phone } = req.body;
  const leadId = req.params.id;

  const current = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
  if (!current) return res.status(404).json({ error: 'Lead no encontrado' });

  const stmt = db.prepare(`
    UPDATE leads 
    SET status = COALESCE(?, status),
        estimated_value = COALESCE(?, estimated_value),
        assigned_to = COALESCE(?, assigned_to),
        company = COALESCE(?, company),
        phone = COALESCE(?, phone),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, estimated_value, assigned_to, company, phone, leadId);

  // If status changed, log interaction
  if (status && status !== current.status) {
    db.prepare(`
      INSERT INTO lead_interactions (lead_id, type, notes, user_name)
      VALUES (?, 'cambio_estado', ?, ?)
    `).run(
      leadId,
      `Estado actualizado de "${current.status}" a "${status}". ${notes || ''}`.trim(),
      req.user.full_name
    );
  }

  const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
  res.json(updated);
});

// 5. PROTECTED: Agregar interacción al historial del lead
app.post('/api/leads/:id/interactions', authenticateToken, (req, res) => {
  const { type, notes, date } = req.body;
  const leadId = req.params.id;

  if (!notes) {
    return res.status(400).json({ error: 'Las notas de seguimiento son requeridas' });
  }

  const stmt = db.prepare(`
    INSERT INTO lead_interactions (lead_id, type, notes, user_name, date)
    VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
  `);

  const result = stmt.run(leadId, type || 'nota', notes, req.user.full_name, date);

  // Touch lead updated_at
  db.prepare('UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(leadId);

  const interaction = db.prepare('SELECT * FROM lead_interactions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(interaction);
});

// 6. PROTECTED: Convertir Lead a Proyecto
app.post('/api/leads/:id/convert-to-project', authenticateToken, (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

  const { project_name, location, estimated_end_date } = req.body;

  const projectId = 'p_' + Date.now();
  const name = project_name || `Obra: ${lead.company || lead.name}`;
  const loc = location || 'Venezuela';
  const endDate = estimated_end_date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
  const startDate = new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO projects (id, name, description, location, start_date, estimated_end_date, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, 'en_progreso', ?)
  `).run(projectId, name, lead.message, loc, startDate, endDate, req.user.id);

  // Update lead status to ganado
  db.prepare(`
    UPDATE leads SET status = 'ganado', updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).run(lead.id);

  db.prepare(`
    INSERT INTO lead_interactions (lead_id, type, notes, user_name)
    VALUES (?, 'proyecto_creado', ?, ?)
  `).run(lead.id, `¡Proyecto generado exitosamente! Código: ${projectId}`, req.user.full_name);

  res.json({
    success: true,
    projectId,
    message: 'Proyecto creado exitosamente a partir del lead',
  });
});

// ── Projects Endpoints ───────────────────────────────────────────────
app.get('/api/projects', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  res.json(projects);
});

app.get('/api/projects/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

  const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ?').all(req.params.id);
  const members = db.prepare(`
    SELECT pm.*, u.full_name, u.email, u.role
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ?
  `).all(req.params.id);

  res.json({ ...project, tasks, members });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { name, description, location, start_date, estimated_end_date, status } = req.body;
  const id = 'p_' + Date.now();

  const stmt = db.prepare(`
    INSERT INTO projects (id, name, description, location, start_date, estimated_end_date, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    name,
    description || '',
    location || '',
    start_date || new Date().toISOString().split('T')[0],
    estimated_end_date || new Date().toISOString().split('T')[0],
    status || 'planificacion',
    req.user.id
  );

  const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.status(201).json(created);
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const { name, description, location, start_date, estimated_end_date, status } = req.body;
  const id = req.params.id;

  db.prepare(`
    UPDATE projects
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        start_date = COALESCE(?, start_date),
        estimated_end_date = COALESCE(?, estimated_end_date),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, description, location, start_date, estimated_end_date, status, id);

  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json(updated);
});

// ── Tasks Endpoints ──────────────────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  const { project_id } = req.query;
  let query = 'SELECT * FROM tasks';
  const params = [];

  if (project_id) {
    query += ' WHERE project_id = ?';
    params.push(project_id);
  }

  query += ' ORDER BY due_date ASC';
  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  const { project_id, title, description, due_date, priority, status, assigned_to } = req.body;
  const id = 't_' + Date.now();

  db.prepare(`
    INSERT INTO tasks (id, project_id, title, description, due_date, priority, status, assigned_to, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    project_id,
    title,
    description || '',
    due_date || new Date().toISOString().split('T')[0],
    priority || 'media',
    status || 'pendiente',
    assigned_to || req.user.id,
    req.user.id
  );

  const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.status(201).json(created);
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { title, description, due_date, priority, status, assigned_to } = req.body;
  const id = req.params.id;

  db.prepare(`
    UPDATE tasks
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        due_date = COALESCE(?, due_date),
        priority = COALESCE(?, priority),
        status = COALESCE(?, status),
        assigned_to = COALESCE(?, assigned_to),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, description, due_date, priority, status, assigned_to, id);

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(updated);
});

// ── Team Endpoints ───────────────────────────────────────────────────
app.get('/api/team', (req, res) => {
  const users = db.prepare('SELECT id, email, full_name, role, phone, avatar_url FROM users').all();
  res.json(users);
});

// ── Start Server ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Garcia API] Backend server running on http://localhost:${PORT}`);
  console.log(`[Garcia API] CRM endpoints ready at http://localhost:${PORT}/api/leads`);
});
