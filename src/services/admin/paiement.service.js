// ─────────────────────────────────────────────────────────────
// services/admin/paiement.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getAllPaiements(filters, pagination)
//   - Filtres : statut, methode, userId, dateDebut, dateFin
//   - Include User et Commande
//   - Retourner { rows, count, totalPages }

// TODO: getPaiementById(id)
//   - Include Commande et User
//   - Lever une erreur 404 si non trouvé

// TODO: getPaiementByCommande(commandeId)
//   - Trouver le paiement lié à une commande
//   - Lever une erreur 404 si non trouvé

// TODO: rembourserPaiement(id, raison)
//   - Vérifier que le paiement est en statut 'succes'
//   - Appeler l'API de l'opérateur de paiement pour le remboursement
//   - Mettre le statut à 'rembourse'
//   - Envoyer email de confirmation de remboursement au client
//   - Retourner le paiement mis à jour

// TODO: getRevenusTotal(periode)
//   - periode : { dateDebut, dateFin }
//   - SUM(montant) des paiements en statut 'succes' sur la période
//   - Retourner { total, nbTransactions }
