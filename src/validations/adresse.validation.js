// ─────────────────────────────────────────────────────────────
// validations/adresse.validation.js — Schémas Joi pour les adresses
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const adresseSchema = Joi.object({
  nomComplet: Joi.string().trim().max(100).required(),
  telephone: Joi.string().trim().required(),
  rue: Joi.string().trim().required(),
  ville: Joi.string().trim().required(),
  region: Joi.string().trim().allow('', null).optional(),
  pays: Joi.string().trim().default('Sénégal'),
  codePostal: Joi.string().trim().allow('', null).optional(),
  isDefault: Joi.boolean().default(false),
});

const updateAdresseSchema = adresseSchema
  .fork(['nomComplet', 'telephone', 'rue', 'ville', 'pays'], (schema) => schema.optional())
  .min(1);

module.exports = { adresseSchema, updateAdresseSchema };
