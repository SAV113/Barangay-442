const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

function formatAnnouncement(a) {
  if (!a) return null;
  return {
    id: a.id, title: a.title, category: a.category, content: a.content,
    shortDescription: a.short_description, imageUrl: a.image_url,
    authorId: a.author_id, status: a.status, publishedAt: a.published_at,
    createdAt: a.created_at, updatedAt: a.updated_at,
    author: a.a_first ? { id: a.author_id, firstName: a.a_first, lastName: a.a_last } : undefined,
  };
}

// Public endpoint
router.get('/public', (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 10, category } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = "a.status = 'published'"; const params = [];
    if (category) { where += ' AND a.category = ?'; params.push(category); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM announcements a WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT a.*, u.first_name as a_first, u.last_name as a_last
      FROM announcements a LEFT JOIN users u ON a.author_id = u.id
      WHERE ${where} ORDER BY a.published_at DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatAnnouncement);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// Protected endpoints
router.use(authenticateToken, requireRole('admin', 'staff'));

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, status, category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1'; const params = [];
    if (search) { where += ' AND (a.title LIKE ? OR a.content LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (status) { where += ' AND a.status = ?'; params.push(status); }
    if (category) { where += ' AND a.category = ?'; params.push(category); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM announcements a WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT a.*, u.first_name as a_first, u.last_name as a_last
      FROM announcements a LEFT JOIN users u ON a.author_id = u.id
      WHERE ${where} ORDER BY a.id DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatAnnouncement);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const a = db.prepare(`
      SELECT a.*, u.first_name as a_first, u.last_name as a_last
      FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?
    `).get(req.params.id);
    if (!a) return res.status(404).json({ message: 'Announcement not found.' });
    res.json(formatAnnouncement(a));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.post('/', (req, res) => {
  try {
    const { title, category, content, shortDescription, imageUrl, status } = req.body;
    if (!title || !category || !content) return res.status(400).json({ message: 'Title, category, and content required.' });
    const db = getDb();
    const publishedAt = status === 'published' ? new Date().toISOString() : null;
    const result = db.prepare(
      'INSERT INTO announcements (title, category, content, short_description, image_url, author_id, status, published_at) VALUES (?,?,?,?,?,?,?,?)'
    ).run(title, category, content, shortDescription || null, imageUrl || null, req.user.id, status || 'draft', publishedAt);
    const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatAnnouncement(a));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Announcement not found.' });
    const { title, category, content, shortDescription, imageUrl, status } = req.body;
    db.prepare('UPDATE announcements SET title=?, category=?, content=?, short_description=?, image_url=?, status=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(title || existing.title, category || existing.category, content || existing.content,
        shortDescription !== undefined ? shortDescription : existing.short_description,
        imageUrl !== undefined ? imageUrl : existing.image_url,
        status || existing.status, req.params.id);
    const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    res.json(formatAnnouncement(a));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.patch('/:id/publish', (req, res) => {
  try {
    const db = getDb();
    db.prepare("UPDATE announcements SET status = 'published', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    if (!a) return res.status(404).json({ message: 'Announcement not found.' });
    res.json(formatAnnouncement(a));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.patch('/:id/unpublish', (req, res) => {
  try {
    const db = getDb();
    db.prepare("UPDATE announcements SET status = 'draft', updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    res.json(formatAnnouncement(a));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.patch('/:id/archive', (req, res) => {
  try {
    const db = getDb();
    db.prepare("UPDATE announcements SET status = 'archived', updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    const a = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
    res.json(formatAnnouncement(a));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Announcement deleted.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

module.exports = router;
