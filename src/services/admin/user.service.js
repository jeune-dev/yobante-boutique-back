// ─────────────────────────────────────────────────────────────
// services/admin/user.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getAllUsers(filters, pagination)
//   - Filtres possibles : nom, email, isActive, isVerified
//   - Pagination : page, limit (utiliser l'utilitaire paginate.js)
//   - Exclure les admins (role != 'admin')
//   - Retourner { rows, count, totalPages }

// TODO: getUserById(id)
//   - Trouver l'user avec ses commandes (include Commande)
//   - Lever une erreur 404 si non trouvé
//   - Retourner l'user sans le champ password

// TODO: bloquerUser(id, raison)
//   - Vérifier que l'user existe et n'est pas admin
//   - Mettre isActive=false
//   - Envoyer email de notification au client (optionnel)
//   - Retourner l'user mis à jour

// TODO: activerUser(id)
//   - Vérifier que l'user existe
//   - Mettre isActive=true
//   - Retourner l'user mis à jour

// TODO: deleteUser(id)
//   - Vérifier que l'user existe et n'est pas admin
//   - Suppression soft : anonymiser les données personnelles
//   - Retourner un message de succès

// TODO: exportUsers(format='csv')
//   - Récupérer tous les clients
//   - Générer un fichier CSV ou Excel
//   - Retourner le buffer du fichier
