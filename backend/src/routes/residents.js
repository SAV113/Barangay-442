const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireRole('admin', 'staff'));

function formatResident(r) {
  if (!r) return null;
  return {
    id: r.id, userId: r.user_id, firstName: r.first_name, lastName: r.last_name,
    middleName: r.middle_name, address: r.address, contactNumber: r.contact_number,
    birthdate: r.birthdate, gender: r.gender, civilStatus: r.civil_status,
    createdAt: r.created_at, updatedAt: r.updated_at,
    fullName: `${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}`,
  };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1';
    const params = [];
    if (search) {
      where += ' AND (first_name LIKE ? OR last_name LIKE ? OR address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const total = db.prepare(`SELECT COUNT(*) as count FROM residents WHERE ${where}`).get(...params).count;
    const data = db.prepare(`SELECT * FROM residents WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, parseInt(limit), offset).map(formatResident);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const r = db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id);
    if (!r) return res.status(404).json({ message: 'Resident not found.' });
    res.json(formatResident(r));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/', (req, res) => {
  try {
    const { firstName, lastName, middleName, address, contactNumber, birthdate, gender, civilStatus, userId } = req.body;
    if (!firstName || !lastName || !address) return res.status(400).json({ message: 'First name, last name, and address are required.' });
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO residents (user_id, first_name, last_name, middle_name, address, contact_number, birthdate, gender, civil_status) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(userId || null, firstName, lastName, middleName || null, address, contactNumber || null, birthdate || null, gender || null, civilStatus || null);
    const r = db.prepare('SELECT * FROM residents WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatResident(r));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Resident not found.' });
    const { firstName, lastName, middleName, address, contactNumber, birthdate, gender, civilStatus } = req.body;
    db.prepare(
      'UPDATE residents SET first_name=?, last_name=?, middle_name=?, address=?, contact_number=?, birthdate=?, gender=?, civil_status=?, updated_at=datetime(\'now\') WHERE id=?'
    ).run(firstName || existing.first_name, lastName || existing.last_name, middleName !== undefined ? middleName : existing.middle_name,
      address || existing.address, contactNumber !== undefined ? contactNumber : existing.contact_number,
      birthdate || existing.birthdate, gender || existing.gender, civilStatus || existing.civil_status, req.params.id);
    const r = db.prepare('SELECT * FROM residents WHERE id = ?').get(req.params.id);
    res.json(formatResident(r));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
