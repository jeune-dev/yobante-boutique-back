const { body } = require('express-validator');

const createCategoryRules = [
  body('nom').trim().notEmpty().withMessage('Nom de catégorie requis'),
  body('description').optional().trim(),
  body('parentId').optional().isUUID().withMessage('parentId doit être un UUID valide'),
];

const updateCategoryRules = [
  body('nom').optional().trim().notEmpty().withMessage('Nom ne peut pas être vide'),
  body('description').optional().trim(),
  body('parentId').optional({ nullable: true }).isUUID().withMessage('parentId doit être un UUID valide'),
];

module.exports = { createCategoryRules, updateCategoryRules };
