-- ═══════════════════════════════════════════════════════════════════
-- Akshay ♥ Shraddha — database schema
--
-- YOU DO NOT NORMALLY NEED TO RUN THIS. The app creates every table
-- itself the first time it successfully talks to MySQL. This file is
-- here for two reasons: so you can see exactly what it will create,
-- and so you can build the tables by hand from phpMyAdmin if you'd
-- rather (Import → choose this file, or paste into the SQL tab).
--
-- Running it twice is safe — every statement is IF NOT EXISTS.
-- It creates no login: the admin account is seeded automatically the
-- first time you sign in at /admin with admin / admin123.
-- ═══════════════════════════════════════════════════════════════════

-- Who's coming, how many, and what they'll eat.
CREATE TABLE IF NOT EXISTS rsvps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  attending TINYINT(1) NOT NULL DEFAULT 1,
  vibe VARCHAR(24) DEFAULT NULL,
  guests INT NOT NULL DEFAULT 1,
  meal VARCHAR(60) DEFAULT NULL,
  note VARCHAR(200) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The wishes wall. `hidden` is set from the admin Blessings tab.
CREATE TABLE IF NOT EXISTS blessings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  who VARCHAR(60) DEFAULT NULL,
  message VARCHAR(220) NOT NULL,
  tint TINYINT NOT NULL DEFAULT 0,
  hidden TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visible (hidden, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin username + password hash, and the live-stream link.
-- Never stores a plain password: only a scrypt hash and its salt.
CREATE TABLE IF NOT EXISTS settings (
  k VARCHAR(64) PRIMARY KEY,
  v MEDIUMTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The running total of akshata thrown by guests joining from afar.
-- Exactly one row, id = 1.
CREATE TABLE IF NOT EXISTS ceremony (
  id TINYINT PRIMARY KEY,
  akshata BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO ceremony (id, akshata) VALUES (1, 0);

-- One row per person who joined the live muhurat: who they are and
-- how many grains they threw. Powers the admin Akshata registry.
CREATE TABLE IF NOT EXISTS ceremony_guests (
  device_id VARCHAR(48) PRIMARY KEY,
  name VARCHAR(80) DEFAULT NULL,
  akshata INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_akshata (akshata)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
