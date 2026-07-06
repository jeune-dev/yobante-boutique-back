// ─────────────────────────────────────────────────────────────
// validations/produit.validation.js — Schémas Joi pour les produits
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const createProduitSchema = Joi.object({
  nom: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().allow('', null).optional(),
  prix: Joi.number().min(0).required(),
  prixPromo: Joi.number().min(0).allow(null).optional(),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string().trim()).optional(),
  categorieId: Joi.string().uuid().required(),
  poids: Joi.number().min(0).allow(null).optional(),
  reference: Joi.string().trim().allow('', null).optional(),
  isFeatured: Joi.boolean().optional(),
});

const updateProduitSchema = Joi.object({
  nom: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  prix: Joi.number().min(0).optional(),
  prixPromo: Joi.number().min(0).allow(null).optional(),
  stock: Joi.number().integer().min(0).optional(),
  images: Joi.array().items(Joi.string().trim()).optional(),
  categorieId: Joi.string().uuid().optional(),
  poids: Joi.number().min(0).allow(null).optional(),
  reference: Joi.string().trim().allow('', null).optional(),
  isFeatured: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const updateStockSchema = Joi.object({
  quantite: Joi.number().integer().min(0).required(),
});

module.exports = { createProduitSchema, updateProduitSchema, updateStockSchema };
