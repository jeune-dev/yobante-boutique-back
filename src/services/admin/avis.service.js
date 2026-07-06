// ─────────────────────────────────────────────────────────────
// services/admin/avis.service.js
// ─────────────────────────────────────────────────────────────
const { Avis, User, Produit } = require('../../models');

class GestionAvisService {

  static async getAllAvis({ isApproved, produitId, userId } = {}) {
    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved === 'true' || isApproved === true;
    if (produitId) where.produitId = produitId;
    if (userId) where.userId = userId;

    const avis = await Avis.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'avatar'] },
        { model: Produit, as: 'produit', attributes: ['id', 'nom', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return { success: true, avis };
  }

  static async approuverAvis(id) {
    const avis = await Avis.findByPk(id);
    if (!avis) {
      return { success: false, message: "Avis introuvable" };
    }

    await avis.update({ isApproved: true });

    return { success: true, message: "Avis approuvé avec succès", avis };
  }

  static async rejeterAvis(id) {
    const avis = await Avis.findByPk(id);
    if (!avis) {
      return { success: false, message: "Avis introuvable" };
    }

    await avis.destroy();

    return { success: true, message: "Avis supprimé avec succès" };
  }

  static async getAvisByProduit(produitId) {
    const avis = await Avis.findAll({
      where: { produitId, isApproved: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });

    const noteMoyenne = avis.length ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length : 0;

    return { success: true, avis, noteMoyenne };
  }
}

module.exports = GestionAvisService;
