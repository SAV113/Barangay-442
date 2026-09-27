const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ---- Resources ----
const resourcesRouter = express.Router();
resourcesRouter.use(authenticateToken, requireRole('admin', 'staff'));

function formatResource(r) {
  if (!r) return null;
  return {
    id: r.id, name: r.name, category: r.category, quantity: r.quantity, unit: r.unit,
    lowStockThreshold: r.low_stock_threshold, dateAdded: r.date_added,
    expirationDate: r.expiration_date, description: r.description, status: r.status,
    createdBy: r.created_by, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

resourcesRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1'; const params = [];
    if (search) { where += ' AND name LIKE ?'; params.push(`%${search}%`); }
    if (category) { where += ' AND category = ?'; params.push(category); }
    if (status) { where += ' AND status = ?'; params.push(status); }
    const total = db.prepare(`SELECT COUNT(*) as count FROM resources WHERE ${where}`).get(...params).count;
    const data = db.prepare(`SELECT * FROM resources WHERE ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...params, parseInt(limit), offset).map(formatResource);
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

resourcesRouter.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const r = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!r) return res.status(404).json({ message: 'Resource not found.' });
    res.json(formatResource(r));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

resourcesRouter.post('/', (req, res) => {
  try {
    const { name, category, quantity, unit, lowStockThreshold, dateAdded, expirationDate, description, status } = req.body;
    if (!name || !category) return res.status(400).json({ message: 'Name and category required.' });
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO resources (name, category, quantity, unit, low_stock_threshold, date_added, expiration_date, description, status, created_by) VALUES (?,?,?,?,?,?,?,?,?,?)'
    ).run(name, category, quantity || 0, unit || 'pcs', lowStockThreshold || 10, dateAdded || new Date().toISOString().split('T')[0],
      expirationDate || null, description || null, status || 'available', req.user.id);
    const r = db.prepare('SELECT * FROM resources WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(formatResource(r));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

resourcesRouter.patch('/:id', (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Resource not found.' });
    const { name, category, quantity, unit, lowStockThreshold, expirationDate, description, status } = req.body;
    db.prepare('UPDATE resources SET name=?, category=?, quantity=?, unit=?, low_stock_threshold=?, expiration_date=?, description=?, status=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(name || existing.name, category || existing.category, quantity !== undefined ? quantity : existing.quantity,
        unit || existing.unit, lowStockThreshold !== undefined ? lowStockThreshold : existing.low_stock_threshold,
        expirationDate !== undefined ? expirationDate : existing.expiration_date, description !== undefined ? description : existing.description,
        status || existing.status, req.params.id);
    const r = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    res.json(formatResource(r));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

resourcesRouter.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id);
    res.json({ message: 'Resource deleted.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// ---- Distributions ----
const distributionsRouter = express.Router();
distributionsRouter.use(authenticateToken, requireRole('admin', 'staff'));

distributionsRouter.get('/', (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const total = db.prepare('SELECT COUNT(*) as count FROM resource_distributions').get().count;
    const data = db.prepare(`
      SELECT d.*, r.name as resource_name, r.unit as resource_unit,
        b.beneficiary_code, res.first_name as recipient_first, res.last_name as recipient_last
      FROM resource_distributions d
      LEFT JOIN resources r ON d.resource_id = r.id
      LEFT JOIN beneficiaries b ON d.beneficiary_id = b.id
      LEFT JOIN residents res ON b.resident_id = res.id
      ORDER BY d.distribution_date DESC LIMIT ? OFFSET ?
    `).all(parseInt(limit), offset).map(d => ({
      id: d.id, resourceId: d.resource_id, beneficiaryId: d.beneficiary_id,
      recipientName: d.recipient_name || (d.recipient_first ? `${d.recipient_first} ${d.recipient_last}` : null),
      quantity: d.quantity, distributionDate: d.distribution_date, purpose: d.purpose,
      notes: d.notes, distributedBy: d.distributed_by, createdAt: d.created_at,
      resource: { name: d.resource_name, unit: d.resource_unit },
    }));
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

distributionsRouter.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const d = db.prepare('SELECT * FROM resource_distributions WHERE id = ?').get(req.params.id);
    if (!d) return res.status(404).json({ message: 'Distribution not found.' });
    res.json(d);
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

distributionsRouter.post('/', (req, res) => {
  try {
    const { resourceId, beneficiaryId, recipientName, quantity, distributionDate, purpose, notes } = req.body;
    if (!resourceId || !quantity || !distributionDate) return res.status(400).json({ message: 'Required fields missing.' });
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO resource_distributions (resource_id, beneficiary_id, recipient_name, quantity, distribution_date, purpose, notes, distributed_by) VALUES (?,?,?,?,?,?,?,?)'
    ).run(resourceId, beneficiaryId || null, recipientName || null, quantity, distributionDate, purpose || null, notes || null, req.user.id);
    // Update resource quantity
    db.prepare('UPDATE resources SET quantity = quantity - ?, updated_at = datetime(\'now\') WHERE id = ?').run(quantity, resourceId);
    const d = db.prepare('SELECT * FROM resource_distributions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(d);
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

module.exports = { resourcesRouter, distributionsRouter };
