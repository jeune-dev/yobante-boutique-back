// ─────────────────────────────────────────────────────────────
// validations/commande.validation.js — Schémas Joi pour les commandes
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const passerCommandeSchema = Joi.object({
  adresseId: Joi.string().uuid().required(),
  methode: Joi.string().valid('wave', 'orange_money', 'carte', 'cash_livraison').required(),
  note: Joi.string().trim().max(500).allow('', null).optional(),
});

const rejeterCommandeSchema = Joi.object({
  raison: Joi.string().trim().max(500).required(),
});

module.exports = { passerCommandeSchema, rejeterCommandeSchema };
