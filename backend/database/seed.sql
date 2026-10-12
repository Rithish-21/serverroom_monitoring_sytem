-- ===================================================
-- Server Room Environment Monitoring System
-- Sample Seed Data
-- ===================================================

USE server_room_monitoring;

-- Clear previous data in order
DELETE FROM alerts;
DELETE FROM sensor_readings;
DELETE FROM sensors;
DELETE FROM racks;
DELETE FROM otp_codes;
DELETE FROM users;

-- 1. Insert Initial Users
-- Password for admin: AdminPassword123!
-- Password for user:  UserPassword123!
INSERT INTO users (id, full_name, email, phone, password_hash, role, is_email_verified, is_phone_verified, created_at)
VALUES 
  (1, 'System Administrator', 'admin@datacenter.io', '+12025550199', '$2a$10$ZBl1WBa.Ro7K/N83yK9m7eOJ4SkwK6Ne6/AIonD6Zm6debV98zRU2', 'admin', 1, 1, NOW()),
  (2, 'Operations Lead', 'user@datacenter.io', '+12025550188', '$2a$10$tLPUgbSzMx6p90dioZO2ouhPVPBCcTtDhFVMUauqXL3.iwmjNeMpi', 'user', 1, 1, NOW());

-- 2. Insert Server Racks (Layout positions for 3D digital twin)
INSERT INTO racks (id, name, position_x, position_y, position_z, created_at)
VALUES
  (1, 'Rack A-01 (Compute Alpha)', -3.0, 0.0, -2.5, NOW()),
  (2, 'Rack A-02 (Storage Vault)',  -3.0, 0.0,  2.5, NOW()),
  (3, 'Rack B-01 (Network Core)',   3.0, 0.0, -2.5, NOW()),
  (4, 'Rack B-02 (Database Edge)',  3.0, 0.0,  2.5, NOW());

-- 3. Insert Sensors
INSERT INTO sensors (id, rack_id, type, label, unit, warning_limit, critical_limit, created_at)
VALUES
  (1, 1, 'temperature', 'Rack A-01 Intake Temp', '°C', 27.0, 32.0, NOW()),
  (2, 1, 'humidity',    'Rack A-01 Relative Humidity', '%', 60.0, 75.0, NOW()),
  (3, 1, 'power',       'Rack A-01 PDU Power Draw', 'kW', 4.5, 5.5, NOW()),
  (4, 2, 'temperature', 'Rack A-02 Exhaust Temp', '°C', 29.0, 35.0, NOW()),
  (5, 3, 'temperature', 'Rack B-01 Core Switch Temp', '°C', 27.0, 33.0, NOW()),
  (6, 4, 'temperature', 'Rack B-02 Intake Temp', '°C', 27.0, 32.0, NOW()),
  (7, NULL, 'airflow',  'CRAC-01 Plenum Airflow', 'm/s', 1.8, 1.2, NOW()),
  (8, NULL, 'water_leak', 'Under-floor Leak Ribbon', 'status', 0.5, 0.9, NOW()),
  (9, NULL, 'smoke',    'Ceiling Optical Smoke Detector', 'status', 0.5, 0.9, NOW());

-- 4. Insert Initial Sensor Readings (Historical records for charts)
INSERT INTO sensor_readings (sensor_id, value, recorded_at) VALUES
  (1, 22.4, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  (1, 23.1, DATE_SUB(NOW(), INTERVAL 9 HOUR)),
  (1, 23.8, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (1, 24.2, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (1, 24.9, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  (1, 25.4, NOW()),
  (2, 45.2, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (2, 46.8, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (2, 47.1, NOW()),
  (3, 3.2, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (3, 3.4, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (3, 3.6, NOW()),
  (4, 26.5, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (4, 27.2, NOW()),
  (5, 23.8, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (5, 24.5, NOW()),
  (6, 22.9, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (6, 23.4, NOW()),
  (7, 3.2, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (7, 3.1, NOW()),
  (8, 0.0, NOW()),
  (9, 0.0, NOW());

-- 5. Insert Sample Alerts
INSERT INTO alerts (sensor_id, level, message, is_acknowledged, acknowledged_by, created_at)
VALUES
  (1, 'info', 'Environmental baseline calibration complete.', 1, 1, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  (4, 'warning', 'Rack A-02 Exhaust Temp reached 27.2°C approaching warning limit.', 0, NULL, DATE_SUB(NOW(), INTERVAL 25 MINUTE));
