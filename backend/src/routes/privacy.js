const express = require('express');
const { getDb } = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper: get setting value or default
function getSetting(db, key, fallback) {
  try {
    const row = db.prepare('SELECT setting_value FROM settings WHERE setting_key = ?').get(key);
    return row && row.setting_value ? row.setting_value : fallback;
  } catch (err) {
    return fallback;
  }
}

/**
 * Standard Data Privacy Notice Content
 * Structured pursuant to Republic Act No. 10173 (Philippine Data Privacy Act of 2012)
 */
function getPrivacyNoticeData(db) {
  const version = getSetting(db, 'privacy_notice_version', '1.0');
  const lastUpdated = getSetting(db, 'privacy_notice_last_updated', 'November 1, 2026');
  const dpoName = getSetting(db, 'privacy_dpo_name', 'Barangay 442 Data Protection Officer');
  const dpoEmail = getSetting(db, 'privacy_dpo_email', 'dpo@barangay442.gov.ph');
  const dpoContact = getSetting(db, 'privacy_dpo_contact', '+63 2 8XXX-XXXX');

  return {
    version,
    lastUpdated,
    title: 'DATA PRIVACY CONSENT',
    subtitle: 'Pursuant to Republic Act No. 10173 (Data Privacy Act of 2012)',
    message:
      'By using this system, you acknowledge that your personal information may be collected, processed, and stored for legitimate purposes related to the operation and delivery of system services.\n\nYour personal information will be handled in accordance with the applicable data privacy laws and regulations. We are committed to protecting your privacy and ensuring that your information is used only for authorized purposes.\n\nPlease review the Data Privacy Notice carefully before proceeding.',
    dpo: {
      title: dpoName,
      office: 'Office of the Barangay Captain - Data Privacy Desk',
      email: dpoEmail,
      contact: dpoContact,
      address: 'Barangay 442 Hall, Zone 44, District IV, Sampaloc, Manila',
      jurisdiction: 'National Privacy Commission (NPC) Philippines',
    },
    sections: [
      {
        id: 'purpose',
        title: 'Purpose of Data Collection',
        icon: 'Target',
        content:
          'The MASID Barangay E-Services platform collects and processes personal information strictly for legitimate public administration and social welfare purposes in Barangay 442, Sampaloc, Manila.',
        points: [
          'Verifying resident identity and qualifications for barangay welfare assistance.',
          'Scheduling, allocating, and auditing financial payouts and cash disbursements.',
          'Managing inventory, queues, and receipt records for relief goods, medicines, and supplies.',
          'Disseminating urgent barangay announcements, safety advisories, and community event notices.',
          'Generating transparent government audit trails and statistical reports for barangay governance.',
        ],
      },
      {
        id: 'information_collected',
        title: 'Personal Information Collected',
        icon: 'UserCheck',
        content:
          'We only collect information directly necessary for the delivery of barangay e-services. Personal data collected includes:',
        points: [
          'Identity details: Full legal name, gender, civil status, and date of birth.',
          'Contact & Residence: Home address within Barangay 442, email address, and mobile/telephone number.',
          'Social Service Category: Senior Citizen, PWD, Solo Parent, 4Ps recipient, or Indigent status.',
          'Assistance History: Payout schedules, claimed/unclaimed amounts, and resource distribution receipt records.',
          'Account Security: Encrypted password credentials, security verification responses, and login timestamps.',
        ],
      },
      {
        id: 'processing_storage',
        title: 'Data Processing and Storage',
        icon: 'Database',
        content:
          'Your personal information is processed electronically within the secure MASID system environment. All records are stored in protected relational databases with Write-Ahead Logging (WAL) integrity, hosted on monitored cloud infrastructure with restricted physical and network access.',
      },
      {
        id: 'protection_security',
        title: 'Data Protection and Security',
        icon: 'Shield',
        content:
          'We apply organizational, physical, and technical security measures in compliance with National Privacy Commission regulations:',
        points: [
          'Data encryption in transit using Transport Layer Security (TLS/HTTPS) and cryptographic hashing for sensitive credentials.',
          'Strict Role-Based Access Control (RBAC) ensuring only authorized barangay administrators and designated staff can access specific resident records.',
          'Automated, tamper-resistant system audit logging that timestamps every record creation, modification, and access.',
          'Regular data validation, automated anomaly alerts, and strict session timeout protection.',
        ],
      },
      {
        id: 'sharing_disclosure',
        title: 'Data Sharing and Disclosure',
        icon: 'Share2',
        content:
          'Your personal information is strictly confidential. We do not sell, rent, trade, or share your data with private commercial entities.',
        points: [
          'Information is accessed exclusively by accredited Barangay 442 officials performing their official duties.',
          'Data may only be shared with verified government agencies (e.g., DSWD, City of Manila Government, or Commission on Audit) when strictly required by statutory mandates or financial assistance validation laws.',
        ],
      },
      {
        id: 'retention',
        title: 'Data Retention and Disposal',
        icon: 'Clock',
        content:
          'Personal information is retained only for as long as necessary to fulfill the legitimate purposes for which it was obtained, or as mandated by Philippine government auditing rules and statutory retention schedules. Upon expiration of the required period, records are permanently archived or securely anonymized.',
      },
      {
        id: 'user_rights',
        title: 'User Rights under R.A. 10173',
        icon: 'Award',
        content:
          'Under the Philippine Data Privacy Act of 2012, as a data subject you possess the following statutory rights:',
        points: [
          'Right to be Informed: To know whether your personal data is being processed and for what purpose.',
          'Right to Access: To request reasonable access to your personal data held by the barangay.',
          'Right to Rectification: To dispute any inaccuracy or error in your personal data and have it corrected.',
          'Right to Object: To withhold or withdraw consent to the processing of your personal information, subject to statutory limits.',
          'Right to Erasure or Blocking: To suspend, withdraw, or order the removal of your personal data upon valid grounds.',
          'Right to Damages: To be indemnified for any damages sustained due to inaccurate, incomplete, or unlawful processing.',
          'Right to File a Complaint: To lodge a formal complaint before the National Privacy Commission (NPC) at https://privacy.gov.ph.',
        ],
      },
      {
        id: 'dpo_contact',
        title: 'Contact Information of the Data Protection Officer',
        icon: 'Mail',
        content:
          'For inquiries, concerns, requests to exercise your data subject rights, or feedback regarding our privacy practices, you may reach the designated Barangay 442 Data Protection Officer:',
        points: [
          `Designated Officer: ${dpoName}`,
          `Office: Office of the Barangay Captain, Barangay 442, Zone 44, Sampaloc, Manila`,
          `Email Address: ${dpoEmail}`,
          `Telephone: ${dpoContact}`,
          `Office Hours: Monday to Friday, 8:00 AM – 5:00 PM`,
        ],
      },
    ],
  };
}

