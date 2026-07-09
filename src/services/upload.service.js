// ─────────────────────────────────────────────────────────────
// services/upload.service.js — Gestion uploads Cloudinary
// ─────────────────────────────────────────────────────────────
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

function uploadImage(buffer, originalname, folder = 'yobante') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          logger.error('[upload] Échec upload Cloudinary', {
            originalname,
            folder,
            error: error.message,
          });
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

function _extractPublicId(url) {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

async function deleteImage(url) {
  if (!url) return;
  const publicId = _extractPublicId(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn('[upload] Échec suppression Cloudinary', { url, error: err.message });
  }
}

module.exports = { uploadImage, deleteImage };
