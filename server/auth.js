const bcrypt = require("bcryptjs");

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ error: "Unauthorized. Admin login required." });
  }
  return next();
}

async function comparePassword(rawPassword, passwordHash) {
  return bcrypt.compare(rawPassword, passwordHash);
}

module.exports = {
  requireAdmin,
  comparePassword
};
