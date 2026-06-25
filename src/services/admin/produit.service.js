// ─────────────────────────────────────────────────────────────
// services/admin/produit.service.js
// ─────────────────────────────────────────────────────────────

// TODO: createProduit(data, files)
//   - Valider que la catégorie existe
//   - Générer un slug unique depuis le nom
//   - Uploader les images sur Cloudinary, récupérer les URLs
//   - Créer le produit en base
//   - Retourner le produit créé

// TODO: updateProduit(id, data, files)
//   - Vérifier que le produit existe
//   - Si nouvelles images : uploader sur Cloudinary, supprimer les anciennes
//   - Mettre à jour les champs fournis
//   - Retourner le produit mis à jour

// TODO: deleteProduit(id)
//   - Vérifier que le produit existe
//   - Suppression soft : isActive=false
//   - Retourner un message de succès

// TODO: getProduitById(id)
//   - Trouver le produit avec sa catégorie
//   - Lever une erreur 404 si non trouvé

// TODO: getAllProduits(filters, pagination)
//   - Filtres : categorieId, isActive, isFeatured, prixMin, prixMax, search
//   - Pagination avec paginate.js
//   - Retourner { rows, count, totalPages }

// TODO: updateStock(id, quantite)
//   - Vérifier que le produit existe
//   - Mettre à jour le stock (valeur absolue, pas un incrément)
//   - Retourner le produit mis à jour

// TODO: toggleFeatured(id)
//   - Inverser la valeur de isFeatured
//   - Retourner le produit mis à jour

// TODO: toggleVisibilite(id)
//   - Inverser la valeur de isActive
//   - Retourner le produit mis à jour

// TODO: importProduits(file)
//   - Parser le fichier CSV/Excel
//   - Valider chaque ligne (nom, prix, stock, categorieId requis)
//   - Créer les produits valides en masse (bulkCreate)
//   - Retourner { created, errors }
