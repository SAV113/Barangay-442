-- ============================================================
-- MASID - Integrated Barangay E-Services System
-- Database Schema: Barangay 442, Sampaloc, Manila
-- ============================================================

CREATE DATABASE IF NOT EXISTS masid_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE masid_db;

-- ============================================================
-- USERS & ROLES
-- ============================================================

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin','staff','resident') NOT NULL DEFAULT 'resident',
  status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  profile_photo VARCHAR(500) NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
);

-- ============================================================
-- RESIDENTS
-- ============================================================

CREATE TABLE residents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  address TEXT NOT NULL,
  contact_number VARCHAR(20) NULL,
  birthdate DATE NULL,
  gender ENUM('male','female','other') NULL,
  civil_status ENUM('single','married','widowed','separated') NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_residents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_residents_user_id (user_id),
  INDEX idx_residents_name (last_name, first_name)
);

-- ============================================================
-- BENEFICIARIES
-- ============================================================

CREATE TABLE beneficiaries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resident_id INT UNSIGNED NOT NULL,
  beneficiary_code VARCHAR(50) NOT NULL UNIQUE,
  category ENUM('senior_citizen','pwd','solo_parent','4ps','indigent','other') NOT NULL,
  status ENUM('active','inactive','archived') NOT NULL DEFAULT 'active',
  date_registered DATE NOT NULL,
  notes TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_beneficiaries_resident FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE RESTRICT,
  CONSTRAINT fk_beneficiaries_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_beneficiaries_resident (resident_id),
  INDEX idx_beneficiaries_category (category),
  INDEX idx_beneficiaries_status (status),
  INDEX idx_beneficiaries_code (beneficiary_code)
);

-- ============================================================
-- PAYOUT PROGRAMS
-- ============================================================

CREATE TABLE payout_programs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category ENUM('financial','food','medical','educational','livelihood','other') NOT NULL DEFAULT 'financial',
  budget DECIMAL(12,2) NULL,
  amount_per_beneficiary DECIMAL(10,2) NULL,
  status ENUM('active','completed','cancelled','draft') NOT NULL DEFAULT 'draft',
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payout_programs_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_payout_programs_status (status),
  INDEX idx_payout_programs_category (category)
);

-- ============================================================
-- PAYOUT SCHEDULES
-- ============================================================

CREATE TABLE payout_schedules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  status ENUM('scheduled','ongoing','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  is_public TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payout_schedules_program FOREIGN KEY (program_id) REFERENCES payout_programs(id) ON DELETE CASCADE,
  CONSTRAINT fk_payout_schedules_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_payout_schedules_date (schedule_date),
  INDEX idx_payout_schedules_status (status),
  INDEX idx_payout_schedules_public (is_public)
);

-- ============================================================
-- PAYOUT TRANSACTIONS
-- ============================================================

CREATE TABLE payout_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT UNSIGNED NOT NULL,
  beneficiary_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','claimed','unclaimed','cancelled') NOT NULL DEFAULT 'pending',
  claimed_at DATETIME NULL,
  notes TEXT NULL,
  recorded_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payout_transactions_schedule FOREIGN KEY (schedule_id) REFERENCES payout_schedules(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payout_transactions_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payout_transactions_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_schedule_beneficiary (schedule_id, beneficiary_id),
  INDEX idx_payout_transactions_status (status),
  INDEX idx_payout_transactions_beneficiary (beneficiary_id),
  INDEX idx_payout_transactions_schedule (schedule_id)
);

-- ============================================================
-- RESOURCES (INVENTORY)
-- ============================================================

CREATE TABLE resources (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('food','medicine','hygiene','clothing','equipment','other') NOT NULL DEFAULT 'other',
  quantity INT UNSIGNED NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
  low_stock_threshold INT UNSIGNED NOT NULL DEFAULT 10,
  date_added DATE NOT NULL,
  expiration_date DATE NULL,
  description TEXT NULL,
  status ENUM('available','low_stock','out_of_stock') NOT NULL DEFAULT 'available',
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resources_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_resources_category (category),
  INDEX idx_resources_status (status),
  INDEX idx_resources_expiration (expiration_date)
);

-- ============================================================
-- RESOURCE DISTRIBUTIONS
-- ============================================================

CREATE TABLE resource_distributions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resource_id INT UNSIGNED NOT NULL,
  beneficiary_id INT UNSIGNED NULL,
  recipient_name VARCHAR(255) NULL COMMENT 'For non-beneficiary recipients',
  quantity INT UNSIGNED NOT NULL,
  distribution_date DATE NOT NULL,
  purpose TEXT NULL,
  notes TEXT NULL,
  distributed_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_distributions_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
  CONSTRAINT fk_distributions_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE SET NULL,
  CONSTRAINT fk_distributions_distributed_by FOREIGN KEY (distributed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_distributions_resource (resource_id),
  INDEX idx_distributions_beneficiary (beneficiary_id),
  INDEX idx_distributions_date (distribution_date)
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

CREATE TABLE announcements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  category ENUM('health','community','emergency','livelihood','general','youth','senior','environmental') NOT NULL DEFAULT 'general',
  content LONGTEXT NOT NULL,
  short_description VARCHAR(500) NULL,
  image_url VARCHAR(500) NULL,
  author_id INT UNSIGNED NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_announcements_status (status),
  INDEX idx_announcements_category (category),
  INDEX idx_announcements_published_at (published_at)
);

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description LONGTEXT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NULL,
  location VARCHAR(255) NOT NULL,
  category ENUM('assembly','health','sports','youth','senior','livelihood','environmental','cultural','other') NOT NULL DEFAULT 'other',
  image_url VARCHAR(500) NULL,
  status ENUM('draft','published','cancelled','completed') NOT NULL DEFAULT 'draft',
  max_participants INT UNSIGNED NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_events_date (event_date),
  INDEX idx_events_status (status),
  INDEX idx_events_category (category)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info','success','warning','error','payout','resource','announcement','event') NOT NULL DEFAULT 'info',
  reference_type VARCHAR(50) NULL COMMENT 'e.g., payout, resource, event',
  reference_id INT UNSIGNED NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (is_read),
  INDEX idx_notifications_type (type)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  user_name VARCHAR(255) NULL COMMENT 'Snapshot of user name at time of action',
  action VARCHAR(100) NOT NULL COMMENT 'e.g., CREATE, UPDATE, DELETE, LOGIN, PUBLISH',
  module VARCHAR(100) NOT NULL COMMENT 'e.g., beneficiaries, payouts, resources',
  record_id INT UNSIGNED NULL,
  details TEXT NULL COMMENT 'JSON or description of changes',
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_logs_user (user_id),
  INDEX idx_audit_logs_module (module),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_logs_created_at (created_at)
);

-- ============================================================
-- SETTINGS
-- ============================================================

CREATE TABLE settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NULL,
  description VARCHAR(255) NULL,
  updated_by INT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- DEFAULT SETTINGS
-- ============================================================

INSERT INTO settings (setting_key, setting_value, description) VALUES
  ('barangay_name', 'Barangay 442', 'Official barangay name'),
  ('barangay_district', 'Sampaloc, Manila', 'District or city'),
  ('barangay_captain', 'Hon. [Barangay Captain Name]', 'Current barangay captain'),
  ('contact_number', '+63 2 8XXX-XXXX', 'Main contact number'),
  ('email', 'barangay442@gmail.com', 'Official email'),
  ('office_hours', 'Monday to Friday, 8:00 AM – 5:00 PM', 'Office hours'),
  ('system_name', 'MASID E-Services', 'System display name'),
  ('announcement_allow_public', '1', 'Show announcements on public site');
