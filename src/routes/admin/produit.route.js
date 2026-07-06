// ─────────────────────────────────────────────────────────────
// routes/admin/produit.route.js   — Préfixe : /api/admin/produits
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const ctrl = require('../../controllers/admin/produit.controller');
const adminMiddleware = require('../../middlewares/admin.middleware');
const upload = require('../../middlewares/upload.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createProduitSchema, updateProduitSchema, updateStockSchema } = require('../../validations/produit.validation');

const handleUpload = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux. Taille maximale : 5 MB.' });
    }
    return res.status(400).json({ message: err.message || 'Erreur lors du traitement du fichier' });
  });
};

router.get('/',                 adminMiddleware, ctrl.getAll);
router.post('/',                adminMiddleware, handleUpload, validate(createProduitSchema), ctrl.create);
router.get('/:id',              adminMiddleware, ctrl.getOne);
router.put('/:id',              adminMiddleware, handleUpload, validate(updateProduitSchema), ctrl.update);
router.delete('/:id',           adminMiddleware, ctrl.remove);
router.patch('/:id/stock',      adminMiddleware, validate(updateStockSchema), ctrl.updateStock);
router.patch('/:id/featured',   adminMiddleware, ctrl.toggleFeatured);
router.patch('/:id/visibilite', adminMiddleware, ctrl.toggleVisibilite);

module.exports = router;
