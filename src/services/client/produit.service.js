// ─────────────────────────────────────────────────────────────
// services/client/produit.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getProduits(filters, pagination)
//   - Uniquement les produits isActive=true
//   - Filtres : categorieId, prixMin, prixMax, search (nom/description), isFeatured
//   - Tri possible : prix asc/desc, date, popularité
//   - Retourner { rows, count, totalPages }

// TODO: getProduitBySlug(slug)
//   - Trouver le produit isActive=true par slug
//   - Include Categorie et Avis approuvés avec note moyenne
//   - Lever une erreur 404 si non trouvé

// TODO: getProduitsFeatured()
//   - Produits WHERE isFeatured=true AND isActive=true
//   - Limiter à 10 résultats
//   - Retourner la liste

// TODO: getProduitsByCategorie(slug, pagination)
//   - Trouver la catégorie par slug
//   - Récupérer ses produits actifs avec pagination
//   - Retourner { rows, count, totalPages }

// TODO: rechercherProduits(query)
//   - Recherche LIKE sur nom et description
//   - Uniquement produits actifs
//   - Retourner la liste avec pagination

// TODO: getProduitsRecommandes(produitId, limit=6)
//   - Trouver la catégorie du produit
//   - Retourner d'autres produits de la même catégorie (excluant le produit actuel)
//   - Retourner la liste
