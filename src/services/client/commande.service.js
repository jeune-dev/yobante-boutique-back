// ─────────────────────────────────────────────────────────────
// services/client/commande.service.js
// ─────────────────────────────────────────────────────────────

// TODO: passerCommande(userId, data)
//   - data : { adresseId, note }
//   - Récupérer le panier du client (lever erreur si vide)
//   - Vérifier le stock de chaque produit dans le panier
//   - Calculer montantTotal et fraisLivraison
//   - Créer la Commande avec statut 'en_attente'
//   - Créer les CommandeItems correspondants
//   - Décrémenter le stock de chaque produit
//   - Vider le panier du client
//   - Envoyer email de confirmation au client
//   - Retourner la commande créée avec ses items

// TODO: getMesCommandes(userId, pagination)
//   - Récupérer toutes les commandes du client connecté
//   - Include CommandeItems avec Produit
//   - Trier par date décroissante
//   - Retourner { rows, count, totalPages }

// TODO: getCommandeDetail(userId, commandeId)
//   - Récupérer la commande et vérifier qu'elle appartient à userId
//   - Include CommandeItems(Produit), Adresse, Paiement
//   - Lever une erreur 403 si la commande n'appartient pas au client
//   - Retourner la commande complète

// TODO: annulerCommande(userId, commandeId)
//   - Vérifier que la commande appartient au client
//   - Vérifier que le statut est 'en_attente' (seule annulation possible)
//   - Passer à 'annulee'
//   - Remettre le stock des produits
//   - Envoyer email d'annulation
//   - Retourner la commande mise à jour
