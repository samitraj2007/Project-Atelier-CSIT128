// File upload middleware: configure multer for image persistence with validation
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Ensure upload directory exists; create recursively if missing
const uploadDirectory = process.env.UPLOAD_DIR || "./public/uploads/artworks";
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 10);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Whitelist image MIME types to prevent malicious file uploads
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

// Configure multer storage: disk persistence with timestamped filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirectory),
  // Generate unique filename: timestamp + random ID + original extension
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  }
});

// Reject files with unsupported MIME types before disk storage
function fileFilter(_req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
    return;
  }
  cb(null, true);
}

// Create multer instance with filesize limit and MIME validation
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024 // Convert MB to bytes
  }
});

module.exports = upload;
