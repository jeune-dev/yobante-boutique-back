// ─────────────────────────────────────────────────────────────
// controllers/admin/produit.controller.js
// ─────────────────────────────────────────────────────────────
// const produitService = require('../../services/admin/produit.service')

// TODO: create(req, res, next)
//   - Passer req.body et req.files à produitService.createProduit()
//   - Retourner 201 + produit créé

// TODO: getAll(req, res, next)
//   - Extraire filtres et pagination depuis req.query
//   - Appeler produitService.getAllProduits(filters, pagination)
//   - Retourner 200 + { produits, totalPages, count }

// TODO: getOne(req, res, next)
//   - Appeler produitService.getProduitById(req.params.id)
//   - Retourner 200 + produit

// TODO: update(req, res, next)
//   - Passer req.params.id, req.body, req.files à produitService.updateProduit()
//   - Retourner 200 + produit mis à jour

// TODO: remove(req, res, next)
//   - Appeler produitService.deleteProduit(req.params.id)
//   - Retourner 200 + message

// TODO: updateStock(req, res, next)
//   - Appeler produitService.updateStock(req.params.id, req.body.quantite)
//   - Retourner 200 + produit mis à jour

// TODO: toggleFeatured(req, res, next)
//   - Appeler produitService.toggleFeatured(req.params.id)
//   - Retourner 200 + produit mis à jour

// TODO: toggleVisibilite(req, res, next)
//   - Appeler produitService.toggleVisibilite(req.params.id)
//   - Retourner 200 + produit mis à jour

// TODO: importProduits(req, res, next)
//   - Passer req.file à produitService.importProduits()
//   - Retourner 200 + { created, errors }
