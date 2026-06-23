// ─────────────────────────────────────────────────────────────
// services/admin/dashboard.service.js
// ─────────────────────────────────────────────────────────────

// TODO: getStatsGlobales()
//   - Compter total clients (role='client')
//   - Compter total produits actifs
//   - Compter total commandes
//   - Calculer chiffre d'affaires total (somme montantTotal des commandes livrées)
//   - Retourner { totalClients, totalProduits, totalCommandes, chiffreAffaires }

// TODO: getCommandesParStatut()
//   - GROUP BY statut sur la table Commande
//   - Retourner [ { statut, count } ]

// TODO: getRevenusParMois(annee)
//   - Requête SQL/Sequelize : SUM(montantTotal) GROUP BY mois WHERE YEAR=annee
//   - Retourner tableau de 12 entrées { mois, revenus }

// TODO: getProduitsPlusVendus(limit=10)
//   - JOIN CommandeItem + Produit, SUM(quantite) GROUP BY produitId ORDER BY DESC
//   - Retourner [ { produit, totalVendu } ]

// TODO: getClientsActifs(limit=10)
//   - JOIN User + Commande, COUNT commandes GROUP BY userId ORDER BY DESC
//   - Retourner [ { user, nbCommandes } ]

// TODO: getCommandesRecentes(limit=10)
//   - Commandes ORDER BY createdAt DESC avec User et CommandeItems
//   - Retourner la liste

// TODO: getStockAlertes(seuil=5)
//   - Produits WHERE stock <= seuil AND isActive=true
//   - Retourner la liste des produits en alerte
