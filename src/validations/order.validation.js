const { body } = require('express-validator');

const createOrderRules = [
  body('items').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('items.*.productId').isUUID().withMessage('ID produit invalide'),
  body('items.*.quantite').isInt({ min: 1 }).withMessage('Quantité doit être au moins 1'),
  body('adresseLivraison').notEmpty().withMessage('Adresse de livraison requise'),
  body('adresseLivraison.rue').notEmpty().withMessage('Rue requise'),
  body('adresseLivraison.ville').notEmpty().withMessage('Ville requise'),
  body('adresseLivraison.codePostal').notEmpty().withMessage('Code postal requis'),
  body('adresseLivraison.pays').notEmpty().withMessage('Pays requis'),
  body('notes').optional().trim(),
];

const updateStatutRules = [
  body('statut')
    .isIn(['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'])
    .withMessage('Statut invalide'),
];

module.exports = { createOrderRules, updateStatutRules };
