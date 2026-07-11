const router = require('express').Router();
const ctrl = require('../../controllers/client/favori.controller');
const auth = require('../../middlewares/auth.middleware');
const checkActiveUser = require('../../middlewares/checkActiveUser.middleware');

// Favoris réservés à un utilisateur connecté.
router.use(auth, checkActiveUser);

router.get('/', ctrl.mesFavoris);
router.post('/', ctrl.ajouter);
router.delete('/:boutiqueId', ctrl.supprimer);

module.exports = router;
