// ─────────────────────────────────────────────────────────────
// validations/admin.validation.js — Schémas Joi pour la gestion des admins
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const creerAdminSchema = Joi.object({
  nom: Joi.string().trim().max(100).required(),
  prenom: Joi.string().trim().max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
    .required()
    .messages({
      'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule et un chiffre',
    }),
  telephone: Joi.string().trim().optional().allow('', null),
});

const modifierAdminSchema = Joi.object({
  nom: Joi.string().trim().max(100).optional(),
  prenom: Joi.string().trim().max(100).optional(),
  telephone: Joi.string().trim().optional().allow('', null),
}).min(1);

module.exports = { creerAdminSchema, modifierAdminSchema };
