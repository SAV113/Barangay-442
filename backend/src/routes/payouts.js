const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

function formatProgram(p) {
  if (!p) return null;
  return {
    id: p.id, name: p.name, description: p.description, category: p.category,
    budget: p.budget, amountPerBeneficiary: p.amount_per_beneficiary, status: p.status,
    createdBy: p.created_by, createdAt: p.created_at, updatedAt: p.updated_at,
    schedulesCount: p.schedules_count,
  };
}

function formatSchedule(s) {
  if (!s) return null;
  return {
    id: s.id, programId: s.program_id, name: s.name, scheduleDate: s.schedule_date,
    startTime: s.start_time, endTime: s.end_time, location: s.location, notes: s.notes,
    status: s.status, isPublic: !!s.is_public, createdBy: s.created_by,
    createdAt: s.created_at, updatedAt: s.updated_at,
    transactionsCount: s.transactions_count, claimedCount: s.claimed_count, pendingCount: s.pending_count,
    program: s.p_name ? { id: s.program_id, name: s.p_name, category: s.p_category } : undefined,
  };
}

function formatTransaction(t) {
  if (!t) return null;
  return {
    id: t.id, scheduleId: t.schedule_id, beneficiaryId: t.beneficiary_id,
    amount: t.amount, status: t.status, claimedAt: t.claimed_at, notes: t.notes,
    recordedBy: t.recorded_by, createdAt: t.created_at, updatedAt: t.updated_at,
    beneficiary: t.b_code ? {
      id: t.beneficiary_id, beneficiaryCode: t.b_code, category: t.b_category,
      resident: t.r_first ? { firstName: t.r_first, lastName: t.r_last } : undefined,
    } : undefined,
  };
}

// ---- Payout Programs ----
const programsRouter = express.Router();
programsRouter.use(authenticateToken, requireRole('admin', 'staff'));

programsRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1'; const params = [];
    if (search) { where += ' AND name LIKE ?'; params.push(`%${search}%`); }
    if (status) { where += ' AND status = ?'; params.push(status); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM payout_programs WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT p.*, (SELECT COUNT(*) FROM payout_schedules WHERE program_id = p.id) as schedules_count
      FROM payout_programs p WHERE ${where} ORDER BY p.id DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatProgram);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

programsRouter.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const p = db.prepare('SELECT * FROM payout_programs WHERE id = ?').get(req.params.id);
    if (!p) return res.status(404).json({ message: 'Program not found.' });
    res.json(formatProgram(p));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

