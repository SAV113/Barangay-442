const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'masid.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const db = getDb();

  // ---- Create Tables ----
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'resident' CHECK(role IN ('admin','staff','resident')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','suspended')),
      profile_photo TEXT,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS residents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      middle_name TEXT,
      address TEXT NOT NULL,
      contact_number TEXT,
      birthdate TEXT,
      gender TEXT CHECK(gender IN ('male','female','other')),
      civil_status TEXT CHECK(civil_status IN ('single','married','widowed','separated')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS beneficiaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      beneficiary_code TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK(category IN ('senior_citizen','pwd','solo_parent','4ps','indigent','other')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive','archived')),
      date_registered TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE RESTRICT,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payout_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'financial' CHECK(category IN ('financial','food','medical','educational','livelihood','other')),
      budget REAL,
      amount_per_beneficiary REAL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('active','completed','cancelled','draft')),
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payout_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      schedule_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','ongoing','completed','cancelled')),
      is_public INTEGER NOT NULL DEFAULT 1,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (program_id) REFERENCES payout_programs(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS payout_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      beneficiary_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','claimed','unclaimed','cancelled')),
      claimed_at TEXT,
      notes TEXT,
      recorded_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(schedule_id, beneficiary_id),
      FOREIGN KEY (schedule_id) REFERENCES payout_schedules(id) ON DELETE RESTRICT,
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE RESTRICT,
      FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('food','medicine','hygiene','clothing','equipment','other')),
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'pcs',
      low_stock_threshold INTEGER NOT NULL DEFAULT 10,
      date_added TEXT NOT NULL,
      expiration_date TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','low_stock','out_of_stock')),
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS resource_distributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL,
      beneficiary_id INTEGER,
      recipient_name TEXT,
      quantity INTEGER NOT NULL,
      distribution_date TEXT NOT NULL,
      purpose TEXT,
      notes TEXT,
      distributed_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE SET NULL,
      FOREIGN KEY (distributed_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general' CHECK(category IN ('health','community','emergency','livelihood','general','youth','senior','environmental')),
      content TEXT NOT NULL,
      short_description TEXT,
      image_url TEXT,
      author_id INTEGER,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
      published_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      location TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other' CHECK(category IN ('assembly','health','sports','youth','senior','livelihood','environmental','cultural','other')),
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','cancelled','completed')),
      max_participants INTEGER,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('info','success','warning','error','payout','resource','announcement','event')),
      reference_type TEXT,
      reference_id INTEGER,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT,
      description TEXT,
      updated_by INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log('[DB] Tables created successfully.');
}

function seedDatabase() {
  const db = getDb();

  // Check if data already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('[DB] Database already seeded. Skipping.');
    return;
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@masid.gov.ph';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
  const STAFF_EMAIL = process.env.STAFF_EMAIL || 'staff1@masid.gov.ph';
  const STAFF_PASSWORD = process.env.STAFF_PASSWORD || 'Staff@123';

  const adminHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
  const staffHash = bcrypt.hashSync(STAFF_PASSWORD, 12);
  const residentHash = bcrypt.hashSync('Resident@123', 12);

  // ---- Seed Users ----
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, first_name, last_name, role, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `);

  const seedUsers = db.transaction(() => {
    insertUser.run(ADMIN_EMAIL, adminHash, 'Maria', 'Santos', 'admin');
    insertUser.run(STAFF_EMAIL, staffHash, 'Jose', 'Reyes', 'staff');
    insertUser.run('staff2@masid.gov.ph', staffHash, 'Ana', 'Cruz', 'staff');
    insertUser.run('juan.delacruz@gmail.com', residentHash, 'Juan', 'Dela Cruz', 'resident');
    insertUser.run('maria.garcia@gmail.com', residentHash, 'Maria', 'Garcia', 'resident');
    insertUser.run('pedro.lim@gmail.com', residentHash, 'Pedro', 'Lim', 'resident');
  });
  seedUsers();
  console.log('[DB] Users seeded.');

  // ---- Seed Residents ----
  const insertResident = db.prepare(`
    INSERT INTO residents (user_id, first_name, last_name, middle_name, address, contact_number, birthdate, gender, civil_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedResidents = db.transaction(() => {
    insertResident.run(4, 'Juan', 'Dela Cruz', 'Buenaventura', '123 Rizal Street, Barangay 442, Sampaloc, Manila', '09171234567', '1985-05-15', 'male', 'married');
    insertResident.run(5, 'Maria', 'Garcia', 'Reyes', '456 Mabini Avenue, Barangay 442, Sampaloc, Manila', '09182345678', '1975-08-22', 'female', 'single');
    insertResident.run(6, 'Pedro', 'Lim', 'Santos', '789 Bonifacio Street, Barangay 442, Sampaloc, Manila', '09193456789', '1958-03-10', 'male', 'married');
    insertResident.run(null, 'Lucia', 'Fernandez', 'Aquino', '321 Quezon Street, Barangay 442, Sampaloc, Manila', '09204567890', '1950-12-05', 'female', 'widowed');
    insertResident.run(null, 'Roberto', 'Mendoza', 'Cruz', '654 Luna Street, Barangay 442, Sampaloc, Manila', '09215678901', '1990-07-18', 'male', 'single');
    insertResident.run(null, 'Rosario', 'Villanueva', 'Perez', '987 Del Pilar Street, Barangay 442, Sampaloc, Manila', '09226789012', '1965-02-28', 'female', 'married');
    insertResident.run(null, 'Antonio', 'Bautista', 'Ramos', '147 Legarda Street, Barangay 442, Sampaloc, Manila', '09237890123', '1948-11-14', 'male', 'widowed');
    insertResident.run(null, 'Elena', 'Castillo', 'Morales', '258 Espana Boulevard, Barangay 442, Sampaloc, Manila', '09248901234', '1980-04-03', 'female', 'married');
    insertResident.run(null, 'Fernando', 'Torres', 'Jimenez', '369 P. Noval Street, Barangay 442, Sampaloc, Manila', '09259012345', '1995-09-25', 'male', 'single');
    insertResident.run(null, 'Corazon', 'Ramos', 'Santiago', '741 Lacson Street, Barangay 442, Sampaloc, Manila', '09260123456', '1943-06-19', 'female', 'widowed');
  });
  seedResidents();
  console.log('[DB] Residents seeded.');

  // ---- Seed Beneficiaries ----
  db.exec(`
    INSERT INTO beneficiaries (resident_id, beneficiary_code, category, status, date_registered, notes, created_by) VALUES
      (3, 'BRY442-SC-001', 'senior_citizen', 'active', '2024-01-15', 'Qualified senior citizen beneficiary', 1),
      (4, 'BRY442-SC-002', 'senior_citizen', 'active', '2024-01-15', 'Qualified senior citizen beneficiary', 1),
      (7, 'BRY442-SC-003', 'senior_citizen', 'active', '2024-02-01', 'Qualified senior citizen beneficiary', 1),
      (10, 'BRY442-SC-004', 'senior_citizen', 'active', '2024-02-01', 'Qualified senior citizen beneficiary', 1),
      (1, 'BRY442-4PS-001', '4ps', 'active', '2024-01-20', '4Ps registered household', 1),
      (2, 'BRY442-SP-001', 'solo_parent', 'active', '2024-03-10', 'Solo parent with 2 children', 1),
      (6, 'BRY442-SP-002', 'solo_parent', 'active', '2024-03-15', 'Solo parent verified', 1),
      (5, 'BRY442-IND-001', 'indigent', 'active', '2024-04-01', 'Indigent family - low income', 1),
      (8, 'BRY442-PWD-001', 'pwd', 'active', '2024-04-10', 'PWD with disability ID', 1),
      (9, 'BRY442-IND-002', 'indigent', 'active', '2024-05-01', 'Indigent - no stable income', 2);
  `);
  console.log('[DB] Beneficiaries seeded.');

  // ---- Seed Payout Programs ----
  db.exec(`
    INSERT INTO payout_programs (name, description, category, budget, amount_per_beneficiary, status, created_by) VALUES
      ('Ayuda sa Matatanda (Senior Citizen Financial Assistance)', 'Monthly financial assistance for senior citizens aged 60 and above residing in Barangay 442.', 'financial', 50000.00, 500.00, 'active', 1),
      ('4Ps Barangay Supplement', 'Additional barangay support for registered 4Ps households.', 'financial', 20000.00, 1000.00, 'active', 1),
      ('Tulong sa Nangangailangan (Indigent Assistance)', 'Emergency assistance for indigent families in the barangay.', 'financial', 30000.00, 750.00, 'active', 1),
      ('Pamigay ng Bigas at Pagkain', 'Distribution of rice and food packs to qualified beneficiaries.', 'food', 80000.00, NULL, 'active', 1),
      ('Solo Parent Assistance Program', 'Monthly assistance for registered solo parents in the barangay.', 'financial', 25000.00, 800.00, 'active', 2);
  `);
  console.log('[DB] Payout programs seeded.');

  // ---- Seed Payout Schedules ----
  db.exec(`
    INSERT INTO payout_schedules (program_id, name, schedule_date, start_time, end_time, location, notes, status, is_public, created_by) VALUES
      (1, 'August 2026 Senior Citizen Payout', '2026-08-20', '08:00:00', '16:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Bring valid ID and senior citizen card', 'scheduled', 1, 1),
      (2, '4Ps August 2026 Supplement', '2026-08-22', '09:00:00', '15:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Bring 4Ps ID and barangay clearance', 'scheduled', 1, 1),
      (3, 'August Indigent Assistance Payout', '2026-08-25', '08:00:00', '12:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Priority for families with children', 'scheduled', 1, 1),
      (5, 'August Solo Parent Assistance', '2026-08-27', '09:00:00', '14:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Bring solo parent ID', 'scheduled', 1, 2),
      (1, 'July 2026 Senior Citizen Payout', '2026-07-20', '08:00:00', '16:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Completed successfully', 'completed', 1, 1);
  `);
  console.log('[DB] Payout schedules seeded.');

  // ---- Seed Payout Transactions ----
  db.exec(`
    INSERT INTO payout_transactions (schedule_id, beneficiary_id, amount, status, claimed_at, recorded_by) VALUES
      (5, 1, 500.00, 'claimed', '2026-07-20 09:30:00', 2),
      (5, 2, 500.00, 'claimed', '2026-07-20 10:15:00', 2),
      (5, 3, 500.00, 'unclaimed', NULL, 2),
      (5, 4, 500.00, 'claimed', '2026-07-20 11:00:00', 2),
      (1, 1, 500.00, 'pending', NULL, NULL),
      (1, 2, 500.00, 'pending', NULL, NULL),
      (1, 3, 500.00, 'pending', NULL, NULL),
      (1, 4, 500.00, 'pending', NULL, NULL),
      (2, 5, 1000.00, 'pending', NULL, NULL),
      (3, 8, 750.00, 'pending', NULL, NULL),
      (3, 10, 750.00, 'pending', NULL, NULL);
  `);
  console.log('[DB] Payout transactions seeded.');

  // ---- Seed Resources ----
  db.exec(`
    INSERT INTO resources (name, category, quantity, unit, low_stock_threshold, date_added, expiration_date, description, status, created_by) VALUES
      ('Premium Rice', 'food', 450, 'bags', 50, '2026-07-01', '2027-07-01', '50kg bags of premium rice from DSWD', 'available', 1),
      ('Canned Sardines', 'food', 800, 'cans', 100, '2026-07-01', '2027-06-30', 'Assorted canned sardines', 'available', 1),
      ('Paracetamol 500mg', 'medicine', 500, 'tablets', 100, '2026-06-15', '2027-12-31', 'Generic paracetamol tablets', 'available', 1),
      ('Amoxicillin 500mg', 'medicine', 200, 'capsules', 50, '2026-06-15', '2027-06-30', 'Antibiotic capsules', 'available', 1),
      ('Face Masks (Surgical)', 'hygiene', 1200, 'pcs', 200, '2026-07-10', NULL, 'Disposable surgical face masks (50pcs/box)', 'available', 1),
      ('Alcohol 70% (500ml)', 'hygiene', 80, 'bottles', 20, '2026-07-10', '2027-07-10', 'Isopropyl alcohol 70% in 500ml bottles', 'low_stock', 1),
      ('Hygiene Kits', 'hygiene', 60, 'kits', 20, '2026-07-15', NULL, 'Includes soap, toothbrush, toothpaste, shampoo', 'low_stock', 2),
      ('Folding Tables', 'equipment', 15, 'pcs', 3, '2026-01-01', NULL, 'Foldable tables for barangay events', 'available', 1),
      ('Monobloc Chairs', 'equipment', 100, 'pcs', 20, '2026-01-01', NULL, 'White monobloc chairs for events', 'available', 1),
      ('Vitamins C 500mg', 'medicine', 5, 'bottles', 10, '2026-05-01', '2026-12-31', 'Vitamin C supplements', 'out_of_stock', 1);
  `);
  console.log('[DB] Resources seeded.');

  // ---- Seed Distributions ----
  db.exec(`
    INSERT INTO resource_distributions (resource_id, beneficiary_id, quantity, distribution_date, purpose, distributed_by) VALUES
      (1, 1, 1, '2026-07-15', 'Monthly rice distribution for senior citizens', 2),
      (1, 2, 1, '2026-07-15', 'Monthly rice distribution for senior citizens', 2),
      (1, 3, 1, '2026-07-15', 'Monthly rice distribution for senior citizens', 2),
      (1, 4, 1, '2026-07-15', 'Monthly rice distribution for senior citizens', 2),
      (2, 5, 5, '2026-07-20', '4Ps canned goods distribution', 2),
      (3, 8, 10, '2026-07-22', 'Medical mission - pain relief', 3),
      (5, NULL, 100, '2026-07-25', 'Community health event face mask distribution', 3),
      (7, 6, 1, '2026-08-01', 'Hygiene kit for solo parent', 2),
      (7, 7, 1, '2026-08-01', 'Hygiene kit for indigent family', 2);
  `);
  console.log('[DB] Distributions seeded.');

  // ---- Seed Announcements ----
  db.exec(`
    INSERT INTO announcements (title, category, content, short_description, author_id, status, published_at) VALUES
      ('Barangay Clean-Up Drive - August 2026', 'community', '<p>Community clean-up drive on August 15, 2026.</p>', 'Residents are encouraged to participate in the upcoming community clean-up drive scheduled on August 15, 2026.', 1, 'published', '2026-08-01 08:00:00'),
      ('Free Medical Mission - August 2026', 'health', '<p>Free medical services for all Barangay 442 residents.</p>', 'Free medical and dental services for all Barangay 442 residents. Bring your barangay ID.', 1, 'published', '2026-08-05 09:00:00'),
      ('Barangay Assembly - August 28, 2026', 'community', '<p>3rd Quarter Barangay Assembly on August 28.</p>', 'Attend the 3rd Quarter Barangay Assembly on August 28, 2026 at Barangay 442 Hall.', 1, 'published', '2026-08-08 07:00:00'),
      ('Livelihood Training Program - Stitching and Embroidery', 'livelihood', '<p>Free livelihood training in stitching and embroidery.</p>', 'Free 2-week livelihood training on stitching and embroidery for Barangay 442 residents aged 18-60.', 2, 'published', '2026-08-10 10:00:00'),
      ('Emergency Protocol: Typhoon Preparedness Reminder', 'emergency', '<p>Typhoon preparedness reminder for all residents.</p>', 'Typhoon preparedness reminder for all Barangay 442 residents. Be ready with emergency kits.', 1, 'published', '2026-08-11 06:00:00');
  `);
  console.log('[DB] Announcements seeded.');

  // ---- Seed Events ----
  db.exec(`
    INSERT INTO events (title, description, event_date, start_time, end_time, location, category, status, created_by) VALUES
      ('Barangay Assembly - 3rd Quarter 2026', 'Quarterly barangay assembly open to all residents.', '2026-08-28', '09:00:00', '12:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'assembly', 'published', 1),
      ('Libre Medical Mission', 'Free medical services for Barangay 442 residents.', '2026-08-18', '07:00:00', '17:00:00', 'Barangay 442 Health Center, Sampaloc, Manila', 'health', 'published', 1),
      ('Community Clean-Up Drive', 'Quarterly community clean-up drive.', '2026-08-15', '06:00:00', '10:00:00', 'Various locations in Barangay 442', 'environmental', 'published', 2),
      ('Youth Sports Festival 2026', 'Annual sports event for youth aged 12-25.', '2026-09-05', '08:00:00', '18:00:00', 'Sampaloc Sports Complex', 'sports', 'published', 2),
      ('Senior Citizen Appreciation Day', 'Special event honoring senior citizens.', '2026-09-15', '09:00:00', '15:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'senior', 'published', 1),
      ('Livelihood Training: Stitching and Embroidery', '2-week livelihood training program.', '2026-08-25', '08:00:00', '17:00:00', 'Barangay 442 Multi-Purpose Hall', 'livelihood', 'published', 2);
  `);
  console.log('[DB] Events seeded.');

  // ---- Seed Audit Logs ----
  db.exec(`
    INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details) VALUES
      (1, 'Maria Santos', 'CREATE', 'beneficiaries', 1, 'Created beneficiary BRY442-SC-001 for Pedro Lim'),
      (1, 'Maria Santos', 'CREATE', 'payout_programs', 1, 'Created payout program: Ayuda sa Matatanda'),
      (2, 'Jose Reyes', 'UPDATE', 'payout_transactions', 1, 'Updated transaction status to CLAIMED'),
      (2, 'Jose Reyes', 'CREATE', 'resource_distributions', 1, 'Distributed 1 bag of rice'),
      (1, 'Maria Santos', 'PUBLISH', 'announcements', 1, 'Published announcement: Barangay Clean-Up Drive'),
      (1, 'Maria Santos', 'PUBLISH', 'events', 1, 'Published event: Barangay Assembly'),
      (3, 'Ana Cruz', 'CREATE', 'resource_distributions', 5, 'Distributed 5 canned goods'),
      (1, 'Maria Santos', 'CREATE', 'resources', 1, 'Added resource: Premium Rice'),
      (2, 'Jose Reyes', 'LOGIN', 'auth', NULL, 'User logged in successfully'),
      (1, 'Maria Santos', 'CREATE', 'payout_schedules', 1, 'Scheduled August 2026 Senior Citizen Payout');
  `);
  console.log('[DB] Audit logs seeded.');

  // ---- Seed Settings ----
  db.exec(`
    INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES
      ('barangay_name', 'Barangay 442', 'Official barangay name'),
      ('barangay_district', 'Sampaloc, Manila', 'District or city'),
      ('barangay_captain', 'Hon. Barangay Captain', 'Current barangay captain'),
      ('contact_number', '+63 2 8XXX-XXXX', 'Main contact number'),
      ('email', 'barangay442@gmail.com', 'Official email'),
      ('office_hours', 'Monday to Friday, 8:00 AM - 5:00 PM', 'Office hours'),
      ('system_name', 'MASID E-Services', 'System display name'),
      ('announcement_allow_public', '1', 'Show announcements on public site');
  `);
  console.log('[DB] Settings seeded.');

  console.log('[DB] Database seeding complete!');
}

module.exports = { getDb, initializeDatabase, seedDatabase };
