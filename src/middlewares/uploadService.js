// ─────────────────────────────────────────────────────────────
// middlewares/uploadService.js — Service d'upload Cloudinary
// ─────────────────────────────────────────────────────────────
const cloudinary = require('../config/cloudinary');

/**
 * Upload un buffer image (multer memoryStorage) vers Cloudinary.
 * @param {Buffer} buffer
 * @param {string} originalname
 * @param {string} [folder]
 * @returns {Promise<string>} URL sécurisée de l'image
 */
function uploadImage(buffer, originalname, folder = 'yobante') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
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

/**
 * Supprime une image Cloudinary à partir de son URL sécurisée.
 * @param {string} url
 */
async function deleteImage(url) {
  if (!url) return;
  const publicId = _extractPublicId(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadImage, deleteImage };