/**
 * GET /privacy/notice
 * Public endpoint: Returns active Data Privacy Notice content and metadata
 */
router.get('/notice', (req, res) => {
  try {
    const db = getDb();
    const notice = getPrivacyNoticeData(db);
    res.json(notice);
  } catch (err) {
    console.error('[Privacy] Error fetching notice:', err);
    res.status(500).json({ message: 'Failed to retrieve data privacy notice.' });
  }
});

/**
 * GET /privacy/status
 * Authenticated: Returns user's consent status for current notice version
 */
router.get('/status', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const activeVersion = getSetting(db, 'privacy_notice_version', '1.0');

    // Check latest consent for current version
    const consent = db
      .prepare(
        `SELECT id, consent_status, privacy_version, consent_purpose, created_at
         FROM privacy_consents
         WHERE user_id = ? AND privacy_version = ?
         ORDER BY id DESC LIMIT 1`
      )
      .get(req.user.id, activeVersion);

    const isConsented = consent && consent.consent_status === 'agreed';

    res.json({
      consented: Boolean(isConsented),
      currentVersion: activeVersion,
      userConsent: consent
        ? {
            id: consent.id,
            status: consent.consent_status,
            version: consent.privacy_version,
            purpose: consent.consent_purpose,
            createdAt: consent.created_at,
          }
        : null,
    });
  } catch (err) {
    console.error('[Privacy] Error checking consent status:', err);
    res.status(500).json({ message: 'Failed to verify privacy consent status.' });
  }
});

