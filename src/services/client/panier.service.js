// ─────────────────────────────────────────────────────────────
// services/client/panier.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getPanier(userId)
//   - Récupérer toutes les lignes Panier de l'user avec Produit (nom, prix, images, stock)
//   - Calculer le sous-total par ligne et le total général
//   - Retourner { items, sousTotal, fraisLivraison, total }

// TODO: ajouterAuPanier(userId, produitId, quantite)
//   - Vérifier que le produit existe et est actif
//   - Vérifier que le stock est suffisant
//   - Si le produit est déjà dans le panier : incrémenter la quantité
//   - Sinon : créer une nouvelle ligne Panier
//   - Retourner le panier mis à jour

// TODO: modifierQuantite(userId, produitId, quantite)
//   - Vérifier que la ligne Panier existe
//   - Vérifier que le stock est suffisant pour la nouvelle quantité
//   - Mettre à jour la quantité
//   - Si quantite=0 : supprimer la ligne
//   - Retourner le panier mis à jour

// TODO: retirerDuPanier(userId, produitId)
//   - Vérifier que la ligne Panier existe pour cet user
//   - Supprimer la ligne
//   - Retourner un message de succès

// TODO: viderPanier(userId)
//   - Supprimer toutes les lignes Panier de l'user
//   - Retourner un message de succès

// TODO: calculerTotal(userId)
//   - Récupérer le panier
//   - Calculer sousTotal, fraisLivraison (selon poids ou règle métier), total
//   - Retourner { sousTotal, fraisLivraison, total }
