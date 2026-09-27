const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication and admin/staff role
router.use(authenticateToken, requireRole('admin', 'staff'));

/**
 * GET /dashboard/stats
 */
router.get('/stats', (req, res) => {
  try {
    const db = getDb();

    const totalBeneficiaries = db.prepare('SELECT COUNT(*) as count FROM beneficiaries').get().count;
    const activeBeneficiaries = db.prepare("SELECT COUNT(*) as count FROM beneficiaries WHERE status = 'active'").get().count;
    const upcomingPayouts = db.prepare("SELECT COUNT(*) as count FROM payout_schedules WHERE status = 'scheduled'").get().count;
    const pendingTransactions = db.prepare("SELECT COUNT(*) as count FROM payout_transactions WHERE status = 'pending'").get().count;
    const totalResources = db.prepare('SELECT COUNT(*) as count FROM resources').get().count;
    const lowStockItems = db.prepare("SELECT COUNT(*) as count FROM resources WHERE status = 'low_stock'").get().count;
    const outOfStockItems = db.prepare("SELECT COUNT(*) as count FROM resources WHERE status = 'out_of_stock'").get().count;
    const distributedThisMonth = db.prepare(
      "SELECT COUNT(*) as count FROM resource_distributions WHERE distribution_date >= date('now', 'start of month')"
    ).get().count;
    const upcomingEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'published' AND event_date >= date('now')").get().count;
    const publishedAnnouncements = db.prepare("SELECT COUNT(*) as count FROM announcements WHERE status = 'published'").get().count;

    const payoutsByStatus = db.prepare(
      'SELECT status, COUNT(*) as count FROM payout_transactions GROUP BY status'
    ).all();

    const resourcesByCategory = db.prepare(
      'SELECT category, SUM(quantity) as quantity FROM resources GROUP BY category'
    ).all();

    const recentAuditLogs = db.prepare(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10'
    ).all().map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user_name,
      action: log.action,
      module: log.module,
      recordId: log.record_id,
      details: log.details,
      ipAddress: log.ip_address,
      createdAt: log.created_at,
    }));

    res.json({
      totalBeneficiaries,
      activeBeneficiaries,
      upcomingPayouts,
      pendingTransactions,
      totalResources,
      lowStockItems,
      outOfStockItems,
      distributedThisMonth,
      upcomingEvents,
      publishedAnnouncements,
      payoutsByStatus,
      resourcesByCategory,
      monthlyAssistance: [],
      recentAuditLogs,
    });
  } catch (err) {
    console.error('[Dashboard] Stats error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * GET /dashboard/charts
 */
router.get('/charts', (req, res) => {
  try {
    const db = getDb();

    const beneficiariesByCategory = db.prepare(
      'SELECT category, COUNT(*) as count FROM beneficiaries GROUP BY category'
    ).all();

    const resourcesByCategory = db.prepare(
      'SELECT category, SUM(quantity) as quantity FROM resources GROUP BY category'
    ).all();

    res.json({
      beneficiariesByCategory,
      resourcesByCategory,
    });
  } catch (err) {
    console.error('[Dashboard] Charts error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
