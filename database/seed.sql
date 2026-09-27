-- ============================================================
-- MASID - Seed Data: Barangay 442, Sampaloc, Manila
-- ============================================================

USE masid_db;

-- ============================================================
-- USERS (password: Admin@123 hashed with bcrypt)
-- ============================================================
-- Note: Hash '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJaborBoHSmgb3HGl5JhCjCG' = 'Admin@123'
-- Note: Hash '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC02d5/3Ej3Ks4JHqxIC' = 'Staff@123'
-- Note: Hash '$2b$12$8e1gLJc4JQwBpJOFwJF.4.i0cWVl5F3F6l1d9t6Ye4oKoEa3Ro9l' = 'Resident@123'

INSERT INTO users (email, password_hash, first_name, last_name, role, status) VALUES
  ('admin@masid.gov.ph', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJaborBoHSmgb3HGl5JhCjCG', 'Maria', 'Santos', 'admin', 'active'),
  ('staff1@masid.gov.ph', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJaborBoHSmgb3HGl5JhCjCG', 'Jose', 'Reyes', 'staff', 'active'),
  ('staff2@masid.gov.ph', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJaborBoHSmgb3HGl5JhCjCG', 'Ana', 'Cruz', 'staff', 'active'),
  ('juan.delacruz@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJaborBoHSmgb3HGl5JhCjCG', 'Juan', 'Dela Cruz', 'resident', 'active'),
  ('maria.garcia@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJaborBoHSmgb3HGl5JhCjCG', 'Maria', 'Garcia', 'resident', 'active'),
  ('pedro.lim@gmail.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJaborBoHSmgb3HGl5JhCjCG', 'Pedro', 'Lim', 'resident', 'active');

-- ============================================================
-- RESIDENTS
-- ============================================================

INSERT INTO residents (user_id, first_name, last_name, middle_name, address, contact_number, birthdate, gender, civil_status) VALUES
  (4, 'Juan', 'Dela Cruz', 'Buenaventura', '123 Rizal Street, Barangay 442, Sampaloc, Manila', '09171234567', '1985-05-15', 'male', 'married'),
  (5, 'Maria', 'Garcia', 'Reyes', '456 Mabini Avenue, Barangay 442, Sampaloc, Manila', '09182345678', '1975-08-22', 'female', 'single'),
  (6, 'Pedro', 'Lim', 'Santos', '789 Bonifacio Street, Barangay 442, Sampaloc, Manila', '09193456789', '1958-03-10', 'male', 'married'),
  (NULL, 'Lucia', 'Fernandez', 'Aquino', '321 Quezon Street, Barangay 442, Sampaloc, Manila', '09204567890', '1950-12-05', 'female', 'widowed'),
  (NULL, 'Roberto', 'Mendoza', 'Cruz', '654 Luna Street, Barangay 442, Sampaloc, Manila', '09215678901', '1990-07-18', 'male', 'single'),
  (NULL, 'Rosario', 'Villanueva', 'Perez', '987 Del Pilar Street, Barangay 442, Sampaloc, Manila', '09226789012', '1965-02-28', 'female', 'married'),
  (NULL, 'Antonio', 'Bautista', 'Ramos', '147 Legarda Street, Barangay 442, Sampaloc, Manila', '09237890123', '1948-11-14', 'male', 'widowed'),
  (NULL, 'Elena', 'Castillo', 'Morales', '258 Espana Boulevard, Barangay 442, Sampaloc, Manila', '09248901234', '1980-04-03', 'female', 'married'),
  (NULL, 'Fernando', 'Torres', 'Jimenez', '369 P. Noval Street, Barangay 442, Sampaloc, Manila', '09259012345', '1995-09-25', 'male', 'single'),
  (NULL, 'Corazon', 'Ramos', 'Santiago', '741 Lacson Street, Barangay 442, Sampaloc, Manila', '09260123456', '1943-06-19', 'female', 'widowed');

-- ============================================================
-- BENEFICIARIES
-- ============================================================

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

-- ============================================================
-- PAYOUT PROGRAMS
-- ============================================================

INSERT INTO payout_programs (name, description, category, budget, amount_per_beneficiary, status, created_by) VALUES
  ('Ayuda sa Matatanda (Senior Citizen Financial Assistance)', 'Monthly financial assistance for senior citizens aged 60 and above residing in Barangay 442.', 'financial', 50000.00, 500.00, 'active', 1),
  ('4Ps Barangay Supplement', 'Additional barangay support for registered 4Ps households.', 'financial', 20000.00, 1000.00, 'active', 1),
  ('Tulong sa Nangangailangan (Indigent Assistance)', 'Emergency assistance for indigent families in the barangay.', 'financial', 30000.00, 750.00, 'active', 1),
  ('Pamigay ng Bigas at Pagkain', 'Distribution of rice and food packs to qualified beneficiaries.', 'food', 80000.00, NULL, 'active', 1),
  ('Solo Parent Assistance Program', 'Monthly assistance for registered solo parents in the barangay.', 'financial', 25000.00, 800.00, 'active', 2);

-- ============================================================
-- PAYOUT SCHEDULES
-- ============================================================

INSERT INTO payout_schedules (program_id, name, schedule_date, start_time, end_time, location, notes, status, is_public, created_by) VALUES
  (1, 'August 2026 Senior Citizen Payout', '2026-08-20', '08:00:00', '16:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Bring valid ID and senior citizen card', 'scheduled', 1, 1),
  (2, '4Ps August 2026 Supplement', '2026-08-22', '09:00:00', '15:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Bring 4Ps ID and barangay clearance', 'scheduled', 1, 1),
  (3, 'August Indigent Assistance Payout', '2026-08-25', '08:00:00', '12:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Priority for families with children', 'scheduled', 1, 1),
  (5, 'August Solo Parent Assistance', '2026-08-27', '09:00:00', '14:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Bring solo parent ID', 'scheduled', 1, 2),
  (1, 'July 2026 Senior Citizen Payout', '2026-07-20', '08:00:00', '16:00:00', 'Barangay 442 Hall, Sampaloc, Manila', 'Completed successfully', 'completed', 1, 1);

-- ============================================================
-- PAYOUT TRANSACTIONS
-- ============================================================

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

-- ============================================================
-- RESOURCES
-- ============================================================

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

-- ============================================================
-- RESOURCE DISTRIBUTIONS
-- ============================================================

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

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

INSERT INTO announcements (title, category, content, short_description, author_id, status, published_at) VALUES
  (
    'Barangay Clean-Up Drive - August 2026',
    'community',
    '<p>Ang Barangay 442 ay naglulunsad ng isang malaking <strong>Clean-Up Drive</strong> ngayong Agosto 2026!</p><p>Ang lahat ng mga residente ay tinatawagan na lumahok sa programang ito upang panatilihing malinis at maayos ang ating barangay.</p><h3>Mga Detalye:</h3><ul><li><strong>Petsa:</strong> Agosto 15, 2026</li><li><strong>Oras:</strong> 6:00 AM - 10:00 AM</li><li><strong>Lugar:</strong> Iba''t ibang sulok ng Barangay 442</li></ul><p>Dalhin ang inyong sariling cleaning materials. May magbibigay ng garbage bags ang barangay.</p>',
    'Residents are encouraged to participate in the upcoming community clean-up drive scheduled on August 15, 2026.',
    1,
    'published',
    '2026-08-01 08:00:00'
  ),
  (
    'Free Medical Mission - August 2026',
    'health',
    '<p>Ang Barangay 442 kasama ang <strong>Sampaloc Health Center</strong> ay naglulunsad ng <strong>Libreng Medical Mission</strong> para sa lahat ng mga residente.</p><h3>Mga Serbisyong Inaalok:</h3><ul><li>Blood pressure monitoring</li><li>Blood sugar testing</li><li>General check-up</li><li>Free medicines para sa mga nangangailangan</li><li>Dental check-up</li></ul><p>Dalhin ang inyong barangay ID o clearance.</p>',
    'Free medical and dental services for all Barangay 442 residents. Bring your barangay ID.',
    1,
    'published',
    '2026-08-05 09:00:00'
  ),
  (
    'Barangay Assembly - August 28, 2026',
    'community',
    '<p>Ang <strong>Ika-3 Quarter Barangay Assembly</strong> ay gaganapin sa Agosto 28, 2026. Ang lahat ng mga opisyal at residente ay inaanyayahang dumalo.</p><p>Tatalakayin ang mga sumusunod na paksa:</p><ul><li>Ulat sa paggastos ng barangay funds</li><li>Mga proyektong natapos at kasalukuyang isinasagawa</li><li>Pagtatanggap ng mga mungkahi mula sa mga residente</li><li>Iba pang mahalagang balita</li></ul>',
    'Attend the 3rd Quarter Barangay Assembly on August 28, 2026 at Barangay 442 Hall.',
    1,
    'published',
    '2026-08-08 07:00:00'
  ),
  (
    'Livelihood Training Program - Stitching and Embroidery',
    'livelihood',
    '<p>Ang barangay ay nag-aalok ng <strong>libreng livelihood training</strong> sa pananahi at bordado para sa mga interesadong residente.</p><p>Ang training ay tatagal ng 2 linggo at magbibigay ng sertipiko sa mga matagumpay na makakatatapos.</p><h3>Mga Kinakailangan:</h3><ul><li>Residente ng Barangay 442</li><li>Edad 18-60</li><li>May sariling gunting at medida</li></ul>',
    'Free 2-week livelihood training on stitching and embroidery for Barangay 442 residents aged 18-60.',
    2,
    'published',
    '2026-08-10 10:00:00'
  ),
  (
    'Emergency Protocol: Typhoon Preparedness Reminder',
    'emergency',
    '<p>Dahil sa paparating na bagyo, ang Barangay 442 ay nagpapaalalang maging handa ang lahat ng mga residente.</p><h3>Mga Dapat Gawin:</h3><ul><li>I-secure ang mga gamit at bahay</li><li>Maghanda ng emergency kit (tubig, pagkain, gamot)</li><li>Alamin ang pinakamalapit na evacuation center</li><li>Huwag lumabas sa malakas na hangin at ulan</li></ul>',
    'Typhoon preparedness reminder for all Barangay 442 residents. Be ready with emergency kits.',
    1,
    'published',
    '2026-08-11 06:00:00'
  );

-- ============================================================
-- EVENTS
-- ============================================================

INSERT INTO events (title, description, event_date, start_time, end_time, location, category, status, created_by) VALUES
  (
    'Barangay Assembly - 3rd Quarter 2026',
    'Quarterly barangay assembly open to all residents. Discuss community plans, budget, and receive updates from barangay officials. Q&A session included.',
    '2026-08-28',
    '09:00:00',
    '12:00:00',
    'Barangay 442 Hall, Sampaloc, Manila',
    'assembly',
    'published',
    1
  ),
  (
    'Libre Medical Mission',
    'Free medical services including general check-up, blood pressure monitoring, blood sugar testing, and medicine distribution for Barangay 442 residents.',
    '2026-08-18',
    '07:00:00',
    '17:00:00',
    'Barangay 442 Health Center, Sampaloc, Manila',
    'health',
    'published',
    1
  ),
  (
    'Community Clean-Up Drive',
    'Join us for the quarterly community clean-up drive. Cleaning materials and refreshments provided. Let us keep Barangay 442 clean and beautiful!',
    '2026-08-15',
    '06:00:00',
    '10:00:00',
    'Various locations in Barangay 442',
    'environmental',
    'published',
    2
  ),
  (
    'Youth Sports Festival 2026',
    'Annual sports event for the youth of Barangay 442. Events include basketball, volleyball, badminton, and track and field. Open to ages 12-25.',
    '2026-09-05',
    '08:00:00',
    '18:00:00',
    'Sampaloc Sports Complex',
    'sports',
    'published',
    2
  ),
  (
    'Senior Citizen Appreciation Day',
    'Special event honoring our beloved senior citizens. Includes free lunch, entertainment, health checks, and special gifts from the barangay.',
    '2026-09-15',
    '09:00:00',
    '15:00:00',
    'Barangay 442 Hall, Sampaloc, Manila',
    'senior',
    'published',
    1
  ),
  (
    'Livelihood Training: Stitching and Embroidery',
    '2-week livelihood training program for residents aged 18-60. Certificate of completion will be awarded. Slots are limited.',
    '2026-08-25',
    '08:00:00',
    '17:00:00',
    'Barangay 442 Multi-Purpose Hall',
    'livelihood',
    'published',
    2
  );

-- ============================================================
-- AUDIT LOGS
-- ============================================================

INSERT INTO audit_logs (user_id, user_name, action, module, record_id, details) VALUES
  (1, 'Maria Santos', 'CREATE', 'beneficiaries', 1, 'Created beneficiary BRY442-SC-001 for Pedro Lim'),
  (1, 'Maria Santos', 'CREATE', 'payout_programs', 1, 'Created payout program: Ayuda sa Matatanda'),
  (2, 'Jose Reyes', 'UPDATE', 'payout_transactions', 1, 'Updated transaction status to CLAIMED for beneficiary BRY442-SC-001'),
  (2, 'Jose Reyes', 'CREATE', 'resource_distributions', 1, 'Distributed 1 bag of rice to beneficiary BRY442-SC-001'),
  (1, 'Maria Santos', 'PUBLISH', 'announcements', 1, 'Published announcement: Barangay Clean-Up Drive'),
  (1, 'Maria Santos', 'PUBLISH', 'events', 1, 'Published event: Barangay Assembly - 3rd Quarter 2026'),
  (3, 'Ana Cruz', 'CREATE', 'resource_distributions', 5, 'Distributed 5 canned goods to beneficiary BRY442-4PS-001'),
  (1, 'Maria Santos', 'CREATE', 'resources', 1, 'Added resource: Premium Rice (500 bags)'),
  (2, 'Jose Reyes', 'LOGIN', 'auth', NULL, 'User logged in successfully'),
  (1, 'Maria Santos', 'CREATE', 'payout_schedules', 1, 'Scheduled August 2026 Senior Citizen Payout');
