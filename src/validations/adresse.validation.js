const Joi = require('joi');

const adresseSchema = Joi.object({
  nomComplet: Joi.string().trim().required(),
  telephone: Joi.string().trim().required(),
  rue: Joi.string().trim().required(),
  ville: Joi.string().trim().required(),
  region: Joi.string().trim().optional().allow('', null),
  pays: Joi.string().trim().optional().default('Sénégal'),
  codePostal: Joi.string().trim().optional().allow('', null),
  isDefault: Joi.boolean().optional().default(false),
});

const profilSchema = Joi.object({
  nom: Joi.string().trim().optional(),
  prenom: Joi.string().trim().optional(),
  telephone: Joi.string().trim().optional().allow('', null),
});

module.exports = { adresseSchema, profilSchema };
