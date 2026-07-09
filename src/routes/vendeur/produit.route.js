const router = require('express').Router();
const vendeurMiddleware = require('../../middlewares/vendeur.middleware');
const upload = require('../../middlewares/upload.middleware');
const ctrl = require('../../controllers/vendeur/produit.controller');

const handleUpload = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux. Taille maximale : 5 MB.' });
    }
    return res.status(400).json({ message: err.message || 'Erreur lors du traitement du fichier' });
  });
};

router.use(vendeurMiddleware);

router.get('/stats', ctrl.getStats);
router.get('/', ctrl.getMesProduits);
router.post('/', handleUpload, ctrl.soumettre);
router.get('/:id', ctrl.getOne);
router.put('/:id', handleUpload, ctrl.update);
router.patch('/:id/stock', ctrl.updateStock);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
