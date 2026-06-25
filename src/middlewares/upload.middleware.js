const multer = require('multer');
const { uploadConfig } = require('../config/security');
const { error } = require('../utils/formatResponse');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Type de fichier non autorisé. Seules les images JPEG, PNG et WEBP sont acceptées.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: uploadConfig.maxFileSize },
});

module.exports = { upload };
