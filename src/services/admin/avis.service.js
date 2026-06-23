// ─────────────────────────────────────────────────────────────
// services/admin/avis.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getAllAvis(filters)
//   - Filtres : isApproved, produitId, userId
//   - Include User et Produit
//   - Retourner la liste des avis

// TODO: approuverAvis(id)
//   - Vérifier que l'avis existe
//   - Mettre isApproved=true
//   - Retourner l'avis mis à jour

// TODO: rejeterAvis(id)
//   - Vérifier que l'avis existe
//   - Supprimer l'avis de la base
//   - Retourner un message de succès

// TODO: getAvisByProduit(produitId)
//   - Récupérer tous les avis approuvés d'un produit
//   - Include User (nom, avatar)
//   - Calculer la note moyenne
//   - Retourner { avis, noteMoyenne }
