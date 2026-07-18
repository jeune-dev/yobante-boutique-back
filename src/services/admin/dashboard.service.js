const { Op, fn, col, literal } = require('sequelize');
const {
  User,
  Produit,
  Commande,
  CommandeItem,
  ProfilVendeur,
  Categorie,
  Rayon,
  sequelize,
} = require('../../models');
const { ROLES } = require('../../constants');

class DashboardService {
  static async getStatsGlobales() {
    const [
      totalClients,
      totalVendeurs,
      totalCategories,
      totalProduits,
      totalCommandes,
      chiffreAffaires,
    ] = await Promise.all([
      User.count({ where: { role: ROLES.CLIENT } }),
      User.count({ where: { role: ROLES.VENDEUR } }),
      Rayon.count({ where: { isActive: true } }),
      Produit.count({ where: { isActive: true } }),
      Commande.count(),
      Commande.sum('montantTotal', { where: { statut: 'livree' } }),
    ]);

    return {
      success: true,
      totalClients,
      totalVendeurs,
      totalCategories,
      totalProduits,
      totalCommandes,
      chiffreAffaires: chiffreAffaires || 0,
    };
  }

  static async getCommandesParStatut() {
    const rows = await Commande.findAll({
      attributes: ['statut', [fn('COUNT', col('id')), 'count']],
      group: ['statut'],
      raw: true,
    });

    return {
      success: true,
      stats: rows.map((r) => ({ statut: r.statut, count: Number(r.count) })),
    };
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
          [Op.lt]: new Date(`${Number(annee) + 1}-01-01`),
        },
      },
      group: [literal('1')],
      raw: true,
    });

    const parMois = Array.from({ length: 12 }, (_, i) => ({ mois: i + 1, revenus: 0 }));
    rows.forEach((r) => {
      parMois[Number(r.mois) - 1].revenus = Number(r.revenus) || 0;
    });

    return { success: true, revenus: parMois };
  }

  /** Fix N+1 : JOIN direct CommandeItem → Produit dans une seule requête */
  static async getProduitsPlusVendus(limit = 10) {
    const rows = await CommandeItem.findAll({
      attributes: [
        'produitId',
        [fn('SUM', col('quantite')), 'totalVendu'],
        [col('produit.nom'), 'nomProduit'],
        [col('produit.slug'), 'slugProduit'],
        [col('produit.prix'), 'prixProduit'],
        [col('produit.images'), 'imagesProduit'],
      ],
      include: [
        {
          model: require('../../models').Produit,
          as: 'produit',
          attributes: [],
          required: true,
        },
      ],
      group: ['CommandeItem.produitId', 'produit.id'],
      order: [[literal('"totalVendu"'), 'DESC']],
      limit: parseInt(limit, 10),
      raw: true,
    });

    return {
      success: true,
      produits: rows.map((r) => ({
        produitId: r.produitId,
        nom: r.nomProduit,
        slug: r.slugProduit,
        prix: r.prixProduit,
        images: r.imagesProduit,
        totalVendu: Number(r.totalVendu),
      })),
    };
  }

  static async getClientsActifs(limit = 10) {
    const rows = await Commande.findAll({
      attributes: [
        'userId',
        [fn('COUNT', col('Commande.id')), 'nbCommandes'],
        [col('user.nom'), 'nom'],
        [col('user.prenom'), 'prenom'],
        [col('user.email'), 'email'],
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: [],
          required: true,
        },
      ],
      group: ['Commande.userId', 'user.id'],
      order: [[literal('"nbCommandes"'), 'DESC']],
      limit: parseInt(limit, 10),
      raw: true,
    });

    return {
      success: true,
      clients: rows.map((r) => ({
        userId: r.userId,
        nom: r.nom,
        prenom: r.prenom,
        email: r.email,
        nbCommandes: Number(r.nbCommandes),
      })),
    };
  }

  static async getCommandesRecentes(limit = 10) {
    const commandes = await Commande.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'email'] },
        { model: CommandeItem, as: 'items' },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
    });

    return { success: true, commandes };
  }

  static async getStockAlertes(seuil = 5) {
    const produits = await Produit.findAll({
      where: { stock: { [Op.lte]: seuil }, isActive: true },
      attributes: ['id', 'nom', 'slug', 'stock', 'stockAlloue', 'reference'],
      order: [['stock', 'ASC']],
    });

    return { success: true, produits };
  }

  /** KPI stocks : une seule requête SQL avec COUNTs conditionnels */
  static async getKpiStocks() {
    const [kpiRow, produitsRupture] = await Promise.all([
      sequelize.query(
        `
        SELECT
          COUNT(*) FILTER (WHERE "isActive" = true)                                   AS "totalProduits",
          COUNT(*) FILTER (WHERE "isActive" = true AND stock = 0)                     AS "enRupture",
          COUNT(*) FILTER (WHERE "isActive" = true AND stock > 0 AND stock <= 5)      AS "stockFaible",
          COUNT(*) FILTER (WHERE "isActive" = true AND stock > 5)                     AS "stockOk"
        FROM produits
      `,
        { type: sequelize.QueryTypes.SELECT }
      ),
      Produit.findAll({
        where: { stock: 0, isActive: true },
        attributes: ['id', 'nom', 'slug', 'stock', 'stockAlloue', 'reference'],
        order: [['updatedAt', 'DESC']],
        limit: 20,
      }),
    ]);

    const kpi = kpiRow[0];
    const total = Number(kpi.totalProduits);

    const produitsEnAttente = await Produit.count({
      where: { statutValidation: 'en_attente', isActive: true },
    });

    return {
      success: true,
      kpi: {
        totalProduits: total,
        produitsActifs: total,
        produitsEnRupture: Number(kpi.enRupture),
        produitsEnAttente,
        stockFaible: Number(kpi.stockFaible),
        stockOk: Number(kpi.stockOk),
        tauxRupture: total ? ((Number(kpi.enRupture) / total) * 100).toFixed(1) : 0,
      },
      produitsRupture,
    };
  }

  static async getStatsVendeurs() {
    const [totalVendeurs, vendeursActifs, enAttenteValidation, produitsSoumis] = await Promise.all([
      User.count({ where: { role: ROLES.VENDEUR } }),
      User.count({ where: { role: ROLES.VENDEUR, isActive: true } }),
      ProfilVendeur.count({ where: { isValidatedStep2: false } }),
      Produit.count({ where: { statutValidation: 'en_attente' } }),
    ]);

    return {
      success: true,
      stats: { totalVendeurs, vendeursActifs, enAttenteValidation, produitsSoumis },
    };
  }

  static async getKpiComplet() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      stats,
      commandesParStatut,
      revenusParMois,
      produitsPlusVendus,
      clientsActifs,
      commandesRecentes,
      kpiStocks,
      statsVendeurs,
      caJour,
      caSemaine,
      caMois,
      commandesEnAttente,
      promotionsActives,
    ] = await Promise.all([
      DashboardService.getStatsGlobales(),
      DashboardService.getCommandesParStatut(),
      DashboardService.getRevenusParMois(),
      DashboardService.getProduitsPlusVendus(10),
      DashboardService.getClientsActifs(5),
      DashboardService.getCommandesRecentes(10),
      DashboardService.getKpiStocks(),
      DashboardService.getStatsVendeurs(),
      Commande.sum('montantTotal', {
        where: { statut: 'livree', createdAt: { [Op.gte]: startOfDay } },
      }),
      Commande.sum('montantTotal', {
        where: { statut: 'livree', createdAt: { [Op.gte]: startOfWeek } },
      }),
      Commande.sum('montantTotal', {
        where: { statut: 'livree', createdAt: { [Op.gte]: startOfMonth } },
      }),
      Commande.count({ where: { statut: 'en_attente' } }),
      require('../../models').Promotion.count({ where: { isActive: true } }),
    ]);

    return {
      success: true,
      kpi: {
        ...stats,
        caJour: caJour || 0,
        caSemaine: caSemaine || 0,
        caMois: caMois || 0,
        commandesEnAttente,
        promotionsActives,
      },
      commandesParStatut: commandesParStatut.stats,
      revenusParMois: revenusParMois.revenus,
      produitsPlusVendus: produitsPlusVendus.produits,
      clientsActifs: clientsActifs.clients,
      commandesRecentes: commandesRecentes.commandes,
      kpiStocks: kpiStocks.kpi,
      produitsRupture: kpiStocks.produitsRupture,
      statsVendeurs: statsVendeurs.stats,
    };
  }
}

module.exports = DashboardService;
