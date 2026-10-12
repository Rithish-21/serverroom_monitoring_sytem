-- ===================================================
-- Server Room Environment Monitoring System
-- Database Schema (MySQL 8+)
-- ===================================================

CREATE DATABASE IF NOT EXISTS server_room_monitoring
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE server_room_monitoring;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_email_verified TINYINT(1) NOT NULL DEFAULT 0,
  is_phone_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. OTP Codes Table (Hashed OTP storage with attempt tracking)
CREATE TABLE IF NOT EXISTS otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  channel ENUM('email', 'phone') NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_channel (user_id, channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Server Racks Table (3D layout coordinates)
CREATE TABLE IF NOT EXISTS racks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  position_z FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Sensors Table (Types: temperature, humidity, airflow, power, smoke, water_leak)
CREATE TABLE IF NOT EXISTS sensors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rack_id INT NULL,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  warning_limit FLOAT NOT NULL DEFAULT 27.0,
  critical_limit FLOAT NOT NULL DEFAULT 32.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rack_id) REFERENCES racks(id) ON DELETE SET NULL,
  INDEX idx_sensor_rack (rack_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sensor Readings Table (Time-series telemetry)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sensor_id INT NOT NULL,
  value FLOAT NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE,
  INDEX idx_sensor_time (sensor_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Alerts Table (Threshold & Trend alerts)
CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sensor_id INT NULL,
  level ENUM('warning', 'critical', 'info') NOT NULL DEFAULT 'warning',
  message TEXT NOT NULL,
  is_acknowledged TINYINT(1) NOT NULL DEFAULT 0,
  acknowledged_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE SET NULL,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_alert_status (is_acknowledged, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
