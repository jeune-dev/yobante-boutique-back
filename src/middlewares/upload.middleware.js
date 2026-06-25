// ─────────────────────────────────────────────────────────────
// middlewares/upload.middleware.js
// ─────────────────────────────────────────────────────────────

// TODO: importer multer
// TODO: importer file-type pour valider les vrais MIME types
// TODO: importer uploadConfig depuis ../config/security.js

// TODO: Configurer le stockage mémoire (multer.memoryStorage())
//   - Ne pas écrire sur le disque, les fichiers iront sur Cloudinary

// TODO: Filtre de fichiers (fileFilter)
//   - Lire les magic bytes du buffer pour obtenir le vrai type MIME
//   - Accepter uniquement : image/jpeg, image/png, image/webp
//   - Rejeter avec une erreur explicite sinon

// TODO: upload = multer({ storage, fileFilter, limits: { fileSize: uploadConfig.maxFileSize } })

// module.exports = { upload }
