const { Avis, Commande, CommandeItem } = require('../../models');

async function posterAvis(userId, data) {
  const achat = await CommandeItem.findOne({
    include: [{
      model: Commande,
      where: { userId, statut: 'livree' },
    }],
    where: { produitId: data.produitId },
  });

  if (!achat) {
    const error = new Error('Vous devez avoir acheté ce produit pour laisser un avis');
    error.status = 403;
    throw error;
  }

  const existing = await Avis.findOne({ where: { userId, produitId: data.produitId } });
  if (existing) {
    const error = new Error('Vous avez déjà laissé un avis sur ce produit');
    error.status = 409;
    throw error;
  }

  const avis = await Avis.create({
    userId,
    produitId: data.produitId,
    note: data.note,
    commentaire: data.commentaire || null,
    isApproved: false,
  });

  return avis;
}

async function getMesAvis(userId) {
  const avis = await Avis.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
  return avis;
}

async function supprimerAvis(userId, avisId) {
  const avis = await Avis.findOne({ where: { id: avisId, userId } });
  if (!avis) {
    const error = new Error('Avis introuvable');
    error.status = 404;
    throw error;
  }
  await avis.destroy();
  return { message: 'Avis supprimé' };
}

module.exports = { posterAvis, getMesAvis, supprimerAvis };
