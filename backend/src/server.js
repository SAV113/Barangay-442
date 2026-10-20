require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase, seedDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost dev, Vercel previews, and production
    const allowed = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];
    if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ---- Initialize Database ----
console.log('[Server] Initializing database...');
initializeDatabase();
seedDatabase();

// ---- Routes ----
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const residentsRoutes = require('./routes/residents');
const beneficiariesRoutes = require('./routes/beneficiaries');
const { programsRouter, schedulesRouter, transactionsRouter } = require('./routes/payouts');
const { resourcesRouter, distributionsRouter } = require('./routes/resources');
const announcementsRoutes = require('./routes/announcements');
const eventsRoutes = require('./routes/events');
const notificationsRoutes = require('./routes/notifications');
const auditLogsRoutes = require('./routes/auditLogs');
const reportsRoutes = require('./routes/reports');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/users', usersRoutes);
app.use('/residents', residentsRoutes);
app.use('/beneficiaries', beneficiariesRoutes);
app.use('/payout-programs', programsRouter);
app.use('/payout-schedules', schedulesRouter);
app.use('/payout-transactions', transactionsRouter);
app.use('/resources', resourcesRouter);
app.use('/distributions', distributionsRouter);
app.use('/announcements', announcementsRoutes);
app.use('/events', eventsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/audit-logs', auditLogsRoutes);
app.use('/reports', reportsRoutes);

// ---- Settings route (admin only) ----
const { authenticateToken, requireRole } = require('./middleware/auth');
const { getDb } = require('./database');

app.get('/settings', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM settings').all();
    res.json(settings.map(s => ({
      id: s.id, settingKey: s.setting_key, settingValue: s.setting_value,
      description: s.description, updatedBy: s.updated_by, updatedAt: s.updated_at,
    })));
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

app.patch('/settings/:key', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const { value } = req.body;
    db.prepare('UPDATE settings SET setting_value = ?, updated_by = ?, updated_at = datetime(\'now\') WHERE setting_key = ?')
      .run(value, req.user.id, req.params.key);
    const s = db.prepare('SELECT * FROM settings WHERE setting_key = ?').get(req.params.key);
    if (!s) return res.status(404).json({ message: 'Setting not found.' });
    res.json({ settingKey: s.setting_key, settingValue: s.setting_value });
  } catch (err) { res.status(500).json({ message: 'Internal server error.' }); }
});

// ---- Health Check ----
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ---- Error Handler ----
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  MASID Backend Server`);
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
