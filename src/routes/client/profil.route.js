const router = require('express').Router();
const ctrl = require('../../controllers/client/profil.controller');
const { auth } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { upload } = require('../../middlewares/upload.middleware');
const { adresseSchema, profilSchema } = require('../../validations/adresse.validation');

router.get('/', auth, ctrl.get);
router.put('/', auth, validate(profilSchema), ctrl.update);
router.patch('/avatar', auth, upload.single('avatar'), ctrl.updateAvatar);
router.get('/adresses', auth, ctrl.getAdresses);
router.post('/adresses', auth, validate(adresseSchema), ctrl.ajouterAdresse);
router.put('/adresses/:id', auth, validate(adresseSchema), ctrl.updateAdresse);
router.delete('/adresses/:id', auth, ctrl.supprimerAdresse);
router.patch('/adresses/:id/default', auth, ctrl.setDefault);

module.exports = router;
