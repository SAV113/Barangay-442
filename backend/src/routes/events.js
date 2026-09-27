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
    creator: e.c_first ? { id: e.created_by, firstName: e.c_first, lastName: e.c_last } : undefined,
  };
}

// Public endpoint
router.get('/public', (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 10, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = "e.status = 'published'"; const params = [];
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

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, status, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1'; const params = [];
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
    const e = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(formatEvent(e));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Event deleted.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

module.exports = router;
