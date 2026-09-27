const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All user routes require admin role
router.use(authenticateToken, requireRole('admin'));

function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    status: row.status,
    profilePhoto: row.profile_photo,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = '1=1';
    const params = [];

    if (search) {
      where += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role) { where += ' AND role = ?'; params.push(role); }
    if (status) { where += ' AND status = ?'; params.push(status); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM users WHERE ${where}`).get(...params).count;
    const users = db.prepare(`SELECT * FROM users WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, parseInt(limit), offset)
      .map(formatUser);

    res.json({
      data: users,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    console.error('[Users] GetAll error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/', (req, res) => {
  try {
    const { email, password, firstName, lastName, role, status } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields required.' });
    }
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ message: 'Email already exists.' });

    const hash = bcrypt.hashSync(password, 12);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(email, hash, firstName, lastName, role, status || 'active');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const { firstName, lastName, email, role, status } = req.body;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    db.prepare(
      'UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).run(
      firstName || user.first_name,
      lastName || user.last_name,
      email || user.email,
      role || user.role,
      status || user.status,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    res.json(formatUser(updated));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const db = getDb();
    db.prepare('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, req.params.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts.' });
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
