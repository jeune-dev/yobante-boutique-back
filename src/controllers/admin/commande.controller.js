// ─────────────────────────────────────────────────────────────
// controllers/admin/commande.controller.js
// ─────────────────────────────────────────────────────────────
// const commandeService = require('../../services/admin/commande.service')

// TODO: getAll(req, res, next)
//   - Extraire filtres et pagination depuis req.query
//   - Appeler commandeService.getAllCommandes(filters, pagination)
//   - Retourner 200 + { commandes, totalPages, count }

// TODO: getOne(req, res, next)
//   - Appeler commandeService.getCommandeById(req.params.id)
//   - Retourner 200 + commande complète

// TODO: valider(req, res, next)
//   - Appeler commandeService.validerCommande(req.params.id, req.body.noteAdmin)
//   - Retourner 200 + commande mise à jour

// TODO: rejeter(req, res, next)
//   - Appeler commandeService.rejeterCommande(req.params.id, req.body.raison)
//   - Retourner 200 + commande mise à jour

// TODO: mettreEnPreparation(req, res, next)
//   - Appeler commandeService.mettreEnPreparation(req.params.id)
//   - Retourner 200 + commande mise à jour

// TODO: marquerExpediee(req, res, next)
//   - Appeler commandeService.marquerExpediee(req.params.id, req.body.trackingInfo)
//   - Retourner 200 + commande mise à jour

// TODO: marquerLivree(req, res, next)
//   - Appeler commandeService.marquerLivree(req.params.id)
//   - Retourner 200 + commande mise à jour

// TODO: exportCommandes(req, res, next)
//   - Appeler commandeService.exportCommandes(req.query, req.query.format)
//   - Définir headers Content-Type et Content-Disposition
//   - Retourner le fichier
