const express = require("express");
const path = require("path");
const { pool } = require("./db");
const upload = require("./upload");
const { requireAdmin, comparePassword } = require("./auth");

const router = express.Router();
const mediumOptions = new Set(["Oil", "Watercolour", "Digital", "Photography", "Sculpture", "Mixed Media", "Other"]);

function toRelativeImagePath(absoluteFilePath) {
  const normalized = absoluteFilePath.replace(/\\/g, "/");
  const parts = normalized.split("/public/");
  if (parts.length < 2) {
    return `/uploads/artworks/${path.basename(absoluteFilePath)}`;
  }
  return `/${parts[1]}`;
}

function validateSubmission(body, file) {
  const errors = {};
  const currentYear = new Date().getFullYear();
  const year = Number(body.year_created);

  if (!body.artist_name || !body.artist_name.trim()) errors.artist_name = "Artist name is required.";
  if (!body.artist_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.artist_email)) {
    errors.artist_email = "A valid email is required.";
  }
  if (!body.title || !body.title.trim()) errors.title = "Artwork title is required.";
  if (!Number.isInteger(year) || year < 1000 || year > currentYear) {
    errors.year_created = "Enter a valid year.";
  }
  if (!body.medium || !mediumOptions.has(body.medium)) errors.medium = "Please select a valid medium.";
  if (!body.originality_confirmed || body.originality_confirmed !== "on") {
    errors.originality_confirmed = "You must confirm originality.";
  }
  if ((body.description || "").length > 500) errors.description = "Description must be 500 characters or less.";
  if (!file) errors.image = "Artwork image is required.";

  return errors;
}

router.get("/home-featured", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, artist_name, title, image_path, medium
       FROM artworks
       WHERE status = 'verified'
       ORDER BY reviewed_at DESC, id DESC
       LIMIT 4`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load featured artworks." });
  }
});

router.get("/museum", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, artist_name, title, year_created, medium, image_path
       FROM artworks
       WHERE status = 'verified'
       ORDER BY reviewed_at DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load museum artworks." });
  }
});

router.get("/artworks/:id", async (req, res) => {
  try {
    const artworkId = Number(req.params.id);
    if (!Number.isInteger(artworkId) || artworkId <= 0) {
      return res.status(400).json({ error: "Invalid artwork id." });
    }
    const [rows] = await pool.query(
      `SELECT id, artist_name, title, year_created, medium, description, image_path
       FROM artworks
       WHERE id = ? AND status = 'verified'
       LIMIT 1`,
      [artworkId]
    );
    if (!rows.length) return res.status(404).json({ error: "Artwork not found." });
    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: "Failed to load artwork details." });
  }
});

router.post("/submit-artwork", upload.single("image"), async (req, res) => {
  try {
    const errors = validateSubmission(req.body, req.file);
    if (Object.keys(errors).length) {
      return res.status(422).json({ errors });
    }

    const query = `INSERT INTO artworks
      (artist_name, artist_email, title, year_created, medium, description, image_path, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;
    const values = [
      req.body.artist_name.trim(),
      req.body.artist_email.trim(),
      req.body.title.trim(),
      Number(req.body.year_created),
      req.body.medium,
      (req.body.description || "").trim() || null,
      toRelativeImagePath(req.file.path)
    ];

    const [result] = await pool.query(query, values);
    return res.status(201).json({
      message: "Submission received and pending review.",
      submissionId: result.insertId
    });
  } catch (error) {
    if (error.message && error.message.includes("Only JPG, PNG, and WEBP")) {
      return res.status(422).json({ errors: { image: error.message } });
    }
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(422).json({ errors: { image: "Image must be 10MB or smaller." } });
    }
    return res.status(500).json({ error: "Failed to submit artwork." });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const password = req.body.password || "";
    if (!username || !password) {
      return res.status(422).json({ error: "Username and password are required." });
    }

    const [rows] = await pool.query("SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1", [username]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials." });

    const admin = rows[0];
    const matched = await comparePassword(password, admin.password_hash);
    if (!matched) return res.status(401).json({ error: "Invalid credentials." });

    req.session.admin = { id: admin.id, username: admin.username };
    return res.json({ message: "Login successful.", admin: req.session.admin });
  } catch (error) {
    console.error("Admin login error:", error?.code, error?.message);
    if (error?.code === "ER_ACCESS_DENIED_ERROR" || error?.code === "ECONNREFUSED" || error?.code === "ER_BAD_DB_ERROR") {
      return res.status(500).json({ error: "Database connection failed. Configure MySQL in .env and restart server." });
    }
    return res.status(500).json({ error: "Login failed." });
  }
});

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

router.get("/admin/pending", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, artist_name, artist_email, title, year_created, medium, description, image_path, submitted_at
       FROM artworks
       WHERE status = 'pending'
       ORDER BY submitted_at ASC, id ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load pending submissions." });
  }
});

router.post("/admin/verify/:id", requireAdmin, async (req, res) => {
  try {
    const artworkId = Number(req.params.id);
    const adminId = req.session.admin.id;
    const [result] = await pool.query(
      `UPDATE artworks
       SET status = 'verified', reviewed_at = NOW(), reviewed_by = ?
       WHERE id = ? AND status = 'pending'`,
      [adminId, artworkId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Pending submission not found." });
    return res.json({ message: "Artwork verified successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Verification failed." });
  }
});

router.post("/admin/reject/:id", requireAdmin, async (req, res) => {
  try {
    const artworkId = Number(req.params.id);
    const adminId = req.session.admin.id;
    const [result] = await pool.query(
      `UPDATE artworks
       SET status = 'rejected', reviewed_at = NOW(), reviewed_by = ?
       WHERE id = ? AND status = 'pending'`,
      [adminId, artworkId]
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Pending submission not found." });
    return res.json({ message: "Artwork rejected." });
  } catch (error) {
    return res.status(500).json({ error: "Rejection failed." });
  }
});

module.exports = router;
