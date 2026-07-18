// ─────────────────────────────────────────────────────────────
// routes/admin/blocPromo.route.js   — Préfixe : /api/v1/admin/blocs-promo
//
// Sous-sections des sections promotionnelles de l'accueil client.
// ─────────────────────────────────────────────────────────────
const router = require('express').Router();
const adminMiddleware = require('../../middlewares/admin.middleware');
const upload = require('../../middlewares/upload.middleware');
const ctrl = require('../../controllers/admin/blocPromo.controller');

router.use(adminMiddleware);

router.get('/', ctrl.getAll);
router.post('/', upload.single('image'), ctrl.creer);
router.post('/reordonner', ctrl.reordonner);

// Déclaré avant /:id pour que « section » ne soit pas pris pour un identifiant.
router.put('/section/:section', upload.single('image'), ctrl.updateBySection);

router.get('/:id', ctrl.getById);
router.put('/:id', upload.single('image'), ctrl.modifier);
router.delete('/:id', ctrl.supprimer);
router.patch('/:id/toggle', ctrl.toggleActive);

module.exports = router;
