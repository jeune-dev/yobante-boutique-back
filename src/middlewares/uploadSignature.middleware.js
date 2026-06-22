const cloudinary = require('../config/cloudinary');

// Génère une signature Cloudinary pour les uploads directs depuis le frontend
const generateUploadSignature = (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder    = req.body.folder || 'yobante';

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET,
  );

  res.json({
    signature,
    timestamp,
    folder,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
};

module.exports = { generateUploadSignature };
