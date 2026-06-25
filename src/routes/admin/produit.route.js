const router = require('express').Router();
const ctrl = require('../../controllers/admin/produit.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { admin } = require('../../middlewares/admin.middleware');
const { upload } = require('../../middlewares/upload.middleware');

router.get('/', auth, admin, ctrl.getAll);
router.post('/', auth, admin, upload.array('images', 5), ctrl.create);
router.post('/import', auth, admin, upload.single('file'), ctrl.importProduits);
router.get('/:id', auth, admin, ctrl.getOne);
router.put('/:id', auth, admin, upload.array('images', 5), ctrl.update);
router.delete('/:id', auth, admin, ctrl.remove);
router.patch('/:id/stock', auth, admin, ctrl.updateStock);
router.patch('/:id/featured', auth, admin, ctrl.toggleFeatured);
router.patch('/:id/visibilite', auth, admin, ctrl.toggleVisibilite);

module.exports = router
