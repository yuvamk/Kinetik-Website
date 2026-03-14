const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Sub-folders by type
const getSubfolder = (fieldname) => {
  if (fieldname === 'coverImage') return 'projects';
  if (fieldname === 'logo') return 'partners';
  return 'misc';
};

// Disk storage — saves files locally
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = getSubfolder(file.fieldname);
    const dest = path.join(uploadDir, sub);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * Returns the public URL for a saved file.
 * Converts the absolute path to a URL like /uploads/projects/filename.jpg
 */
const getFileUrl = (req, filePath) => {
  const relative = path.relative(uploadDir, filePath).replace(/\\/g, '/');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${relative}`;
};

/**
 * Delete a local file by its public URL or path segment.
 */
const deleteLocalFile = (fileUrl) => {
  try {
    // Extract path segment after /uploads/
    const match = fileUrl.match(/\/uploads\/(.+)$/);
    if (!match) return;
    const filePath = path.join(uploadDir, match[1]);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('File delete error:', err.message);
  }
};

module.exports = { upload, getFileUrl, deleteLocalFile };
