const { body } = require('express-validator');

const createProductRules = [
  body('nom').trim().notEmpty().withMessage('Nom du produit requis'),
  body('prix').isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('stock').isInt({ min: 0 }).withMessage('Stock invalide'),
  body('description').optional().trim(),
  body('categoryId').optional({ nullable: true }).isUUID().withMessage('Catégorie invalide'),
];

const updateProductRules = [
  body('nom').optional().trim().notEmpty().withMessage('Nom ne peut pas être vide'),
  body('prix').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock invalide'),
  body('description').optional().trim(),
  body('categoryId').optional({ nullable: true }).isUUID().withMessage('Catégorie invalide'),
];

module.exports = { createProductRules, updateProductRules };
