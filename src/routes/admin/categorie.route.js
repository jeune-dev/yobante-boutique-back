// ─────────────────────────────────────────────────────────────
// routes/admin/categorie.route.js   — Préfixe : /api/admin/categories
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/admin/categorie.controller');
const adminMiddleware = require('../../middlewares/admin.middleware');
const upload = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');
const {
  createCategorieSchema,
  updateCategorieSchema,
} = require('../../validations/categorie.validation');

const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux. Taille maximale : 5 MB.' });
    }
    return res.status(400).json({ message: err.message || 'Erreur lors du traitement du fichier' });
  });
};

router.get('/', adminMiddleware, ctrl.getAll);
router.post('/', adminMiddleware, handleUpload, validate(createCategorieSchema), ctrl.create);
router.get('/:id', adminMiddleware, ctrl.getOne);
router.put('/:id', adminMiddleware, handleUpload, validate(updateCategorieSchema), ctrl.update);
router.delete('/:id', adminMiddleware, ctrl.remove);

module.exports = router;
