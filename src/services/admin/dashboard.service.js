const { User, Commande, Paiement, Produit, Avis, CommandeItem } = require('../../models');
const { sequelize } = require('../../models');
const { Op } = require('sequelize');

async function getOverview() {
  const totalUsers = await User.count();
  const totalCommandes = await Commande.count();
  const totalSalesResult = await Paiement.findAll({ where: { statut: 'succes' }, attributes: [[sequelize.fn('SUM', sequelize.col('montant')), 'total']] });
  const totalSales = totalSalesResult[0].get('total') || 0;
  const totalProduits = await Produit.count();
  const totalAvis = await Avis.count();

  return { totalUsers, totalCommandes, totalSales, totalProduits, totalAvis };
}

async function getRevenus() {
  // Revenus totaux par mois (Postgres DATE_TRUNC)
  const rows = await Paiement.findAll({
    where: { statut: 'succes' },
    attributes: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('payeAt')), 'month'], [sequelize.fn('SUM', sequelize.col('montant')), 'total']],
    group: ['month'],
    order: [[sequelize.literal('month'), 'ASC']],
  });
  return rows.map((r) => ({ month: r.get('month'), total: Number(r.get('total')) }));
}

async function getProduitsPlusVendus(limit = 10) {
  const rows = await sequelize.query(
    `SELECT p.id, p.nom, p.prix, p.images, SUM(ci.quantite) AS totalquantite
     FROM "CommandeItem" ci
     JOIN "Produit" p ON p.id = ci."produitId"
     GROUP BY p.id
     ORDER BY totalquantite DESC
     LIMIT :limit`,
    { replacements: { limit }, type: sequelize.QueryTypes.SELECT }
  );
  return rows.map((r) => ({
    produit: { id: r.id, nom: r.nom, prix: Number(r.prix), images: r.images },
    quantite: Number(r.totalquantite),
  }));
}

async function getStockAlertes(threshold = 5) {
  const rows = await Produit.findAll({ where: { stock: { [Op.lte]: threshold } }, order: [['stock', 'ASC']] });
  return rows;
}

module.exports = { getOverview, getRevenus, getProduitsPlusVendus, getStockAlertes };
