const router = require('express').Router();
const ctrl = require('../../controllers/client/produit.controller');
const { rateLimit } = require('../../middlewares/rateLimit.middleware');

router.get('/', rateLimit, ctrl.getCatalogue);
router.get('/featured', rateLimit, ctrl.getFeatured);
router.get('/recherche', rateLimit, ctrl.rechercher);
router.get('/categories/:slug', rateLimit, ctrl.getByCategorie);
router.get('/:slug', rateLimit, ctrl.getOne);

module.exports = router;
