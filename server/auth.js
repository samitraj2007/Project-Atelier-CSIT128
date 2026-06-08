// Authentication utilities: session validation and password verification
const bcrypt = require("bcryptjs");

// Middleware: enforce admin session before proceeding to route handler
function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ error: "Unauthorized. Admin login required." });
  }
  return next();
}

// Compare plaintext password against bcrypt hash; returns boolean
async function comparePassword(rawPassword, passwordHash) {
  return bcrypt.compare(rawPassword, passwordHash);
}

module.exports = {
  requireAdmin,
  comparePassword
};
