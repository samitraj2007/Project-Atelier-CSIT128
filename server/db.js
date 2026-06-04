const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "atelier",
  waitForConnections: true,
  connectionLimit: 10
});

async function ensureSchemaAndSeed() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS admins (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(80) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
  await pool.query(
    `CREATE TABLE IF NOT EXISTS artworks (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      artist_name VARCHAR(150) NOT NULL,
      artist_email VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      year_created YEAR NOT NULL,
      medium ENUM('Oil','Watercolour','Digital','Photography','Sculpture','Mixed Media','Other') NOT NULL,
      description VARCHAR(500) NULL,
      image_path VARCHAR(500) NOT NULL,
      status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      reviewed_at TIMESTAMP NULL,
      reviewed_by INT UNSIGNED NULL,
      CONSTRAINT fk_artworks_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL
    )`
  );
  await pool.query(
    `INSERT IGNORE INTO admins (username, password_hash)
     VALUES (?, ?)`,
    ["curator", "$2a$10$hl4KYQ7dLSM0P4TR8ME9f.A2gDsyF8Xx2UY8ailqXFz3vGN9VOG8m"]
  );
}

const dbReady = pool.getConnection()
  .then(async (connection) => {
    connection.release();
    await ensureSchemaAndSeed();
    console.log("MySQL connection ready and schema initialized.");
    return true;
  })
  .catch((error) => {
    console.error("MySQL connection error:", error.code, error.message);
    return false;
  });

module.exports = { pool, dbReady };
