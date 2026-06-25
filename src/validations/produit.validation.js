const Joi = require('joi');

const createProduitSchema = Joi.object({
  nom: Joi.string().trim().required(),
  description: Joi.string().trim().optional().allow('', null),
  prix: Joi.number().min(0).required(),
  prixPromo: Joi.number().min(0).optional().allow(null),
  stock: Joi.number().integer().min(0).required(),
  categorieId: Joi.number().integer().required(),
  poids: Joi.number().min(0).optional().allow(null),
  reference: Joi.string().trim().optional().allow('', null),
});

const updateProduitSchema = Joi.object({
  nom: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow('', null),
  prix: Joi.number().min(0).optional(),
  prixPromo: Joi.number().min(0).optional().allow(null),
  stock: Joi.number().integer().min(0).optional(),
  categorieId: Joi.number().integer().optional(),
  poids: Joi.number().min(0).optional().allow(null),
  reference: Joi.string().trim().optional().allow('', null),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

const updateStockSchema = Joi.object({
  quantite: Joi.number().integer().min(0).required(),
});

const importProduitsSchema = Joi.object({
  file: Joi.any().required(),
});

module.exports = {
  createProduitSchema,
  updateProduitSchema,
  updateStockSchema,
  importProduitsSchema,
};
