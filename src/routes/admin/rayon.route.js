'use strict';
const router = require('express').Router();
const ctrl = require('../../controllers/admin/rayon.controller');
// auth.middleware exporte une seule fonction, pas { authenticate, authorize }.
// adminMiddleware authentifie et exige le rôle ADMIN, comme toutes les autres
// routes de ce dossier.
const adminMiddleware = require('../../middlewares/admin.middleware');
router.use(adminMiddleware);
router.get('/', ctrl.lister);
router.post('/', ctrl.creer);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.modifier);
router.patch('/:id/archiver', ctrl.archiver);
router.get('/:rayonId/sous-rayons', ctrl.listerSousRayons);
router.post('/:rayonId/sous-rayons', ctrl.creerSousRayon);
router.put('/sous-rayons/:id', ctrl.modifierSousRayon);
router.patch('/sous-rayons/:id/archiver', ctrl.archiverSousRayon);
module.exports = router;
