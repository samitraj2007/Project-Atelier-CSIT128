-- Initialize ATELIER database schema for artwork curation platform
CREATE DATABASE IF NOT EXISTS atelier;
USE atelier;

-- Admins table: stores curator login credentials with timestamps
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE, -- Login identifier; enforced unique
  password_hash VARCHAR(255) NOT NULL, -- Bcrypt hash of password (never store plaintext)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Account creation timestamp
);

-- Artworks table: submissions with review workflow and audit trail
CREATE TABLE IF NOT EXISTS artworks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  artist_name VARCHAR(150) NOT NULL, -- Artist credit name
  artist_email VARCHAR(255) NOT NULL, -- Contact for submission status
  title VARCHAR(255) NOT NULL, -- Artwork title
  year_created YEAR NOT NULL, -- Year of creation (4-digit year)
  medium ENUM('Oil','Watercolour','Digital','Photography','Sculpture','Mixed Media','Other') NOT NULL,
  description VARCHAR(500) NULL, -- Optional artist statement
  image_path VARCHAR(500) NOT NULL, -- Relative path to image asset
  status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending', -- Review workflow state
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Submission timestamp
  reviewed_at TIMESTAMP NULL, -- Timestamp when curator reviewed; NULL if pending
  reviewed_by INT UNSIGNED NULL, -- Admin ID who reviewed; references admins(id)
  CONSTRAINT fk_artworks_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL -- Preserve audit trail if admin deleted
);

-- Seed one admin account for local testing.
-- Password for this hash: atelier@admin14
INSERT IGNORE INTO admins (username, password_hash)
VALUES ('curator', '$2a$10$hl4KYQ7dLSM0P4TR8ME9f.A2gDsyF8Xx2UY8ailqXFz3vGN9VOG8m');
