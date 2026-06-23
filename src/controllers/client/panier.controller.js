// ─────────────────────────────────────────────────────────────
// controllers/client/panier.controller.js
// ─────────────────────────────────────────────────────────────
// const panierService = require('../../services/client/panier.service')

// TODO: getPanier(req, res, next)
//   - Appeler panierService.getPanier(req.user.id)
//   - Retourner 200 + { items, sousTotal, fraisLivraison, total }

// TODO: ajouter(req, res, next)
//   - Récupérer req.body (produitId, quantite)
//   - Appeler panierService.ajouterAuPanier(req.user.id, produitId, quantite)
//   - Retourner 200 + panier mis à jour

// TODO: modifier(req, res, next)
//   - Récupérer req.params.produitId et req.body.quantite
//   - Appeler panierService.modifierQuantite(req.user.id, produitId, quantite)
//   - Retourner 200 + panier mis à jour

// TODO: retirer(req, res, next)
//   - Appeler panierService.retirerDuPanier(req.user.id, req.params.produitId)
//   - Retourner 200 + message

// TODO: vider(req, res, next)
//   - Appeler panierService.viderPanier(req.user.id)
//   - Retourner 200 + message
