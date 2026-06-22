const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, folder = 'yobante') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

const deleteFromCloudinary = (publicId) => cloudinary.uploader.destroy(publicId);

module.exports = { uploadToCloudinary, deleteFromCloudinary };
