// ─────────────────────────────────────────────────────────────
// utils/avisHelper.js — Helper partagé pour la note moyenne
// Utilisé par admin/avis.service et client/avis.service
// ─────────────────────────────────────────────────────────────
const { fn, col } = require('sequelize');

async function recalculerNoteMoyenne(produitId) {
  const { Avis, Produit } = require('../models');
  const result = await Avis.findAll({
    where: { produitId, isApproved: true },
    attributes: [
      [fn('AVG', col('note')), 'moyenne'],
      [fn('COUNT', col('id')), 'nombre'],
    ],
    raw: true,
  });
  const moyenne = Math.round(parseFloat(result[0]?.moyenne || 0) * 100) / 100;
  const nombre = parseInt(result[0]?.nombre || 0, 10);
  await Produit.update({ noteMoyenne: moyenne, nombreAvis: nombre }, { where: { id: produitId } });
}

module.exports = { recalculerNoteMoyenne };
