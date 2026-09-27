const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireRole('admin', 'staff'));

function formatBeneficiary(b) {
  if (!b) return null;
  return {
    id: b.id, residentId: b.resident_id, beneficiaryCode: b.beneficiary_code,
    category: b.category, status: b.status, dateRegistered: b.date_registered,
    notes: b.notes, createdBy: b.created_by, createdAt: b.created_at, updatedAt: b.updated_at,
    resident: b.r_id ? {
      id: b.r_id, firstName: b.r_first_name, lastName: b.r_last_name,
      middleName: b.r_middle_name, address: b.r_address, contactNumber: b.r_contact_number,
    } : undefined,
  };
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1';
    const params = [];
    if (search) {
      where += ' AND (b.beneficiary_code LIKE ? OR r.first_name LIKE ? OR r.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category) { where += ' AND b.category = ?'; params.push(category); }
    if (status) { where += ' AND b.status = ?'; params.push(status); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM beneficiaries b LEFT JOIN residents r ON b.resident_id = r.id WHERE ${where}`).get(...params).count;
    const data = db.prepare(`
      SELECT b.*, r.id as r_id, r.first_name as r_first_name, r.last_name as r_last_name,
        r.middle_name as r_middle_name, r.address as r_address, r.contact_number as r_contact_number
      FROM beneficiaries b LEFT JOIN residents r ON b.resident_id = r.id
      WHERE ${where} ORDER BY b.id DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset).map(formatBeneficiary);

    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    console.error('[Beneficiaries] Error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const b = db.prepare(`
      SELECT b.*, r.id as r_id, r.first_name as r_first_name, r.last_name as r_last_name,
        r.middle_name as r_middle_name, r.address as r_address, r.contact_number as r_contact_number
      FROM beneficiaries b LEFT JOIN residents r ON b.resident_id = r.id WHERE b.id = ?
    `).get(req.params.id);
    if (!b) return res.status(404).json({ message: 'Beneficiary not found.' });
    res.json(formatBeneficiary(b));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/:id/history', (req, res) => {
  try {
    const db = getDb();
    const transactions = db.prepare('SELECT * FROM payout_transactions WHERE beneficiary_id = ? ORDER BY created_at DESC').all(req.params.id);
    const distributions = db.prepare('SELECT * FROM resource_distributions WHERE beneficiary_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json({ transactions, distributions });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/', (req, res) => {
  try {
    const { residentId, beneficiaryCode, category, dateRegistered, notes } = req.body;
    if (!residentId || !beneficiaryCode || !category || !dateRegistered) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO beneficiaries (resident_id, beneficiary_code, category, status, date_registered, notes, created_by) VALUES (?,?,?,?,?,?,?)'
    ).run(residentId, beneficiaryCode, category, 'active', dateRegistered, notes || null, req.user.id);
    const b = db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatBeneficiary(b));
  } catch (err) {
    if (err.message?.includes('UNIQUE')) return res.status(409).json({ message: 'Beneficiary code already exists.' });
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Beneficiary not found.' });
    const { category, status, notes, beneficiaryCode } = req.body;
    db.prepare('UPDATE beneficiaries SET category=?, status=?, notes=?, beneficiary_code=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(category || existing.category, status || existing.status, notes !== undefined ? notes : existing.notes,
        beneficiaryCode || existing.beneficiary_code, req.params.id);
    const b = db.prepare('SELECT * FROM beneficiaries WHERE id = ?').get(req.params.id);
    res.json(formatBeneficiary(b));
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM beneficiaries WHERE id = ?').run(req.params.id);
    res.json({ message: 'Beneficiary deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
