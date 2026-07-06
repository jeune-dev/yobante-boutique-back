// ─────────────────────────────────────────────────────────────
// validations/profil.validation.js — Schémas Joi pour le profil client
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const updateProfilSchema = Joi.object({
  nom: Joi.string().trim().max(100).optional(),
  prenom: Joi.string().trim().max(100).optional(),
  telephone: Joi.string().trim().allow('', null).optional(),
}).min(1);

module.exports = { updateProfilSchema };
