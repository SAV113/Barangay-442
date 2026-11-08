const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

function formatEvent(e) {
  if (!e) return null;
  return {
    id: e.id, title: e.title, description: e.description, eventDate: e.event_date,
    startTime: e.start_time, endTime: e.end_time, location: e.location,
    category: e.category, imageUrl: e.image_url, status: e.status,
    maxParticipants: e.max_participants, createdBy: e.created_by,
    createdAt: e.created_at, updatedAt: e.updated_at,
    deletedAt: e.deleted_at || null,
    creator: e.c_first ? { id: e.created_by, firstName: e.c_first, lastName: e.c_last } : undefined,
  };
}

// Public endpoint – exclude soft-deleted
router.get('/public', (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 10, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = "e.status = 'published' AND e.deleted_at IS NULL"; const params = [];
    if (category) { where += ' AND e.category = ?'; params.push(category); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM events e WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT e.*, u.first_name as c_first, u.last_name as c_last
      FROM events e LEFT JOIN users u ON e.created_by = u.id
      WHERE ${where} ORDER BY e.event_date ASC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatEvent);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// Protected
router.use(authenticateToken, requireRole('admin', 'staff'));

// GET all events – exclude soft-deleted by default, unless ?includeArchived=true
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, status, category, page = 1, limit = 20, includeArchived } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = includeArchived === 'true' ? 'e.deleted_at IS NOT NULL' : 'e.deleted_at IS NULL';
    const params = [];
    if (search) { where += ' AND (e.title LIKE ? OR e.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (status) { where += ' AND e.status = ?'; params.push(status); }
    if (category) { where += ' AND e.category = ?'; params.push(category); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM events e WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT e.*, u.first_name as c_first, u.last_name as c_last
      FROM events e LEFT JOIN users u ON e.created_by = u.id
      WHERE ${where} ORDER BY e.event_date DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatEvent);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const e = db.prepare(`
      SELECT e.*, u.first_name as c_first, u.last_name as c_last
      FROM events e LEFT JOIN users u ON e.created_by = u.id WHERE e.id = ?
    `).get(req.params.id);
    if (!e) return res.status(404).json({ message: 'Event not found.' });
    res.json(formatEvent(e));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.post('/', (req, res) => {
  try {
    const { title, description, eventDate, startTime, endTime, location, category, imageUrl, status, maxParticipants } = req.body;
    if (!title || !eventDate || !startTime || !location || !category) return res.status(400).json({ message: 'Required fields missing.' });
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO events (title, description, event_date, start_time, end_time, location, category, image_url, status, max_participants, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
    ).run(title, description || null, eventDate, startTime, endTime || null, location, category, imageUrl || null, status || 'draft', maxParticipants || null, req.user.id);

    // Audit log
    db.prepare('INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details) VALUES (?,?,?,?,?,?)')
      .run(req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email, 'CREATE', 'events', result.lastInsertRowid, `Created event: ${title}`);

    const e = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatEvent(e));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Event not found.' });
    const { title, description, eventDate, startTime, endTime, location, category, imageUrl, status, maxParticipants } = req.body;
    db.prepare('UPDATE events SET title=?, description=?, event_date=?, start_time=?, end_time=?, location=?, category=?, image_url=?, status=?, max_participants=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(title || existing.title, description !== undefined ? description : existing.description,
        eventDate || existing.event_date, startTime || existing.start_time, endTime !== undefined ? endTime : existing.end_time,
        location || existing.location, category || existing.category, imageUrl !== undefined ? imageUrl : existing.image_url,
        status || existing.status, maxParticipants !== undefined ? maxParticipants : existing.max_participants, req.params.id);

    // Audit log
    db.prepare('INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details) VALUES (?,?,?,?,?,?)')
      .run(req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email, 'UPDATE', 'events', req.params.id, `Updated event: ${title || existing.title}`);

    const e = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(formatEvent(e));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// Soft delete (archive) – admin only
router.patch('/:id/archive', requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Event not found.' });
    if (existing.deleted_at) return res.status(400).json({ message: 'Event is already archived.' });

    db.prepare("UPDATE events SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(req.params.id);

    // Audit log
    db.prepare('INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details) VALUES (?,?,?,?,?,?)')
      .run(req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email, 'ARCHIVE', 'events', req.params.id, `Archived event: ${existing.title}`);

    const e = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(formatEvent(e));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// Restore from archive – admin only
router.patch('/:id/restore', requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Event not found.' });
    if (!existing.deleted_at) return res.status(400).json({ message: 'Event is not archived.' });

    db.prepare("UPDATE events SET deleted_at = NULL, updated_at = datetime('now') WHERE id = ?").run(req.params.id);

    // Audit log
    db.prepare('INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details) VALUES (?,?,?,?,?,?)')
      .run(req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email, 'RESTORE', 'events', req.params.id, `Restored event: ${existing.title}`);

    const e = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(formatEvent(e));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// Hard delete – keep for admin use
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);

    if (existing) {
      db.prepare('INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details) VALUES (?,?,?,?,?,?)')
        .run(req.user.id, `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email, 'DELETE', 'events', req.params.id, `Permanently deleted event: ${existing.title}`);
    }

    res.json({ message: 'Event deleted.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

module.exports = router;
