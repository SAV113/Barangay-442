const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireRole('admin', 'staff'));

router.get('/beneficiaries', (req, res) => {
  try {
    const db = getDb();
    const { category, status, dateFrom, dateTo } = req.query;
    let where = '1=1'; const params = [];
    if (category) { where += ' AND b.category = ?'; params.push(category); }
    if (status) { where += ' AND b.status = ?'; params.push(status); }
    if (dateFrom) { where += ' AND b.date_registered >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND b.date_registered <= ?'; params.push(dateTo); }
    const data = db.prepare(`
      SELECT b.*, r.first_name, r.last_name, r.address, r.contact_number
      FROM beneficiaries b LEFT JOIN residents r ON b.resident_id = r.id WHERE ${where}
      ORDER BY b.date_registered DESC
    `).all(...params);
    res.json({ data });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.get('/payouts', (req, res) => {
  try {
    const db = getDb();
    const { status, dateFrom, dateTo } = req.query;
    let where = '1=1'; const params = [];
    if (status) { where += ' AND t.status = ?'; params.push(status); }
    if (dateFrom) { where += ' AND s.schedule_date >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND s.schedule_date <= ?'; params.push(dateTo); }
    const data = db.prepare(`
      SELECT t.*, s.name as schedule_name, s.schedule_date, p.name as program_name,
        b.beneficiary_code, r.first_name, r.last_name
      FROM payout_transactions t
      LEFT JOIN payout_schedules s ON t.schedule_id = s.id
      LEFT JOIN payout_programs p ON s.program_id = p.id
      LEFT JOIN beneficiaries b ON t.beneficiary_id = b.id
      LEFT JOIN residents r ON b.resident_id = r.id
      WHERE ${where} ORDER BY s.schedule_date DESC
    `).all(...params);
    res.json({ data });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.get('/resources', (req, res) => {
  try {
    const db = getDb();
    const { category, status } = req.query;
    let where = '1=1'; const params = [];
    if (category) { where += ' AND category = ?'; params.push(category); }
    if (status) { where += ' AND status = ?'; params.push(status); }
    const data = db.prepare(`SELECT * FROM resources WHERE ${where} ORDER BY name`).all(...params);
    res.json({ data });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.get('/distributions', (req, res) => {
  try {
    const db = getDb();
    const { dateFrom, dateTo } = req.query;
    let where = '1=1'; const params = [];
    if (dateFrom) { where += ' AND d.distribution_date >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND d.distribution_date <= ?'; params.push(dateTo); }
    const data = db.prepare(`
      SELECT d.*, r.name as resource_name, r.unit,
        res.first_name, res.last_name, b.beneficiary_code
      FROM resource_distributions d
      LEFT JOIN resources r ON d.resource_id = r.id
      LEFT JOIN beneficiaries b ON d.beneficiary_id = b.id
      LEFT JOIN residents res ON b.resident_id = res.id
      WHERE ${where} ORDER BY d.distribution_date DESC
    `).all(...params);
    res.json({ data });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.get('/events', (req, res) => {
  try {
    const db = getDb();
    const { status, dateFrom, dateTo } = req.query;
    let where = '1=1'; const params = [];
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (dateFrom) { where += ' AND event_date >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND event_date <= ?'; params.push(dateTo); }
    const data = db.prepare(`SELECT * FROM events WHERE ${where} ORDER BY event_date DESC`).all(...params);
    res.json({ data });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// Export placeholders for PDF/Excel
router.get('/:type/export/pdf', (req, res) => {
  res.status(501).json({ message: 'PDF export not yet implemented.' });
});

router.get('/:type/export/excel', (req, res) => {
  res.status(501).json({ message: 'Excel export not yet implemented.' });
});

module.exports = router;
