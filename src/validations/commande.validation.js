// ─────────────────────────────────────────────────────────────
// validations/commande.validation.js — Schémas Joi pour les commandes
// ─────────────────────────────────────────────────────────────
const Joi = require('joi');

const passerCommandeSchema = Joi.object({
  adresseId: Joi.string().uuid().required(),
  methode: Joi.string().valid('wave', 'orange_money', 'carte', 'cash_livraison').required(),
  items: Joi.array()
    .items(
      Joi.object({
        produitId: Joi.string().uuid().required(),
        quantite: Joi.number().integer().min(1).required(),
      })
    )
    .optional(),
  // Date souhaitée par le client. Indicative, donc facultative.
  dateLivraisonSouhaitee: Joi.date().iso().allow(null).optional(),
  note: Joi.string().trim().max(500).allow('', null).optional(),
});

const rejeterCommandeSchema = Joi.object({
  raison: Joi.string().trim().max(500).required(),
});

module.exports = { passerCommandeSchema, rejeterCommandeSchema };
