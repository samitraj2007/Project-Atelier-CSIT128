const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDirectory = process.env.UPLOAD_DIR || "./public/uploads/artworks";
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 10);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDirectory),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, safeName);
  }
});

function fileFilter(_req, file, cb) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
    return;
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024
  }
});

module.exports = upload;
