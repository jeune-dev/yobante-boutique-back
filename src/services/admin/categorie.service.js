// ─────────────────────────────────────────────────────────────
// services/admin/categorie.service.js
// ─────────────────────────────────────────────────────────────

// TODO: createCategorie(data)
//   - Générer un slug unique depuis le nom
//   - Si parentId fourni, vérifier que la catégorie parente existe
//   - Créer la catégorie en base
//   - Retourner la catégorie créée

// TODO: updateCategorie(id, data)
//   - Vérifier que la catégorie existe
//   - Si le nom change, regénérer le slug
//   - Mettre à jour les champs fournis
//   - Retourner la catégorie mise à jour

// TODO: deleteCategorie(id)
//   - Vérifier que la catégorie existe
//   - Vérifier qu'aucun produit actif n'utilise cette catégorie
//   - Si des sous-catégories existent, les désactiver ou les remonter
//   - Supprimer ou désactiver la catégorie

// TODO: getAllCategories()
//   - Récupérer toutes les catégories avec leurs sous-catégories (include self-join)
//   - Retourner l'arbre de catégories

// TODO: getCategorieById(id)
//   - Trouver la catégorie avec ses produits actifs
//   - Lever une erreur 404 si non trouvée

// TODO: reorderCategories(order)
//   - order : tableau [ { id, position } ]
//   - Mettre à jour la position de chaque catégorie
//   - Retourner un message de succès
