const Joi = require('joi');

const passerCommandeSchema = Joi.object({
  adresseId: Joi.number().integer().required(),
  methodePaiement: Joi.string().valid('wave', 'orange_money', 'carte', 'cash_livraison').required(),
  note: Joi.string().max(500).optional().allow('', null),
});

const ajouterPanierSchema = Joi.object({
  produitId: Joi.number().integer().required(),
  quantite: Joi.number().integer().min(1).max(99).required(),
});

const modifierPanierSchema = Joi.object({
  quantite: Joi.number().integer().min(0).max(99).required(),
});

const rejeterCommandeSchema = Joi.object({
  raison: Joi.string().max(500).required(),
});

module.exports = {
  passerCommandeSchema,
  ajouterPanierSchema,
  modifierPanierSchema,
  rejeterCommandeSchema,
};