/**
 * POST /privacy/consent
 * Authenticated: Record user consent or decline decision
 * Body: { consentStatus: 'agreed' | 'declined', version?: string, purpose?: string }
 */
router.post('/consent', authenticateToken, (req, res) => {
  try {
    const { consentStatus, version, purpose } = req.body;

    if (!consentStatus || !['agreed', 'declined'].includes(consentStatus)) {
      return res.status(400).json({ message: 'Consent status must be either "agreed" or "declined".' });
    }

    const db = getDb();
    const activeVersion = version || getSetting(db, 'privacy_notice_version', '1.0');
    const consentPurpose = purpose || 'barangay_services_operation';
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Insert new consent record in database
    const result = db
      .prepare(
        `INSERT INTO privacy_consents (user_id, consent_status, privacy_version, consent_purpose, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(req.user.id, consentStatus, activeVersion, consentPurpose, String(clientIp), String(userAgent));

    // Get user details for audit log
    const user = db.prepare('SELECT first_name, last_name FROM users WHERE id = ?').get(req.user.id);
    const userName = user ? `${user.first_name} ${user.last_name}` : `User #${req.user.id}`;

    // Audit log
    const auditAction = consentStatus === 'agreed' ? 'PRIVACY_CONSENT_AGREED' : 'PRIVACY_CONSENT_DECLINED';
    const auditDetails =
      consentStatus === 'agreed'
        ? `User agreed to Data Privacy Notice version ${activeVersion} (R.A. 10173)`
        : `User declined Data Privacy Notice version ${activeVersion}`;

    db.prepare(
      `INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details, ip_address)
       VALUES (?, ?, ?, 'privacy', ?, ?, ?)`
    ).run(req.user.id, userName, auditAction, result.lastInsertRowid, auditDetails, String(clientIp));

    res.json({
      success: true,
      consentStatus,
      version: activeVersion,
      consented: consentStatus === 'agreed',
      recordedAt: new Date().toISOString(),
      message:
        consentStatus === 'agreed'
          ? 'Data privacy consent successfully recorded.'
          : 'Data privacy consent decline recorded. Access to protected services remains restricted.',
    });
  } catch (err) {
    console.error('[Privacy] Error recording consent:', err);
    res.status(500).json({ message: 'Failed to record data privacy consent.' });
  }
});

/**
 * GET /privacy/consents
 * Admin only: View all consent records with user details
 */
router.get('/consents', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const { status, version, search, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '1=1';
    const params = [];

    if (status) {
      whereClause += ' AND pc.consent_status = ?';
      params.push(status);
    }
    if (version) {
      whereClause += ' AND pc.privacy_version = ?';
      params.push(version);
    }
    if (search) {
      whereClause += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const total = db
      .prepare(
        `SELECT COUNT(*) as count
         FROM privacy_consents pc
         LEFT JOIN users u ON pc.user_id = u.id
         WHERE ${whereClause}`
      )
      .get(...params).count;

    const consents = db
      .prepare(
        `SELECT
           pc.id,
           pc.user_id as userId,
           pc.consent_status as consentStatus,
           pc.privacy_version as privacyVersion,
           pc.consent_purpose as consentPurpose,
           pc.ip_address as ipAddress,
           pc.user_agent as userAgent,
           pc.created_at as createdAt,
           u.first_name as firstName,
           u.last_name as lastName,
           u.email,
           u.role
         FROM privacy_consents pc
         LEFT JOIN users u ON pc.user_id = u.id
         WHERE ${whereClause}
         ORDER BY pc.id DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, Number(limit), offset);

    res.json({
      data: consents,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (err) {
    console.error('[Privacy] Error fetching consent records:', err);
    res.status(500).json({ message: 'Failed to fetch consent records.' });
  }
});

module.exports = router;
