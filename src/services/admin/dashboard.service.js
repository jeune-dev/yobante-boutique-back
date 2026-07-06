// ─────────────────────────────────────────────────────────────
// services/admin/dashboard.service.js
// ─────────────────────────────────────────────────────────────
const { Op, fn, col, literal } = require('sequelize');
const { User, Produit, Commande, CommandeItem } = require('../../models');

class DashboardService {

  static async getStatsGlobales() {
    const totalClients = await User.count({ where: { role: 'CLIENT' } });
    const totalProduits = await Produit.count({ where: { isActive: true } });
    const totalCommandes = await Commande.count();

    const chiffreAffaires = await Commande.sum('montantTotal', { where: { statut: 'livree' } }) || 0;

    return { success: true, totalClients, totalProduits, totalCommandes, chiffreAffaires };
  }

  static async getCommandesParStatut() {
    const rows = await Commande.findAll({
      attributes: ['statut', [fn('COUNT', col('id')), 'count']],
      group: ['statut'],
      raw: true,
    });

    return { success: true, stats: rows.map((r) => ({ statut: r.statut, count: Number(r.count) })) };
  }

  static async getRevenusParMois(annee = new Date().getFullYear()) {
    const rows = await Commande.findAll({
      attributes: [
        [fn('EXTRACT', literal('MONTH FROM "createdAt"')), 'mois'],
        [fn('SUM', col('montantTotal')), 'revenus'],
      ],
      where: {
        statut: 'livree',
        createdAt: {
          [Op.gte]: new Date(`${annee}-01-01`),
          [Op.lt]: new Date(`${annee + 1}-01-01`),
        },
      },
      group: [literal('1')],
      raw: true,
    });

    const parMois = Array.from({ length: 12 }, (_, i) => ({ mois: i + 1, revenus: 0 }));
    rows.forEach((r) => {
      const mois = Number(r.mois);
      parMois[mois - 1].revenus = Number(r.revenus) || 0;
    });

    return { success: true, revenus: parMois };
  }

  static async getProduitsPlusVendus(limit = 10) {
    const rows = await CommandeItem.findAll({
      attributes: ['produitId', [fn('SUM', col('quantite')), 'totalVendu']],
      group: ['produitId'],
      order: [[literal('"totalVendu"'), 'DESC']],
      limit,
      raw: true,
    });

    const produitIds = rows.map((r) => r.produitId);
    const produits = await Produit.findAll({ where: { id: produitIds } });
    const produitsById = Object.fromEntries(produits.map((p) => [p.id, p]));

    const resultat = rows.map((r) => ({
      produit: produitsById[r.produitId] || null,
      totalVendu: Number(r.totalVendu),
    }));

    return { success: true, produits: resultat };
  }

  static async getClientsActifs(limit = 10) {
    const rows = await Commande.findAll({
      attributes: ['userId', [fn('COUNT', col('id')), 'nbCommandes']],
      group: ['userId'],
      order: [[literal('"nbCommandes"'), 'DESC']],
      limit,
      raw: true,
    });

    const userIds = rows.map((r) => r.userId);
    const users = await User.findAll({ where: { id: userIds }, attributes: { exclude: ['password'] } });
    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));

    const resultat = rows.map((r) => ({
      user: usersById[r.userId] || null,
      nbCommandes: Number(r.nbCommandes),
    }));

    return { success: true, clients: resultat };
  }

  static async getCommandesRecentes(limit = 10) {
    const commandes = await Commande.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: CommandeItem, as: 'items' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    return { success: true, commandes };
  }

  static async getStockAlertes(seuil = 5) {
    const produits = await Produit.findAll({
      where: { stock: { [Op.lte]: seuil }, isActive: true },
      order: [['stock', 'ASC']],
    });

    return { success: true, produits };
  }
}

module.exports = DashboardService;
