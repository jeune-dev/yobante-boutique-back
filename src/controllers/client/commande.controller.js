// ─────────────────────────────────────────────────────────────
// controllers/client/commande.controller.js
// ─────────────────────────────────────────────────────────────
// const commandeService = require('../../services/client/commande.service')

// TODO: passer(req, res, next)
//   - Récupérer req.body (adresseId, note)
//   - Appeler commandeService.passerCommande(req.user.id, data)
//   - Retourner 201 + commande créée

// TODO: getMes(req, res, next)
//   - Extraire pagination depuis req.query
//   - Appeler commandeService.getMesCommandes(req.user.id, pagination)
//   - Retourner 200 + { commandes, totalPages, count }

// TODO: getOne(req, res, next)
//   - Appeler commandeService.getCommandeDetail(req.user.id, req.params.id)
//   - Retourner 200 + commande complète

// TODO: annuler(req, res, next)
//   - Appeler commandeService.annulerCommande(req.user.id, req.params.id)
//   - Retourner 200 + commande mise à jour
