// ─────────────────────────────────────────────────────────────
// validations/categorie.validation.js — Schémas Joi pour les catégories
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const createCategorieSchema = Joi.object({
  nom: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().allow('', null).optional(),
  image: Joi.string().trim().allow('', null).optional(),
  parentId: Joi.string().uuid().allow(null).optional(),
});

const updateCategorieSchema = Joi.object({
  nom: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  image: Joi.string().trim().allow('', null).optional(),
  parentId: Joi.string().uuid().allow(null).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

module.exports = { createCategorieSchema, updateCategorieSchema };
