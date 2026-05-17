/**
 * PortGate — Backend API
 * Express + SQLite + JWT
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const ExcelJS = require('exceljs');

const app = express();
// CAMBIO: Render asigna el puerto dinámicamente en producción
const PORT = process.env.PORT || 3001; 
const JWT_SECRET = 'portgate_secret_2024_secure';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// CAMBIO: Servir los archivos estáticos de la carpeta 'dist' generada por Vite
app.use(express.static(path.join(__dirname, '../dist')));

// ─── Database Setup ───────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'portgate.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS facturacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,
    factura TEXT NOT NULL,
    booking TEXT NOT NULL,
    contenedor TEXT NOT NULL,
    naviera TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    importe REAL NOT NULL,
    estado_pago TEXT NOT NULL DEFAULT 'pendiente',
    observacion TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS gaters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contenedor TEXT NOT NULL,
    naviera TEXT NOT NULL,
    booking TEXT NOT NULL,
    autorizacion_linea TEXT NOT NULL DEFAULT 'pendiente',
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// ─── Seed Users ───────────────────────────────────────────────────────────────
const seedUsers = () => {
  const users = [
    { username: 'facturacion', password: '1234', role: 'facturacion' },
    { username: 'gaters',      password: '1234', role: 'gaters' },
    { username: 'pregate',     password: '1234', role: 'pregate' },
  ];

  const insert = db.prepare('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)');
  users.forEach(u => {
    const hash = bcrypt.hashSync(u.password, 10);
    insert.run(u.username, hash, u.role);
  });
};
seedUsers();

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Sin permisos para esta acción' });
  }
  next();
};

// ─── AUTH Routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Credenciales requeridas' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ─── FACTURACION Routes ───────────────────────────────────────────────────────
app.get('/api/facturacion', authenticate, (req, res) => {
  const { search, estado } = req.query;
  let query = 'SELECT * FROM facturacion WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (cliente LIKE ? OR factura LIKE ? OR booking LIKE ? OR contenedor LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (estado && estado !== 'todos') {
    query += ' AND estado_pago = ?';
    params.push(estado);
  }

  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.post('/api/facturacion', authenticate, authorize('facturacion'), (req, res) => {
  const { cliente, factura, booking, contenedor, naviera, cantidad, importe, estado_pago, observacion } = req.body;

  if (!cliente || !factura || !booking || !contenedor || !naviera || !cantidad || !importe) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const result = db.prepare(`
    INSERT INTO facturacion (cliente, factura, booking, contenedor, naviera, cantidad, importe, estado_pago, observacion, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(cliente, factura, booking, contenedor, naviera, cantidad, importe, estado_pago || 'pendiente', observacion || '', req.user.username);

  const row = db.prepare('SELECT * FROM facturacion WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/facturacion/:id', authenticate, authorize('facturacion'), (req, res) => {
  const { cliente, factura, booking, contenedor, naviera, cantidad, importe, estado_pago, observacion } = req.body;

  db.prepare(`
    UPDATE facturacion SET cliente=?, factura=?, booking=?, contenedor=?, naviera=?, cantidad=?, importe=?, estado_pago=?, observacion=?, updated_at=datetime('now')
    WHERE id=?
  `).run(cliente, factura, booking, contenedor, naviera, cantidad, importe, estado_pago, observacion, req.params.id);

  const row = db.prepare('SELECT * FROM facturacion WHERE id = ?').get(req.params.id);
  res.json(row);
});

app.delete('/api/facturacion/:id', authenticate, authorize('facturacion'), (req, res) => {
  db.prepare('DELETE FROM facturacion WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── GATERS Routes ────────────────────────────────────────────────────────────
app.get('/api/gaters', authenticate, (req, res) => {
  const { search, autorizacion } = req.query;
  let query = 'SELECT * FROM gaters WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (contenedor LIKE ? OR booking LIKE ? OR naviera LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (autorizacion && autorizacion !== 'todos') {
    query += ' AND autorizacion_linea = ?';
    params.push(autorizacion);
  }

  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

app.post('/api/gaters', authenticate, authorize('gaters'), (req, res) => {
  const { contenedor, naviera, booking, autorizacion_linea } = req.body;

  if (!contenedor || !naviera || !booking) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const result = db.prepare(`
    INSERT INTO gaters (contenedor, naviera, booking, autorizacion_linea, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(contenedor, naviera, booking, autorizacion_linea || 'pendiente', req.user.username);

  const row = db.prepare('SELECT * FROM gaters WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/gaters/:id', authenticate, authorize('gaters'), (req, res) => {
  const { contenedor, naviera, booking, autorizacion_linea } = req.body;

  db.prepare(`
    UPDATE gaters SET contenedor=?, naviera=?, booking=?, autorizacion_linea=?, updated_at=datetime('now')
    WHERE id=?
  `).run(contenedor, naviera, booking, autorizacion_linea, req.params.id);

  const row = db.prepare('SELECT * FROM gaters WHERE id = ?').get(req.params.id);
  res.json(row);
});

app.delete('/api/gaters/:id', authenticate, authorize('gaters'), (req, res) => {
  db.prepare('DELETE FROM gaters WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── PREGATE Route (cross join) ───────────────────────────────────────────────
app.get('/api/pregate', authenticate, (req, res) => {
  const { search } = req.query;

  let factQuery = 'SELECT * FROM facturacion';
  let gateQuery = 'SELECT * FROM gaters';

  const facturaciones = db.prepare(factQuery).all();
  const gaters = db.prepare(gateQuery).all();

  const pregateMap = new Map();

  facturaciones.forEach(f => {
    const key = f.booking || f.contenedor;
    pregateMap.set(key, {
      key,
      contenedor: f.contenedor,
      booking: f.booking,
      cliente: f.cliente,
      naviera: f.naviera,
      ok_pago: f.estado_pago === 'pago',
      estado_pago: f.estado_pago,
      ok_autorizacion: false,
      autorizacion_linea: null,
      factura: f.factura,
      importe: f.importe,
    });
  });

  gaters.forEach(g => {
    const key = g.booking || g.contenedor;
    if (pregateMap.has(key)) {
      const entry = pregateMap.get(key);
      entry.ok_autorizacion = g.autorizacion_linea === 'autorizado';
      entry.autorizacion_linea = g.autorizacion_linea;
    } else {
      pregateMap.set(key, {
        key,
        contenedor: g.contenedor,
        booking: g.booking,
        cliente: null,
        naviera: g.naviera,
        ok_pago: false,
        estado_pago: null,
        ok_autorizacion: g.autorizacion_linea === 'autorizado',
        autorizacion_linea: g.autorizacion_linea,
        factura: null,
        importe: null,
      });
    }
  });

  let results = Array.from(pregateMap.values());

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(r =>
      r.contenedor?.toLowerCase().includes(s) ||
      r.booking?.toLowerCase().includes(s) ||
      r.cliente?.toLowerCase().includes(s)
    );
  }

  res.json(results);
});

// ─── EXCEL Export Routes ──────────────────────────────────────────────────────
app.get('/api/export/facturacion', authenticate, async (req, res) => {
  const rows = db.prepare('SELECT * FROM facturacion ORDER BY created_at DESC').all();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'PortGate System';
  wb.created = new Date();

  const ws = wb.addWorksheet('Facturación', {
    views: [{ state: 'frozen', ySplit: 1 }],
    pageSetup: { fitToPage: true, orientation: 'landscape' }
  });

  ws.columns = [
    { header: 'ID',          key: 'id',          width: 6  },
    { header: 'Cliente',     key: 'cliente',      width: 22 },
    { header: 'Factura',     key: 'factura',      width: 16 },
    { header: 'Booking',     key: 'booking',      width: 18 },
    { header: 'Contenedor',  key: 'contenedor',   width: 18 },
    { header: 'Naviera',     key: 'naviera',      width: 18 },
    { header: 'Cantidad',    key: 'cantidad',     width: 10 },
    { header: 'Importe',     key: 'importe',      width: 14, style: { numFmt: '"$"#,##0.00' } },
    { header: 'Estado Pago', key: 'estado_pago',  width: 14 },
    { header: 'Observación', key: 'observacion',  width: 28 },
    { header: 'Creado por',  key: 'created_by',   width: 16 },
    { header: 'Fecha',       key: 'created_at',   width: 20 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E4D8C' } };
    cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF00C2E0' } } };
  });
  headerRow.height = 28;

  rows.forEach((row, idx) => {
    const dataRow = ws.addRow(row);
    const bg = idx % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    dataRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.alignment = { vertical: 'middle' };
    });

    const estadoCell = dataRow.getCell('estado_pago');
    if (row.estado_pago === 'pago') {
      estadoCell.font = { bold: true, color: { argb: 'FF10B981' } };
    } else if (row.estado_pago === 'no_pago') {
      estadoCell.font = { bold: true, color: { argb: 'FFEF4444' } };
    } else {
      estadoCell.font = { bold: true, color: { argb: 'FFF59E0B' } };
    }
  });

  ws.autoFilter = { from: 'A1', to: 'L1' };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=facturacion_${Date.now()}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

app.get('/api/export/gaters', authenticate, async (req, res) => {
  const rows = db.prepare('SELECT * FROM gaters ORDER BY created_at DESC').all();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'PortGate System';

  const ws = wb.addWorksheet('Gaters', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: 'ID',               key: 'id',                width: 6  },
    { header: 'Contenedor',       key: 'contenedor',        width: 20 },
    { header: 'Naviera',          key: 'naviera',           width: 20 },
    { header: 'Booking',          key: 'booking',           width: 20 },
    { header: 'Autorización',     key: 'autorizacion_linea',width: 18 },
    { header: 'Creado por',       key: 'created_by',        width: 16 },
    { header: 'Fecha',            key: 'created_at',        width: 20 },
  ];

  const headerRow = ws.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B2D45' } };
    cell.font   = { bold: true, color: { argb: 'FF00C2E0' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  headerRow.height = 28;

  rows.forEach((row, idx) => {
    const dataRow = ws.addRow(row);
    const bg = idx % 2 === 0 ? 'FFF0F4FA' : 'FFFFFFFF';
    dataRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.alignment = { vertical: 'middle' };
    });

    const authCell = dataRow.getCell('autorizacion_linea');
    if (row.autorizacion_linea === 'autorizado') {
      authCell.font = { bold: true, color: { argb: 'FF10B981' } };
    } else if (row.autorizacion_linea === 'rechazado') {
      authCell.font = { bold: true, color: { argb: 'FFEF4444' } };
    } else {
      authCell.font = { bold: true, color: { argb: 'FFF59E0B' } };
    }
  });

  ws.autoFilter = { from: 'A1', to: 'G1' };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=gaters_${Date.now()}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

// CAMBIO CRUCIAL: Capturar cualquier otra ruta y responder con el Frontend (Vite)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚢 PortGate API corriendo en el puerto ${PORT}`);
});