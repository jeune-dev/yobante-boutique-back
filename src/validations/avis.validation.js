const Joi = require('joi');

const avisSchema = Joi.object({
  produitId: Joi.number().integer().required(),
  note: Joi.number().integer().min(1).max(5).required(),
  commentaire: Joi.string().trim().max(1000).optional().allow('', null),
});

module.exports = { avisSchema };