programsRouter.post('/', (req, res) => {
  try {
    const { name, description, category, budget, amountPerBeneficiary, status } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'Name and category required.' });
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO payout_programs (name, description, category, budget, amount_per_beneficiary, status, created_by) VALUES (?,?,?,?,?,?,?)'
    ).run(name, description || null, category, budget || null, amountPerBeneficiary || null, status || 'draft', req.user.id);
    const p = db.prepare('SELECT * FROM payout_programs WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatProgram(p));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

programsRouter.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM payout_programs WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Program not found.' });
    const { name, description, category, budget, amountPerBeneficiary, status } = req.body;
    db.prepare('UPDATE payout_programs SET name=?, description=?, category=?, budget=?, amount_per_beneficiary=?, status=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(name || existing.name, description !== undefined ? description : existing.description, category || existing.category,
        budget !== undefined ? budget : existing.budget, amountPerBeneficiary !== undefined ? amountPerBeneficiary : existing.amount_per_beneficiary,
        status || existing.status, req.params.id);
    const p = db.prepare('SELECT * FROM payout_programs WHERE id = ?').get(req.params.id);
    res.json(formatProgram(p));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

programsRouter.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM payout_programs WHERE id = ?').run(req.params.id);
    res.json({ message: 'Program deleted.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// ---- Payout Schedules ----
const schedulesRouter = express.Router();

schedulesRouter.get('/public', (req, res) => {
  try {
    const db = getDb();
    const data = db.prepare(`
      SELECT s.*, p.name as p_name, p.category as p_category
      FROM payout_schedules s LEFT JOIN payout_programs p ON s.program_id = p.id
      WHERE s.is_public = 1 ORDER BY s.schedule_date ASC
    `).all().map(formatSchedule);
    res.json({ data });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

schedulesRouter.use(authenticateToken, requireRole('admin', 'staff'));

schedulesRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    const { status, programId, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1'; const params = [];
    if (status) { where += ' AND s.status = ?'; params.push(status); }
    if (programId) { where += ' AND s.program_id = ?'; params.push(programId); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM payout_schedules s WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT s.*, p.name as p_name, p.category as p_category,
        (SELECT COUNT(*) FROM payout_transactions WHERE schedule_id = s.id) as transactions_count,
        (SELECT COUNT(*) FROM payout_transactions WHERE schedule_id = s.id AND status = 'claimed') as claimed_count,
        (SELECT COUNT(*) FROM payout_transactions WHERE schedule_id = s.id AND status = 'pending') as pending_count
      FROM payout_schedules s LEFT JOIN payout_programs p ON s.program_id = p.id
      WHERE ${where} ORDER BY s.schedule_date DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatSchedule);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

schedulesRouter.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const s = db.prepare(`
      SELECT s.*, p.name as p_name, p.category as p_category
      FROM payout_schedules s LEFT JOIN payout_programs p ON s.program_id = p.id WHERE s.id = ?
    `).get(req.params.id);
    if (!s) return res.status(404).json({ message: 'Schedule not found.' });
    res.json(formatSchedule(s));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

schedulesRouter.post('/', (req, res) => {
  try {
    const { programId, name, scheduleDate, startTime, endTime, location, notes, isPublic } = req.body;
    if (!programId || !name || !scheduleDate || !startTime || !endTime || !location) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO payout_schedules (program_id, name, schedule_date, start_time, end_time, location, notes, is_public, created_by) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(programId, name, scheduleDate, startTime, endTime, location, notes || null, isPublic ? 1 : 0, req.user.id);
    const s = db.prepare('SELECT * FROM payout_schedules WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatSchedule(s));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

schedulesRouter.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM payout_schedules WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Schedule not found.' });
    const { name, scheduleDate, startTime, endTime, location, notes, status, isPublic } = req.body;
    db.prepare('UPDATE payout_schedules SET name=?, schedule_date=?, start_time=?, end_time=?, location=?, notes=?, status=?, is_public=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(name || existing.name, scheduleDate || existing.schedule_date, startTime || existing.start_time,
        endTime || existing.end_time, location || existing.location, notes !== undefined ? notes : existing.notes,
        status || existing.status, isPublic !== undefined ? (isPublic ? 1 : 0) : existing.is_public, req.params.id);
    const s = db.prepare('SELECT * FROM payout_schedules WHERE id = ?').get(req.params.id);
    res.json(formatSchedule(s));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// ---- Payout Transactions ----
const transactionsRouter = express.Router();
transactionsRouter.use(authenticateToken, requireRole('admin', 'staff'));

transactionsRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    const { status, scheduleId, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1'; const params = [];
    if (status) { where += ' AND t.status = ?'; params.push(status); }
    if (scheduleId) { where += ' AND t.schedule_id = ?'; params.push(scheduleId); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM payout_transactions t WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT t.*, b.beneficiary_code as b_code, b.category as b_category,
        r.first_name as r_first, r.last_name as r_last
      FROM payout_transactions t
      LEFT JOIN beneficiaries b ON t.beneficiary_id = b.id
      LEFT JOIN residents r ON b.resident_id = r.id
      WHERE ${where} ORDER BY t.id DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatTransaction);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

transactionsRouter.get('/schedule/:scheduleId', (req, res) => {
  try {
    const db = getDb();
    const data = db.prepare(`
      SELECT t.*, b.beneficiary_code as b_code, b.category as b_category,
        r.first_name as r_first, r.last_name as r_last
      FROM payout_transactions t
      LEFT JOIN beneficiaries b ON t.beneficiary_id = b.id
      LEFT JOIN residents r ON b.resident_id = r.id
      WHERE t.schedule_id = ? ORDER BY t.id
    `).all(req.params.scheduleId).map(formatTransaction);
    res.json({ data });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

transactionsRouter.post('/', (req, res) => {
  try {
    const { scheduleId, beneficiaryId, amount } = req.body;
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO payout_transactions (schedule_id, beneficiary_id, amount, status, recorded_by) VALUES (?,?,?,?,?)'
    ).run(scheduleId, beneficiaryId, amount, 'pending', req.user.id);
    const t = db.prepare('SELECT * FROM payout_transactions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatTransaction(t));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

transactionsRouter.post('/bulk-assign', (req, res) => {
  try {
    const { scheduleId, beneficiaryIds } = req.body;
    const db = getDb();
    const schedule = db.prepare(`
      SELECT s.*, p.amount_per_beneficiary FROM payout_schedules s
      LEFT JOIN payout_programs p ON s.program_id = p.id WHERE s.id = ?
    `).get(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found.' });

    const insert = db.prepare(
      'INSERT OR IGNORE INTO payout_transactions (schedule_id, beneficiary_id, amount, status, recorded_by) VALUES (?,?,?,?,?)'
    );
    const amount = schedule.amount_per_beneficiary || 0;
    const tx = db.transaction(() => {
      for (const bId of beneficiaryIds) {
        insert.run(scheduleId, bId, amount, 'pending', req.user.id);
      }
    });
    tx();
    res.json({ message: `Assigned ${beneficiaryIds.length} beneficiaries.` });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

transactionsRouter.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    const claimedAt = status === 'claimed' ? new Date().toISOString() : null;
    db.prepare('UPDATE payout_transactions SET status=?, claimed_at=?, recorded_by=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(status, claimedAt, req.user.id, req.params.id);
    const t = db.prepare('SELECT * FROM payout_transactions WHERE id = ?').get(req.params.id);
    if (!t) return res.status(404).json({ message: 'Transaction not found.' });
    res.json(formatTransaction(t));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

module.exports = { programsRouter, schedulesRouter, transactionsRouter };
