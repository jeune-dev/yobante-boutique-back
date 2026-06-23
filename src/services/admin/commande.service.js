// ─────────────────────────────────────────────────────────────
// services/admin/commande.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getAllCommandes(filters, pagination)
//   - Filtres : statut, userId, dateDebut, dateFin, reference
//   - Include User et CommandeItems avec Produit
//   - Pagination avec paginate.js
//   - Retourner { rows, count, totalPages }

// TODO: getCommandeById(id)
//   - Include User, Adresse, CommandeItem(+Produit), Paiement
//   - Lever une erreur 404 si non trouvée

// TODO: validerCommande(id, noteAdmin)
//   - Vérifier que la commande est en statut 'en_attente'
//   - Passer à 'validee', sauvegarder noteAdmin si fournie
//   - Envoyer email de confirmation au client
//   - Retourner la commande mise à jour

// TODO: rejeterCommande(id, raison)
//   - Vérifier que la commande n'est pas déjà livrée ou annulée
//   - Passer à 'annulee', sauvegarder la raison dans noteAdmin
//   - Remettre le stock des produits commandés
//   - Envoyer email d'annulation au client
//   - Retourner la commande mise à jour

// TODO: mettreEnPreparation(id)
//   - Vérifier statut = 'validee'
//   - Passer à 'en_preparation'
//   - Notifier le client
//   - Retourner la commande mise à jour

// TODO: marquerExpediee(id, trackingInfo)
//   - Vérifier statut = 'en_preparation'
//   - Passer à 'expediee', enregistrer les infos de suivi dans noteAdmin
//   - Envoyer email avec infos de suivi au client
//   - Retourner la commande mise à jour

// TODO: marquerLivree(id)
//   - Vérifier statut = 'expediee'
//   - Passer à 'livree'
//   - Retourner la commande mise à jour

// TODO: getCommandesParClient(userId)
//   - Trouver toutes les commandes d'un client
//   - Retourner la liste avec items

// TODO: exportCommandes(filters, format='csv')
//   - Appliquer les filtres
//   - Générer CSV/Excel
//   - Retourner le buffer du fichier
