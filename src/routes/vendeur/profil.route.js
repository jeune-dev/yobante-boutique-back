const router = require('express').Router();
const vendeurMiddleware = require('../../middlewares/vendeur.middleware');
const upload = require('../../middlewares/upload.middleware');
const ctrl = require('../../controllers/vendeur/profil.controller');

router.use(vendeurMiddleware);

router.get('/', ctrl.getProfil);
router.put('/', ctrl.updateProfil);
router.put('/logo', upload.single('logo'), ctrl.updateLogo);

module.exports = router;
