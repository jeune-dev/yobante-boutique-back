// ─────────────────────────────────────────────────────────────
// validations/panier.validation.js — Schémas Joi pour le panier
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const ajouterPanierSchema = Joi.object({
  produitId: Joi.string().uuid().required(),
  quantite: Joi.number().integer().min(1).max(99).default(1),
});

const modifierPanierSchema = Joi.object({
  quantite: Joi.number().integer().min(0).max(99).required(),
});

module.exports = { ajouterPanierSchema, modifierPanierSchema };
