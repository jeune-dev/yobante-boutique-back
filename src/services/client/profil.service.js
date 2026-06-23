// ─────────────────────────────────────────────────────────────
// services/client/profil.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getProfil(userId)
//   - Récupérer l'user sans le champ password
//   - Retourner les infos du profil

// TODO: updateProfil(userId, data)
//   - data : { nom, prenom, telephone }
//   - Ne pas permettre la modification de email ou role ici
//   - Mettre à jour et retourner le profil sans password

// TODO: updateAvatar(userId, file)
//   - Uploader l'image sur Cloudinary
//   - Supprimer l'ancienne image si elle existe
//   - Mettre à jour le champ avatar de l'user
//   - Retourner l'URL du nouvel avatar

// TODO: getAdresses(userId)
//   - Récupérer toutes les adresses de l'user
//   - Retourner la liste (défaut en premier)

// TODO: ajouterAdresse(userId, data)
//   - Vérifier que l'user a moins de 5 adresses (limite recommandée)
//   - Si isDefault=true : désactiver l'ancienne adresse par défaut
//   - Créer la nouvelle adresse
//   - Retourner l'adresse créée

// TODO: updateAdresse(userId, adresseId, data)
//   - Vérifier que l'adresse appartient à userId
//   - Si isDefault=true : désactiver l'ancienne adresse par défaut
//   - Mettre à jour les champs fournis
//   - Retourner l'adresse mise à jour

// TODO: supprimerAdresse(userId, adresseId)
//   - Vérifier que l'adresse appartient à userId
//   - Supprimer l'adresse
//   - Retourner un message de succès

// TODO: setAdresseDefault(userId, adresseId)
//   - Désactiver toutes les adresses isDefault de l'user
//   - Mettre isDefault=true sur adresseId
//   - Retourner l'adresse mise à jour
