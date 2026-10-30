const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'masid-default-secret';

// Helper: format user for response (strip password_hash)
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

// Helper: generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: { accessToken, user }
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive or suspended.' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update last login
    db.prepare('UPDATE users SET last_login_at = datetime(\'now\') WHERE id = ?').run(user.id);

    // Log the login
    db.prepare(
      'INSERT INTO audit_logs (user_id, user_name, action, module, details) VALUES (?, ?, ?, ?, ?)'
    ).run(user.id, `${user.first_name} ${user.last_name}`, 'LOGIN', 'auth', 'User logged in successfully');

    const accessToken = generateToken(user);

    res.json({
      accessToken,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * POST /auth/register
 * Body: { email, password, firstName, lastName, securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2 }
 * ALWAYS creates a RESIDENT account. Role cannot be set by client.
 */
router.post('/register', (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      securityQuestion1,
      securityAnswer1,
      securityQuestion2,
      securityAnswer2,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const db = getDb();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 12);

    const q1 = securityQuestion1 || "What is your mother's name?";
    const a1 = (securityAnswer1 || '').trim();
    const q2 = securityQuestion2 || "What is your dog's name?";
    const a2 = (securityAnswer2 || '').trim();

    // ALWAYS resident - never trust client role input
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, status, security_question_1, security_answer_1, security_question_2, security_answer_2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(email, passwordHash, firstName, lastName, 'resident', 'active', q1, a1, q2, a2);

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Also create a resident record
    db.prepare(
      'INSERT INTO residents (user_id, first_name, last_name, address) VALUES (?, ?, ?, ?)'
    ).run(newUser.id, firstName, lastName, 'Barangay 442, Sampaloc, Manila');

    // Log registration with Data Privacy Act compliance note
    db.prepare(
      'INSERT INTO audit_logs (user_id, user_name, action, module, details) VALUES (?, ?, ?, ?, ?)'
    ).run(newUser.id, `${firstName} ${lastName}`, 'REGISTER', 'auth', 'New resident account created (Consented to R.A. 10173 Data Privacy Policy)');

    const accessToken = generateToken(newUser);

    res.status(201).json({
      accessToken,
      user: formatUser(newUser),
    });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * GET /auth/me
 * Returns the current authenticated user.
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(formatUser(user));
  } catch (err) {
    console.error('[Auth] GetMe error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * POST /auth/refresh
 * Refreshes the JWT token.
 */
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid session.' });
    }

    const accessToken = generateToken(user);
    res.json({ accessToken, user: formatUser(user) });
  } catch (err) {
    console.error('[Auth] Refresh error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * POST /auth/logout
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

/**
 * POST /auth/get-security-questions
 * Body: { email }
 * Returns registered security questions for the user (e.g. mother's name, dog's name)
 */
router.post('/get-security-questions', (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account is currently inactive or suspended. Please visit the Barangay Hall for assistance.' });
    }

    const question1 = user.security_question_1 || "What is your mother's name?";
    const question2 = user.security_question_2 || "What is your dog's name?";

    res.json({
      success: true,
      email: user.email,
      residentName: `${user.first_name} ${user.last_name}`,
      question1,
      question2,
    });
  } catch (err) {
    console.error('[Auth] Get security questions error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * POST /auth/verify-security-answers
 * Body: { email, answer1, answer2 }
 * Verifies answers to security questions before granting resetToken
 */
router.post('/verify-security-answers', (req, res) => {
  try {
    const { email, answer1, answer2 } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    if (!answer1 || !answer2) {
      return res.status(400).json({ message: 'Please answer both security questions.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account is currently inactive or suspended. Please visit the Barangay Hall for assistance.' });
    }

    const clean = (s) => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    const input1 = clean(answer1);
    const input2 = clean(answer2);
    const expected1 = clean(user.security_answer_1);
    const expected2 = clean(user.security_answer_2);

    // Also check associated resident record middle_name as mother's maiden name fallback
    const resident = db.prepare('SELECT * FROM residents WHERE user_id = ?').get(user.id);
    const resMiddle = clean(resident?.middle_name);

    const match1 = (expected1 && input1 === expected1) || (resMiddle && input1 === resMiddle) || (!expected1 && input1.length > 0);
    const match2 = (expected2 && input2 === expected2) || (!expected2 && input2.length > 0);

    if (!match1 || !match2) {
      return res.status(400).json({
        message: 'Security answers do not match our records. Please check your spelling and try again.',
      });
    }

    // Generate short-lived reset token (15 mins)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Audit log
    db.prepare(
      'INSERT INTO audit_logs (user_id, user_name, action, module, details) VALUES (?, ?, ?, ?, ?)'
    ).run(user.id, `${user.first_name} ${user.last_name}`, 'SECURITY_VERIFY', 'auth', 'Resident verified security questions for password reset');

    res.json({
      success: true,
      resetToken,
      residentName: `${user.first_name} ${user.last_name}`,
      message: 'Security questions verified successfully.',
    });
  } catch (err) {
    console.error('[Auth] Verify security answers error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * POST /auth/verify-resident
 * Body: { email, firstName, lastName }
 */
router.post('/verify-resident', (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ message: 'Email, first name, and last name are required.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account is currently inactive or suspended. Please contact the Barangay Hall.' });
    }

    // Name matching check (case-insensitive, trimmed)
    const normUserFirst = (user.first_name || '').trim().toLowerCase();
    const normUserLast = (user.last_name || '').trim().toLowerCase();
    const normInputFirst = firstName.trim().toLowerCase();
    const normInputLast = lastName.trim().toLowerCase();

    let nameMatches = normUserFirst === normInputFirst && normUserLast === normInputLast;

    // Check associated resident record
    const resident = db.prepare('SELECT * FROM residents WHERE user_id = ?').get(user.id);
    if (!nameMatches && resident) {
      const normResFirst = (resident.first_name || '').trim().toLowerCase();
      const normResLast = (resident.last_name || '').trim().toLowerCase();
      nameMatches = normResFirst === normInputFirst && normResLast === normInputLast;
    }

    if (!nameMatches) {
      return res.status(400).json({ message: 'First name or last name does not match our records for this email.' });
    }

    // Generate short-lived reset token (15 mins)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      resetToken,
      residentName: `${user.first_name} ${user.last_name}`,
      message: 'Identity verified successfully.',
    });
  } catch (err) {
    console.error('[Auth] Verify resident error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

/**
 * POST /auth/reset-password
 * Body: { resetToken, newPassword }
 */
router.post('/reset-password', (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Reset session has expired or is invalid. Please verify your details again.' });
    }

    if (decoded.purpose !== 'password_reset' || !decoded.id) {
      return res.status(400).json({ message: 'Invalid token purpose.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 12);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(newHash, user.id);

    // Audit log
    db.prepare(
      'INSERT INTO audit_logs (user_id, user_name, action, module, details) VALUES (?, ?, ?, ?, ?)'
    ).run(user.id, `${user.first_name} ${user.last_name}`, 'PASSWORD_RESET', 'auth', 'Password was successfully reset by resident via identity verification');

    res.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });
  } catch (err) {
    console.error('[Auth] Reset password error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
