const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const notifications = db.prepare(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(req.user.id).map(n => ({
      id: n.id, userId: n.user_id, title: n.title, message: n.message,
      type: n.type, referenceType: n.reference_type, referenceId: n.reference_id,
      isRead: !!n.is_read, createdAt: n.created_at,
    }));
    res.json(notifications);
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.patch('/:id/read', (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Marked as read.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

router.patch('/read-all', (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'All marked as read.' });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

module.exports = router;
