// ─────────────────────────────────────────────────────────────
// controllers/client/produit.controller.js
// ─────────────────────────────────────────────────────────────
// const produitService = require('../../services/client/produit.service')

// TODO: getCatalogue(req, res, next)
//   - Extraire filtres et pagination depuis req.query
//   - Appeler produitService.getProduits(filters, pagination)
//   - Retourner 200 + { produits, totalPages, count }

// TODO: getOne(req, res, next)
//   - Appeler produitService.getProduitBySlug(req.params.slug)
//   - Retourner 200 + produit avec avis et note moyenne

// TODO: getFeatured(req, res, next)
//   - Appeler produitService.getProduitsFeatured()
//   - Retourner 200 + liste

// TODO: getByCategorie(req, res, next)
//   - Appeler produitService.getProduitsByCategorie(req.params.slug, pagination)
//   - Retourner 200 + { produits, totalPages, count }

// TODO: rechercher(req, res, next)
//   - Appeler produitService.rechercherProduits(req.query.q)
//   - Retourner 200 + liste
