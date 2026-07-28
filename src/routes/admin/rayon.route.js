'use strict';
const router = require('express').Router();
const ctrl = require('../../controllers/admin/rayon.controller');
// auth.middleware exporte une seule fonction, pas { authenticate, authorize }.
// adminMiddleware authentifie et exige le rôle ADMIN, comme toutes les autres
// routes de ce dossier.
const adminMiddleware = require('../../middlewares/admin.middleware');
// Le visuel du rayon arrive en pièce jointe, déjà recadré par le tableau de bord.
const upload = require('../../middlewares/upload.middleware');
router.use(adminMiddleware);
router.get('/', ctrl.lister);
router.post('/', upload.single('image'), ctrl.creer);

// Les chemins littéraux passent avant `/:id`, sinon Express fait correspondre
// `PUT /sous-rayons/<uuid>` à `PUT /:id` avec id = "sous-rayons".
router.put('/sous-rayons/:id', upload.single('image'), ctrl.modifierSousRayon);
router.patch('/sous-rayons/:id/archiver', ctrl.archiverSousRayon);

router.get('/:id', ctrl.getById);
router.put('/:id', upload.single('image'), ctrl.modifier);
router.patch('/:id/archiver', ctrl.archiver);
router.get('/:rayonId/sous-rayons', ctrl.listerSousRayons);
router.post('/:rayonId/sous-rayons', upload.single('image'), ctrl.creerSousRayon);
module.exports = router;
