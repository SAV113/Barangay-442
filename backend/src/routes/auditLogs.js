const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireRole('admin'));

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { module: mod, action, userId, page = 1, limit = 20, dateFrom, dateTo } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = '1=1'; const params = [];
    if (mod) { where += ' AND module = ?'; params.push(mod); }
    if (action) { where += ' AND action = ?'; params.push(action); }
    if (userId) { where += ' AND user_id = ?'; params.push(userId); }
    if (dateFrom) { where += ' AND created_at >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND created_at <= ?'; params.push(dateTo); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM audit_logs WHERE ${where}`).get(...params).count;
    const data = db.prepare(`SELECT * FROM audit_logs WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...params, parseInt(limit), offset).map(log => ({
        id: log.id, userId: log.user_id, userName: log.user_name, action: log.action,
        module: log.module, recordId: log.record_id, details: log.details,
        ipAddress: log.ip_address, createdAt: log.created_at,
      }));
    res.json({ data, meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

module.exports = router;
